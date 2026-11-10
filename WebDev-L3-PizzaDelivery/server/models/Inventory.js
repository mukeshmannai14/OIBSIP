
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

    // Connects inventory items with pizza recipes
    ingredientKey: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
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

    // Ingredient quantity consumed for one pizza
    usagePerPizza: {
      type: Number,
      min: 0,
      default: 0,
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

    isActive: {
      type: Boolean,
      default: true,
    },

    // Low-stock email notification tracking
    lowStockAlertSent: {
      type: Boolean,
      default: false,
    },

    lowStockAlertSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Only ingredients can be configured for automatic deduction
inventorySchema.pre("validate", function (next) {
  if (this.category !== "Ingredients") {
    this.ingredientKey = "";
    this.usagePerPizza = 0;
  }

  next();
});

module.exports =
  mongoose.models.Inventory ||
  mongoose.model("Inventory", inventorySchema);
