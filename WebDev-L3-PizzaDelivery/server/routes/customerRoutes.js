
const express = require("express");
const router = express.Router();

const {
  getCustomers,
  getCustomerOrders,
} = require("../controllers/customerController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.use(protect, adminOnly);

router.get("/", getCustomers);
router.get("/:firebaseUid/orders", getCustomerOrders);

module.exports = router;
