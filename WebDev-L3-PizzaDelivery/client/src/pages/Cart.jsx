
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatCurrency";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty. Please add a pizza first.");
      return;
    }

    navigate("/checkout");
  };

  // Empty cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 text-center">
        <div className="text-7xl">🛒</div>

        <h2 className="mt-5 text-2xl font-bold text-gray-800">
          Your cart is empty
        </h2>

        <p className="mt-2 text-gray-500">
          Add some delicious pizzas to get started.
        </p>

        <Link
          to="/"
          className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Your Shopping Cart 🛒
          </h1>

          <p className="mt-2 text-gray-500">
            Review your items before checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-28 w-full rounded-lg object-cover sm:w-28"
                  />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-lg bg-orange-50 text-5xl sm:w-28">
                    🍕
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-800">
                    {item.name}
                  </h3>

                  {item.isCustom ? (
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <p>Size: {item.size}</p>
                      <p>Crust: {item.crust}</p>
                      <p>Cheese: {item.cheese}</p>
                      <p>
                        Toppings:{" "}
                        {(item.toppings || []).join(", ") || "None"}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      {item.category} · {item.foodType}
                    </p>
                  )}

                  <p className="mt-2 font-semibold text-orange-600">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 rounded-lg border disabled:opacity-40"
                    >
                      -
                    </button>

                    <span className="font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= 10}
                      className="h-8 w-8 rounded-lg border disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="font-bold text-gray-800">
                    {formatCurrency(
                      Number(item.price) * Number(item.quantity)
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <aside className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">
              Order Summary
            </h2>

            <div className="mt-5 flex justify-between text-sm text-gray-600">
              <span>Items</span>
              <span>
                {cartItems.reduce(
                  (total, item) => total + Number(item.quantity),
                  0
                )}
              </span>
            </div>

            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="my-5 border-t" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-orange-600">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Delivery fee and tax will be calculated at checkout.
            </p>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/"
              className="mt-4 block text-center text-sm font-medium text-gray-500 hover:text-orange-600"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
