
const User = require("../models/User");
const Order = require("../models/Order");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      totalCustomers,
      pendingOrders,
      revenueResult,
      recentOrders,
      orderStatusStats,
    ] = await Promise.all([
      // Total orders
      Order.countDocuments(),

      // Registered customers (exclude admins)
      User.countDocuments({ role: "user" }),

      // Pending orders
      Order.countDocuments({ orderStatus: "Pending" }),

      // Revenue from paid orders only
      Order.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),

      // Latest five orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "customerName customerEmail items totalAmount paymentStatus orderStatus createdAt"
        )
        .lean(),

      // Order status breakdown
      Order.aggregate([
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const statusBreakdown = {
      Pending: 0,
      Confirmed: 0,
      Preparing: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orderStatusStats.forEach((item) => {
      statusBreakdown[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        pendingOrders,
        statusBreakdown,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

module.exports = { getDashboardStats };
