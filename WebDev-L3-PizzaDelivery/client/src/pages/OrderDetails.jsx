
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/my-orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load order"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleReorder = () => {
    if (!order?.items?.length) return;

    try {
      order.items.forEach((item) => {
        const product = {
          _id: item.pizza,
          id: item.pizza,
          name: item.name,
          price: Number(item.price),
          image: item.image || "",
          isCustom: Boolean(item.isCustom),
          size: item.size || "",
          crust: item.crust || "",
          cheese: item.cheese || "",
          toppings: item.toppings || [],
        };

        addToCart(product, item.quantity);
      });

      navigate("/cart");
    } catch (err) {
      console.error("Reorder error:", err);
      setError("Unable to reorder. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600">
          {error || "Order not found"}
        </p>
        <Link to="/my-orders" className="mt-4 inline-block text-orange-600">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const steps = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Out for Delivery",
    "Delivered",
  ];

  const currentStep = steps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
        <Link
          to="/my-orders"
          className="font-semibold text-orange-600"
        >
          ← Back to My Orders
        </Link>

        <h1 className="mt-6 text-2xl font-bold">
          Order Details
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Order #{order._id.slice(-8).toUpperCase()}
        </p>

        <div className="my-6 rounded-xl bg-gray-50 p-5">
          <h2 className="mb-4 font-bold">Order Tracking</h2>

          {order.orderStatus === "Cancelled" ? (
            <p className="font-semibold text-red-600">
              This order has been cancelled.
            </p>
          ) : (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      index <= currentStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index <= currentStep ? "✓" : index + 1}
                  </span>
                  <span
                    className={
                      index <= currentStep
                        ? "font-semibold text-green-700"
                        : "text-gray-500"
                    }
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="mb-4 font-bold">Ordered Items</h2>

        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div
              key={index}
              className="flex justify-between gap-3 border-b pb-3"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                  {item.size ? ` · ${item.size}` : ""}
                </p>
                {item.isCustom && (
                  <p className="text-xs text-gray-500">
                    {item.crust} · {item.cheese}
                  </p>
                )}
              </div>

              <p className="font-semibold">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-5">
          <h2 className="mb-3 font-bold">Delivery Address</h2>
          <p>{order.customerName}</p>
          <p>{order.customerPhone}</p>
          <p>{order.deliveryAddress?.street}</p>
          <p>
            {order.deliveryAddress?.city},{" "}
            {order.deliveryAddress?.state} -{" "}
            {order.deliveryAddress?.postalCode}
          </p>
        </div>

        <div className="mt-6 space-y-2 border-t pt-5">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{Number(order.subtotal).toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>₹{Number(order.deliveryFee).toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-t pt-3 text-xl font-bold">
            <span>Total</span>
            <span className="text-orange-600">
              ₹{Number(order.totalAmount).toFixed(2)}
            </span>
          </div>

          <p className="pt-2 text-sm text-gray-500">
            Payment Method: {order.paymentMethod}
          </p>
          <p className="text-sm text-gray-500">
            Payment Status: {order.paymentStatus}
          </p>
        </div>

        <button
          onClick={handleReorder}
          disabled={order.orderStatus === "Cancelled"}
          className="mt-8 w-full rounded-lg bg-orange-600 py-3 font-bold text-white hover:bg-orange-700 disabled:bg-gray-400"
        >
          🔄 Reorder
        </button>
      </div>
    </div>
  );
}
