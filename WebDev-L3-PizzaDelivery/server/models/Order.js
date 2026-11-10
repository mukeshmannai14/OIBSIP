
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    pizza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pizza",
      default: null,
    },

    isCustom: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      default: "Medium",
    },

    crust: {
      type: String,
      default: "",
    },

    cheese: {
      type: String,
      default: "",
    },

    toppings: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
    },

    customerPhone: {
      type: String,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one item",
      },
    },

    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD"],
      default: "Razorpay",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    // Inventory deduction tracking
    inventoryDeduction: {
      status: {
        type: String,
        enum: ["Not Started", "Completed", "Failed", "Partial"],
        default: "Not Started",
      },

      deductedAt: {
        type: Date,
        default: null,
      },

      error: {
        type: String,
        default: "",
      },
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
