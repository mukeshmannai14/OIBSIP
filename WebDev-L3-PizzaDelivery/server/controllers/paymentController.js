
const crypto = require("crypto");

const razorpay = require("../config/razorpay");
const Order = require("../models/Order");
const Pizza = require("../models/Pizza");
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

    // Read restaurant settings
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

    // Calculate and validate cart items
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

    // Save pending order in MongoDB
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
      totalAmount,
      paymentMethod: "Razorpay",
      paymentStatus: "Pending",
      orderStatus: "Pending",
    });

    // Create Razorpay order
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

// Verify Razorpay payment
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

    if (order.paymentStatus === "Paid") {
      if (order.razorpayPaymentId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          order,
        });
      }

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

    // Confirm payment details directly with Razorpay
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

    order.paymentStatus = "Paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.orderStatus = "Confirmed";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
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
