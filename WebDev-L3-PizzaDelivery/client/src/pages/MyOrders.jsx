
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data.orders || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          My Orders 🍕
        </h1>

        <p className="mb-8 text-gray-500">
          Track your PizzaHub orders.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {!error && orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <p className="text-5xl">🍕</p>
            <h2 className="mt-4 text-xl font-bold">
              No Orders Yet!
            </h2>
            <p className="mt-2 text-gray-500">
              You haven't placed any orders.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white"
            >
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-xl bg-white p-5 shadow"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <span className="h-fit rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                    {order.orderStatus}
                  </span>
                </div>

                <div className="my-4 space-y-2">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <div>
                    <p className="font-bold text-orange-600">
                      Total: ₹{Number(order.totalAmount).toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Payment: {order.paymentStatus}
                    </p>
                  </div>

                  <Link
                    to={`/my-orders/${order._id}`}
                    className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/"
          className="mt-8 inline-block font-semibold text-orange-600"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
