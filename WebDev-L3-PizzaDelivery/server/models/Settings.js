const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      default: "PizzaHub",
      trim: true,
    },
    restaurantEmail: {
      type: String,
      default: "",
      trim: true,
    },
    restaurantPhone: {
      type: String,
      default: "",
      trim: true,
    },
    restaurantAddress: {
      type: String,
      default: "",
      trim: true,
    },
    deliveryFee: {
      type: Number,
      default: 40,
      min: 0,
    },
    taxPercentage: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    minimumOrder: {
      type: Number,
      default: 100,
      min: 0,
    },
    isStoreOpen: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Settings ||
  mongoose.model("Settings", settingsSchema);