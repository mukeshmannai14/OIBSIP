
const express = require("express");
const router = express.Router();

// Pizza controllers
const {
  getPizzas,
  getAllPizzas,
  createPizza,
  updatePizza,
  deletePizza,
} = require("../controllers/pizzaController");

// Authentication middleware
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// ==========================================
// PUBLIC CUSTOMER ROUTES
// ==========================================

// Get available pizzas
router.get("/", getPizzas);

// ==========================================
// ADMIN-ONLY ROUTES
// ==========================================

// Get all pizzas, including unavailable pizzas
router.get("/admin/all", protect, adminOnly, getAllPizzas);

// Create pizza
router.post("/", protect, adminOnly, createPizza);

// Update pizza
router.put("/:id", protect, adminOnly, updatePizza);

// Delete pizza
router.delete("/:id", protect, adminOnly, deletePizza);

// Export router
module.exports = router;
