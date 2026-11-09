
const User = require("../models/User");
const Order = require("../models/Order");

// GET all registered customers with order statistics
const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "user",
    })
      .select("firebaseUid name email photoURL createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const customerIds = customers.map(
      (customer) => customer.firebaseUid
    );

    const orderStats = await Order.aggregate([
      {
        $match: {
          firebaseUid: { $in: customerIds },
        },
      },
      {
        $group: {
          _id: "$firebaseUid",
          totalOrders: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "Paid"] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsMap = new Map(
      orderStats.map((stat) => [stat._id, stat])
    );

    const result = customers.map((customer) => {
      const stats = statsMap.get(customer.firebaseUid);

      return {
        ...customer,
        totalOrders: stats?.totalOrders || 0,
        totalSpent: stats?.totalSpent || 0,
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      customers: result,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

// GET individual customer order history
const getCustomerOrders = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    const customer = await User.findOne({
      firebaseUid,
      role: "user",
    }).select("firebaseUid name email photoURL");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const orders = await Order.find({ firebaseUid }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      customer,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders",
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerOrders,
};
