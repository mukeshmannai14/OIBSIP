
const crypto = require("crypto");
const mongoose = require("mongoose");

const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Pizza = require("../models/Pizza");
const Inventory = require("../models/Inventory");
const Settings = require("../models/Settings");

// Custom pizza pricing rules
const CUSTOM_PRICING = {
  base: 200,

  sizes: {
    Small: 0,
    Medium: 100,
    Large: 200,
  },

  crusts: {
    Classic: 0,
    "Thin Crust": 30,
    "Cheese Burst": 80,
    "Wheat Crust": 50,
  },

  cheeses: {
    Mozzarella: 40,
    Cheddar: 50,
    "Extra Cheese": 70,
  },

  toppings: {
    Onion: 20,
    Capsicum: 20,
    Tomato: 20,
    Mushroom: 30,
    Olives: 30,
    "Sweet Corn": 25,
    Paneer: 40,
    Chicken: 60,
  },
};

// Calculate custom pizza price on the server
const calculateCustomPizzaPrice = (item) => {
  const { size, crust, cheese, toppings = [] } = item;

  if (!Object.prototype.hasOwnProperty.call(CUSTOM_PRICING.sizes, size)) {
    throw new Error("Invalid custom pizza size");
  }

  if (!Object.prototype.hasOwnProperty.call(CUSTOM_PRICING.crusts, crust)) {
    throw new Error("Invalid custom pizza crust");
  }

  if (!Object.prototype.hasOwnProperty.call(CUSTOM_PRICING.cheeses, cheese)) {
    throw new Error("Invalid custom pizza cheese");
  }

  if (
    !Array.isArray(toppings) ||
    new Set(toppings).size !== toppings.length ||
    toppings.some(
      (topping) =>
        !Object.prototype.hasOwnProperty.call(
          CUSTOM_PRICING.toppings,
          topping
        )
    )
  ) {
    throw new Error("Invalid custom pizza toppings");
  }

  const toppingTotal = toppings.reduce(
    (total, topping) => total + CUSTOM_PRICING.toppings[topping],
    0
  );

  return (
    CUSTOM_PRICING.base +
    CUSTOM_PRICING.sizes[size] +
    CUSTOM_PRICING.crusts[crust] +
    CUSTOM_PRICING.cheeses[cheese] +
    toppingTotal
  );
};

// Build ingredient requirements for an order
const buildIngredientRequirements = async (order) => {
  const requirements = new Map();

  const addRequirement = (key, quantity, unit) => {
    if (!key || !Number.isFinite(quantity) || quantity <= 0 || !unit) {
      throw new Error(`Invalid ingredient recipe: ${key || "Unknown"}`);
    }

    const normalizedKey = key.trim().toLowerCase();

    const existing = requirements.get(normalizedKey);

    if (existing && existing.unit !== unit) {
      throw new Error(`Unit mismatch for ingredient: ${normalizedKey}`);
    }

    requirements.set(normalizedKey, {
      ingredientKey: normalizedKey,
      quantity:
        (existing?.quantity || 0) + quantity,
      unit,
    });
  };

  for (const item of order.items) {
    if (!item.isCustom) {
      if (!item.pizza) {
        throw new Error(`Pizza reference missing for ${item.name}`);
      }

      const pizza = await Pizza.findById(item.pizza).lean();

      if (!pizza || !pizza.ingredients?.length) {
        throw new Error(
          `Ingredient recipe is not configured for ${item.name}`
        );
      }

      for (const ingredient of pizza.ingredients) {
        addRequirement(
          ingredient.ingredientKey,
          ingredient.quantity * item.quantity,
          ingredient.unit
        );
      }

      continue;
    }

    // Custom pizza inventory key convention:
    // pizza_base
    // crust_classic
    // cheese_mozzarella
    // topping_onion
    //
    // Each corresponding Inventory item must have
    // its usagePerPizza configured by the admin.

    const customKeys = [
      "pizza_base",
      `crust_${item.crust}`,
      `cheese_${item.cheese}`,
      ...item.toppings.map((topping) => `topping_${topping}`),
    ].map((key) => key.toLowerCase().replace(/\s+/g, "_"));

    const uniqueKeys = [...new Set(customKeys)];

    const customIngredients = await Inventory.find({
      category: "Ingredients",
      ingredientKey: { $in: uniqueKeys },
      isActive: true,
    }).lean();

    const ingredientMap = new Map(
      customIngredients.map((ingredient) => [
        ingredient.ingredientKey,
        ingredient,
      ])
    );

    for (const key of uniqueKeys) {
      const ingredient = ingredientMap.get(key);

      if (!ingredient) {
        throw new Error(
          `Custom pizza ingredient mapping missing: ${key}`
        );
      }

      if (
        !Number.isFinite(ingredient.usagePerPizza) ||
        ingredient.usagePerPizza <= 0
      ) {
        throw new Error(
          `Usage per pizza is not configured for ${ingredient.name}`
        );
      }

      addRequirement(
        key,
        ingredient.usagePerPizza * item.quantity,
        ingredient.unit
      );
    }
  }

  if (requirements.size === 0) {
    throw new Error("No ingredient requirements found");
  }

  return [...requirements.values()];
};

