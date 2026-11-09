
const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");

// GET all inventory items
const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

// CREATE inventory item
const createInventory = async (req, res) => {
  try {
    const { name, category, quantity, unit, minStock, supplier } = req.body;

    const item = await Inventory.create({
      name,
      category,
      quantity,
      unit,
      minStock,
      supplier,
    });

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      item,
    });
  } catch (error) {
    console.error("Create inventory error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE inventory item
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "quantity",
      "unit",
      "minStock",
      "supplier",
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
        message: "No valid fields provided",
      });
    }

    const item = await Inventory.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE inventory item
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const item = await Inventory.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
    });
  }
};

module.exports = {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
};
