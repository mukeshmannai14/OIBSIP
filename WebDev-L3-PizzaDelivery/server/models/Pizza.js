
const mongoose = require("mongoose");

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
