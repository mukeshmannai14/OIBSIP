
const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");

const VALID_CATEGORIES = [
  "Ingredients",
  "Packaging",
  "Beverages",
  "Other",
];

const VALID_UNITS = [
  "kg",
  "g",
  "litres",
  "ml",
  "pieces",
  "packets",
  "boxes",
];

// Normalize and validate inventory data
const validateInventoryData = (data) => {
  const {
    name,
    category = "Ingredients",
    quantity,
    unit,
    minStock = 5,
    supplier = "",
    ingredientKey = "",
    usagePerPizza = 0,
    isActive = true,
  } = data;

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Inventory name is required");
  }

  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error("Invalid inventory category");
  }

  if (!VALID_UNITS.includes(unit)) {
    throw new Error("Invalid inventory unit");
  }

  if (
    quantity === undefined ||
    !Number.isFinite(Number(quantity)) ||
    Number(quantity) < 0
  ) {
    throw new Error("Quantity must be a valid non-negative number");
  }

  if (
    !Number.isFinite(Number(minStock)) ||
    Number(minStock) < 0
  ) {
    throw new Error("Minimum stock must be a non-negative number");
  }

  if (typeof supplier !== "string") {
    throw new Error("Invalid supplier");
  }

  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be true or false");
  }

  let normalizedIngredientKey = "";
  let normalizedUsage = 0;

  if (category === "Ingredients") {
    if (typeof ingredientKey !== "string" || !ingredientKey.trim()) {
      throw new Error("Ingredient key is required for ingredients");
    }

    normalizedIngredientKey = ingredientKey
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    if (!/^[a-z0-9_-]+$/.test(normalizedIngredientKey)) {
      throw new Error("Ingredient key contains invalid characters");
    }

    normalizedUsage = Number(usagePerPizza);

    if (
      !Number.isFinite(normalizedUsage) ||
      normalizedUsage < 0
    ) {
      throw new Error("Usage per pizza must be a non-negative number");
    }
  }

  return {
    name: name.trim(),
    category,
    quantity: Number(quantity),
    unit,
    minStock: Number(minStock),
    supplier: supplier.trim(),
    ingredientKey: normalizedIngredientKey,
    usagePerPizza: normalizedUsage,
    isActive,
  };
};

// Check whether another ingredient already uses this key
const checkDuplicateIngredientKey = async (
  ingredientKey,
  excludeId = null
) => {
  if (!ingredientKey) return false;

  const query = {
    category: "Ingredients",
    ingredientKey,
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await Inventory.findOne(query).lean();

  return Boolean(existing);
};

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
    const data = validateInventoryData(req.body);

    if (await checkDuplicateIngredientKey(data.ingredientKey)) {
      return res.status(409).json({
        success: false,
        message: "This ingredient key already exists",
      });
    }

    const item = await Inventory.create(data);

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      item,
    });
  } catch (error) {
    console.error("Create inventory error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create inventory item",
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

    const existingItem = await Inventory.findById(id);

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "quantity",
      "unit",
      "minStock",
      "supplier",
      "ingredientKey",
      "usagePerPizza",
      "isActive",
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

    // Validate the complete updated document
    const mergedData = {
      name: existingItem.name,
      category: existingItem.category,
      quantity: existingItem.quantity,
      unit: existingItem.unit,
      minStock: existingItem.minStock,
      supplier: existingItem.supplier,
      ingredientKey: existingItem.ingredientKey,
      usagePerPizza: existingItem.usagePerPizza,
      isActive: existingItem.isActive,
      ...updates,
    };

    const validatedData = validateInventoryData(mergedData);

    if (
      await checkDuplicateIngredientKey(
        validatedData.ingredientKey,
        id
      )
    ) {
      return res.status(409).json({
        success: false,
        message: "This ingredient key already exists",
      });
    }

    Object.assign(existingItem, validatedData);

    // Reset alert after restocking above minimum stock,
    // or when the inventory item is deactivated.
    if (
      existingItem.quantity > existingItem.minStock ||
      !existingItem.isActive
    ) {
      existingItem.lowStockAlertSent = false;
      existingItem.lowStockAlertSentAt = null;
    }

    await existingItem.save();

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      item: existingItem,
    });
  } catch (error) {
    console.error("Update inventory error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update inventory",
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
