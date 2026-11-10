
const express = require("express");
const router = express.Router();

const {
  getAllOrders,
  getOrderById,
  getMyOrders,
  getMyOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Customer routes
router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderById);

// All routes below require admin authentication
router.use(protect, adminOnly);

// Admin routes
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
