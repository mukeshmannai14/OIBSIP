
const mongoose = require("mongoose");
const Pizza = require("../models/Pizza");

// ==========================================
// GET AVAILABLE PIZZAS (PUBLIC CUSTOMER API)
// ==========================================
const getPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.find({
      isAvailable: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    console.error("Get pizzas error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pizzas",
    });
  }
};

// ==========================================
// GET ALL PIZZAS (ADMIN ONLY)
// ==========================================
const getAllPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    console.error("Get all pizzas error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch all pizzas",
    });
  }
};

// ==========================================
// CREATE NEW PIZZA (ADMIN ONLY)
// ==========================================
const createPizza = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      foodType,
      isAvailable,
    } = req.body;

    const pizza = await Pizza.create({
      name,
      description,
      price,
      image,
      category,
      foodType: foodType || "Pizza",
      isAvailable: isAvailable ?? true,
    });

    return res.status(201).json({
      success: true,
      message: "Pizza created successfully",
      pizza,
    });
  } catch (error) {
    console.error("Create pizza error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE PIZZA (ADMIN ONLY)
// ==========================================
const updatePizza = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID",
      });
    }

    // Only allow these fields to be updated
    const allowedFields = [
      "name",
      "description",
      "price",
      "image",
      "category",
      "foodType",
      "isAvailable",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const pizza = await Pizza.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pizza updated successfully",
      pizza,
    });
  } catch (error) {
    console.error("Update pizza error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE PIZZA (ADMIN ONLY)
// ==========================================
const deletePizza = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID",
      });
    }

    const pizza = await Pizza.findByIdAndDelete(id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pizza deleted successfully",
    });
  } catch (error) {
    console.error("Delete pizza error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete pizza",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  getPizzas,
  getAllPizzas,
  createPizza,
  updatePizza,
  deletePizza,
};
