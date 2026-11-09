const Order = require("../models/Order");
const User = require("../models/User");

const getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const totalCustomers = await User.countDocuments({
      role: "user",
    });

    const paidOrders = await Order.find({
      paymentStatus: "Paid",
    }).lean();

    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + (Number(order.totalAmount) || 0),
      0
    );

    const averageOrderValue =
      paidOrders.length > 0
        ? totalRevenue / paidOrders.length
        : 0;

    const orderStatus = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          createdAt: { $type: "date" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const bestSellingPizzas = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          quantitySold: {
            $sum: { $ifNull: ["$items.quantity", 1] },
          },
          revenue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$items.price", 0] },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]);

    const customerGrowth = await User.aggregate([
      {
        $match: {
          role: "user",
          createdAt: { $type: "date" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          customers: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalCustomers,
        totalRevenue,
        averageOrderValue,
        paidOrders: paidOrders.length,
      },
      orderStatus,
      revenueByMonth,
      bestSellingPizzas,
      customerGrowth,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

module.exports = { getAnalytics };