
const Settings = require("../models/Settings");

// Admin: Get all settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

// Public: Get settings required for customer checkout
const getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    return res.status(200).json({
      success: true,
      settings: {
        restaurantName: settings.restaurantName,
        deliveryFee: settings.deliveryFee,
        taxPercentage: settings.taxPercentage,
        minimumOrder: settings.minimumOrder,
        isStoreOpen: settings.isStoreOpen,
      },
    });
  } catch (error) {
    console.error("Get public settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public settings",
    });
  }
};

// Admin: Update settings
const updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      "restaurantName",
      "restaurantEmail",
      "restaurantPhone",
      "restaurantAddress",
      "deliveryFee",
      "taxPercentage",
      "minimumOrder",
      "isStoreOpen",
      "emailNotifications",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (
      updates.deliveryFee !== undefined &&
      (!Number.isFinite(Number(updates.deliveryFee)) ||
        Number(updates.deliveryFee) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery fee must be a valid non-negative number",
      });
    }

    if (
      updates.minimumOrder !== undefined &&
      (!Number.isFinite(Number(updates.minimumOrder)) ||
        Number(updates.minimumOrder) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum order must be a valid non-negative number",
      });
    }

    if (
      updates.taxPercentage !== undefined &&
      (!Number.isFinite(Number(updates.taxPercentage)) ||
        Number(updates.taxPercentage) < 0 ||
        Number(updates.taxPercentage) > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Tax percentage must be between 0 and 100",
      });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};

module.exports = {
  getSettings,
  getPublicSettings,
  updateSettings,
};
