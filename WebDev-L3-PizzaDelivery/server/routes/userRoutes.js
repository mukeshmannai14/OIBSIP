
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  syncUser,
  getProfile,
} = require("../controllers/userController");

router.post("/sync", protect, syncUser);
router.get("/me", protect, getProfile);

module.exports = router;
