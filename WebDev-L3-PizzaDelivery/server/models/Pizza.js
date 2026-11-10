
const mongoose = require("mongoose");

const pizzaIngredientSchema = new mongoose.Schema(
  {
    ingredientKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },

    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "litres", "ml", "pieces", "packets", "boxes"],
    },
  },
  { _id: false }
);

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: ["Veg", "Non-Veg"],
      required: true,
    },

    foodType: {
      type: String,
      enum: ["Pizza", "Burger", "Noodles"],
      default: "Pizza",
    },

    // Ingredients required to prepare one unit of this product
    ingredients: {
      type: [pizzaIngredientSchema],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Pizza ||
  mongoose.model("Pizza", pizzaSchema);
