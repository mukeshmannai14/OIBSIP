
const express = require("express");
const router = express.Router();

const {
  getSettings,
  getPublicSettings,
  updateSettings,
} = require("../controllers/settingsController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Public route - customer checkout
router.get("/public", getPublicSettings);

// Admin-only routes
router.use(protect, adminOnly);

router.get("/", getSettings);
router.put("/", updateSettings);

module.exports = router;
