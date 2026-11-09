
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const COLORS = [
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#eab308",
];

const formatMonth = ({ year, month }) => {
  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/analytics");

      setAnalytics(response.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-gray-500">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6">
        <p className="text-red-600">{error}</p>

        <button
          onClick={fetchAnalytics}
          className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  const {
    stats,
    revenueByMonth = [],
    orderStatus = [],
    bestSellingPizzas = [],
    customerGrowth = [],
  } = analytics;

  const revenueData = revenueByMonth.map((item) => ({
    month: formatMonth(item._id),
    revenue: item.revenue,
    orders: item.orders,
  }));

  const customerData = customerGrowth.map((item) => ({
    month: formatMonth(item._id),
    customers: item.customers,
  }));

  const statusData = orderStatus.map((item) => ({
    name: item._id || "Unknown",
    value: item.count,
  }));

  const pizzaData = bestSellingPizzas.map((item) => ({
    name: item._id || "Unknown",
    quantity: item.quantitySold,
    revenue: item.revenue,
  }));

  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: "💰",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "🛒",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: "👥",
    },
    {
      title: "Average Paid Order",
      value: formatCurrency(stats.averageOrderValue),
      icon: "📈",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Analytics Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Business performance and sales insights
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600"
        >
          Refresh Analytics
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 text-3xl">
              {card.icon}
            </div>

            <p className="text-sm text-gray-500">
              {card.title}
            </p>

            <h3 className="mt-2 text-2xl font-bold text-gray-800">
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-800">
          Monthly Revenue
        </h3>

        {revenueData.length === 0 ? (
          <p className="py-16 text-center text-gray-500">
            No paid order revenue available yet.
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis
                  width={90}
                  tickFormatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  fill="#fed7aa"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Best Selling Pizzas */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-800">
            Best-Selling Products
          </h3>

          {pizzaData.length === 0 ? (
            <p className="py-16 text-center text-gray-500">
              No product sales data available.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pizzaData}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis type="number" />

                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="quantity"
                    fill="#f97316"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-800">
            Order Status Distribution
          </h3>

          {statusData.length === 0 ? (
            <p className="py-16 text-center text-gray-500">
              No orders available.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
                    label
                  >
                    {statusData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Customer Growth */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-800">
          Monthly New Customers
        </h3>

        {customerData.length === 0 ? (
          <p className="py-16 text-center text-gray-500">
            No customer registration data available.
          </p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="customers"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
