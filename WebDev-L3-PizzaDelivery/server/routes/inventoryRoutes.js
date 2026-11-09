
const express = require("express");
const router = express.Router();

const {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// All inventory operations require admin authentication
router.use(protect, adminOnly);

router.get("/", getInventory);
router.post("/", createInventory);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

module.exports = router;
