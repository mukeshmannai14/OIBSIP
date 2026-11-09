
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Ingredients", "Packaging", "Beverages", "Other"],
      default: "Ingredients",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
      enum: ["kg", "g", "litres", "ml", "pieces", "packets", "boxes"],
    },

    minStock: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },

    supplier: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Inventory ||
  mongoose.model("Inventory", inventorySchema);
