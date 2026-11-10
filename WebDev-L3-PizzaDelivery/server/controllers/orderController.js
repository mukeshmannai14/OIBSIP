
const mongoose = require("mongoose");
const Order = require("../models/Order");

const ALLOWED_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const STATUS_FLOW = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

// GET all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// GET single order by ID (Admin only)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// GET logged-in customer's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      firebaseUid: req.firebaseUser.uid,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};

// GET one order belonging to logged-in customer
const getMyOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      firebaseUid: req.firebaseUser.uid,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get my order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// UPDATE order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!ALLOWED_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only paid orders can be processed.
    if (orderStatus !== "Cancelled" && order.paymentStatus !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can be processed",
      });
    }

    if (order.orderStatus === orderStatus) {
      return res.status(200).json({
        success: true,
        message: "Order already has this status",
        order,
      });
    }

    const allowedNextStatuses = STATUS_FLOW[order.orderStatus] || [];

    if (!allowedNextStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change order status from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    // Only allow cancellation before preparation starts.
    if (
      orderStatus === "Cancelled" &&
      order.orderStatus !== "Pending" &&
      order.orderStatus !== "Confirmed"
    ) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be cancelled",
      });
    }

    order.orderStatus = orderStatus;

    order.statusHistory.push({
      status: orderStatus,
      updatedAt: new Date(),
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getMyOrders,
  getMyOrderById,
  updateOrderStatus,
};