// Deduct ingredients and mark payment in one transaction
const deductIngredientsAndConfirmOrder = async (
  orderId,
  paymentId
) => {
  const requirementsOrder = await Order.findById(orderId);

  if (!requirementsOrder) {
    throw new Error("Order not found");
  }

  const requirements = await buildIngredientRequirements(
    requirementsOrder
  );

  const session = await mongoose.startSession();

  try {
    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new Error("Order not found");
      }

      // Idempotency protection
      if (order.paymentStatus === "Paid") {
        if (order.razorpayPaymentId === paymentId) {
          updatedOrder = order;
          return;
        }

        throw new Error("Order has already been paid");
      }

      if (order.paymentStatus !== "Pending") {
        throw new Error("Order is not awaiting payment");
      }

      for (const requirement of requirements) {
        // Only Ingredients are eligible for deduction.
        // Packaging, Beverages and Other are never deducted.
        const result = await Inventory.updateOne(
          {
            ingredientKey: requirement.ingredientKey,
            category: "Ingredients",
            isActive: true,
            unit: requirement.unit,
            quantity: { $gte: requirement.quantity },
          },
          {
            $inc: {
              quantity: -requirement.quantity,
            },
          },
          { session }
        );

        if (result.modifiedCount !== 1) {
          throw new Error(
            `Insufficient stock or inventory mismatch: ${requirement.ingredientKey}`
          );
        }
      }

      order.paymentStatus = "Paid";
      order.razorpayPaymentId = paymentId;
      order.orderStatus = "Confirmed";

      order.inventoryDeduction = {
        status: "Completed",
        deductedAt: new Date(),
        error: "",
      };

      await order.save({ session });

      updatedOrder = order;
    });

    return updatedOrder;
  } finally {
    await session.endSession();
  }
};

// Record captured payment even if inventory deduction fails.
// This prevents a successfully captured payment being treated as unpaid.
const recordPaidOrderWithInventoryFailure = async (
  orderId,
  paymentId,
  error
) => {
  return Order.findOneAndUpdate(
    {
      _id: orderId,
      paymentStatus: "Pending",
    },
    {
      $set: {
        paymentStatus: "Paid",
        razorpayPaymentId: paymentId,
        orderStatus: "Confirmed",
        inventoryDeduction: {
          status: "Failed",
          deductedAt: null,
          error: String(error.message || error).slice(0, 500),
        },
      },
    },
    { new: true }
  );
};

