
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {
  getDashboardStats,
} = require("../controllers/adminController");

// Verify admin access
router.get("/verify", protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access verified",
    admin: {
      uid: req.dbUser.firebaseUid,
      role: req.dbUser.role,
    },
  });
});

// Get live dashboard statistics
router.get("/dashboard", protect, adminOnly, getDashboardStats);

module.exports = router;