// Create Razorpay order
const createPaymentOrder = async (req, res) => {
  let savedOrder;

  try {
    const { items, address } = req.body;
    const firebaseUser = req.firebaseUser;

    if (!firebaseUser?.uid || !firebaseUser?.email) {
      return res.status(401).json({
        success: false,
        message: "Authenticated customer details are missing",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (items.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Too many items in your order",
      });
    }

    if (!address || typeof address !== "object") {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    const {
      fullName,
      phone,
      address: street,
      city,
      state,
      pincode,
    } = address;

    if (
      ![fullName, phone, street, city, state, pincode].every(
        (value) => typeof value === "string" && value.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete delivery details",
      });
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid PIN code",
      });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    if (!settings.isStoreOpen) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is currently closed",
      });
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 10
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid item quantity",
        });
      }

      let unitPrice;
      let verifiedItem;

      if (item.isCustom === true) {
        unitPrice = calculateCustomPizzaPrice(item);

        verifiedItem = {
          pizza: null,
          isCustom: true,
          name: "Custom Pizza",
          image: "",
          quantity,
          size: item.size,
          crust: item.crust,
          cheese: item.cheese,
          toppings: item.toppings,
          price: unitPrice,
        };
      } else {
        const productId = item.productId || item.id;

        if (!productId || !/^[a-f\d]{24}$/i.test(String(productId))) {
          return res.status(400).json({
            success: false,
            message: "Invalid pizza product ID",
          });
        }

        const pizza = await Pizza.findOne({
          _id: productId,
          isAvailable: true,
        });

        if (!pizza) {
          return res.status(400).json({
            success: false,
            message: "One of your selected products is unavailable",
          });
        }

        unitPrice = pizza.price;

        const size = ["Small", "Medium", "Large"].includes(item.size)
          ? item.size
          : "Medium";

        verifiedItem = {
          pizza: pizza._id,
          isCustom: false,
          name: pizza.name,
          image: pizza.image || "",
          quantity,
          size,
          crust: "",
          cheese: "",
          toppings: [],
          price: unitPrice,
        };
      }

      subtotal += unitPrice * quantity;
      verifiedItems.push(verifiedItem);
    }

    if (subtotal < settings.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${settings.minimumOrder}`,
      });
    }

    const deliveryFee = Number(settings.deliveryFee || 0);

    const taxAmount = Number(
      ((subtotal * Number(settings.taxPercentage || 0)) / 100).toFixed(2)
    );

    const totalAmount = Number(
      (subtotal + deliveryFee + taxAmount).toFixed(2)
    );

    const amountInPaise = Math.round(totalAmount * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    savedOrder = await Order.create({
      firebaseUid: firebaseUser.uid,
      customerName: fullName.trim(),
      customerEmail: firebaseUser.email,
      customerPhone: phone.trim(),
      items: verifiedItems,
      deliveryAddress: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: pincode.trim(),
      },
      subtotal,
      deliveryFee,
      taxAmount,
      taxPercentage: Number(settings.taxPercentage || 0),
      totalAmount,
      paymentMethod: "Razorpay",
      paymentStatus: "Pending",
      orderStatus: "Pending",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${savedOrder._id}`,
      notes: {
        mongoOrderId: savedOrder._id.toString(),
        firebaseUid: firebaseUser.uid,
      },
    });

    savedOrder.razorpayOrderId = razorpayOrder.id;
    await savedOrder.save();

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: savedOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      customer: {
        name: fullName.trim(),
        email: firebaseUser.email,
        contact: phone.trim(),
      },
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create payment order",
    });
  }
};

// Verify Razorpay payment and deduct ingredients
const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      firebaseUid: req.firebaseUser.uid,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.paymentStatus === "Paid" &&
      order.razorpayPaymentId === razorpay_payment_id
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        inventoryDeduction: order.inventoryDeduction,
        order,
      });
    }

    if (order.paymentStatus === "Paid") {
      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID does not match",
      });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(generatedSignature, "hex");
    const receivedSignatureBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      signatureBuffer.length !== receivedSignatureBuffer.length ||
      !crypto.timingSafeEqual(
        signatureBuffer,
        receivedSignatureBuffer
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Verify captured payment directly with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR" ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not successfully captured",
      });
    }

    let updatedOrder;

    try {
      updatedOrder = await deductIngredientsAndConfirmOrder(
        order._id,
        razorpay_payment_id
      );
    } catch (inventoryError) {
      console.error("Inventory deduction failed:", inventoryError);

      updatedOrder = await recordPaidOrderWithInventoryFailure(
        order._id,
        razorpay_payment_id,
        inventoryError
      );

      if (!updatedOrder) {
        const latestOrder = await Order.findById(order._id);

        if (
          latestOrder?.paymentStatus === "Paid" &&
          latestOrder.razorpayPaymentId === razorpay_payment_id
        ) {
          return res.status(200).json({
            success: true,
            message: "Payment already verified",
            inventoryDeduction: latestOrder.inventoryDeduction,
            order: latestOrder,
          });
        }

        throw inventoryError;
      }

      return res.status(200).json({
        success: true,
        paymentStatus: "Paid",
        inventoryDeduction: "Failed",
        message:
          "Payment captured successfully, but inventory deduction needs admin attention.",
        order: updatedOrder,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and ingredient stock deducted successfully",
      inventoryDeduction: "Completed",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};
