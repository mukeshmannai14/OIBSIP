
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const initialAddress = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

function Checkout() {
  const navigate = useNavigate();

  const { cartItems, subtotal } = useCart();
  const { user, profile } = useAuth();

  const [address, setAddress] = useState(initialAddress);

  const [settings, setSettings] = useState({
    deliveryFee: 40,
    taxPercentage: 5,
    minimumOrder: 100,
    isStoreOpen: true,
    restaurantName: "PizzaHub",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load customer name
  useEffect(() => {
    setAddress((previous) => ({
      ...previous,
      fullName:
        profile?.name ||
        user?.displayName ||
        previous.fullName,
    }));
  }, [profile, user]);

  // Fetch public restaurant settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/settings/public");

        if (response.data?.success && response.data.settings) {
          setSettings((previous) => ({
            ...previous,
            ...response.data.settings,
          }));
        }
      } catch (error) {
        console.error("Settings loading error:", error);

        setFormError(
          "Unable to load restaurant settings. Please refresh the page."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Calculate tax
  const taxAmount = useMemo(() => {
    return (
      (Number(subtotal || 0) *
        Number(settings.taxPercentage || 0)) /
      100
    );
  }, [subtotal, settings.taxPercentage]);

  const deliveryFee = Number(settings.deliveryFee || 0);

  const totalAmount =
    Number(subtotal || 0) + taxAmount + deliveryFee;

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
    setSuccessMessage("");
  };

  // Validate delivery details
  const validateAddress = () => {
    if (!cartItems || cartItems.length === 0) {
      return "Your cart is empty. Please add items before checkout.";
    }

    if (!settings.isStoreOpen) {
      return "Sorry, our restaurant is currently closed.";
    }

    if (Number(subtotal) < Number(settings.minimumOrder)) {
      return `Minimum order amount is ₹${settings.minimumOrder}.`;
    }

    if (!address.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!address.address.trim()) {
      return "Please enter your delivery address.";
    }

    if (!address.city.trim()) {
      return "Please enter your city.";
    }

    if (!address.state.trim()) {
      return "Please enter your state.";
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      return "Please enter a valid 6-digit PIN code.";
    }

    return "";
  };

  // Validate and navigate to order review
  const handleContinue = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (loading) {
      setFormError("Please wait while checkout settings load.");
      return;
    }

    const error = validateAddress();

    if (error) {
      setFormError(error);
      return;
    }

    if (!user) {
      setFormError("Please login before continuing.");
      return;
    }

    setSubmitting(true);

    try {
      const deliveryAddress = {
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        address: address.address.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      };

      // Navigate to CheckoutReview page
      navigate("/checkout/review", {
        state: {
          address: deliveryAddress,
          items: cartItems,
          subtotal: Number(subtotal),
          deliveryFee,
          taxAmount,
          taxPercentage: Number(settings.taxPercentage),
          totalAmount,
        },
      });
    } catch (error) {
      console.error("Checkout navigation error:", error);
      setFormError("Unable to continue. Please try again.");
      setSubmitting(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold text-gray-600">
          Loading checkout...
        </p>
      </div>
    );
  }

  // Empty cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <h2 className="mb-3 text-2xl font-bold text-gray-800">
          Your cart is empty
        </h2>

        <p className="mb-6 text-gray-500">
          Add some delicious food before proceeding to checkout.
        </p>

        <Link
          to="/"
          className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
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
          <Link
            to="/cart"
            className="font-medium text-orange-600 hover:text-orange-700"
          >
            ← Back to Cart
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-500">
            Complete your delivery details to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Delivery Address Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleContinue}
              className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
            >
              <h2 className="mb-6 text-xl font-bold text-gray-800">
                Delivery Information
              </h2>

              {user && (
                <div className="mb-6 rounded-lg bg-orange-50 p-4">
                  <p className="text-sm text-gray-600">
                    Logged in as
                  </p>

                  <p className="font-semibold text-gray-800">
                    {profile?.name || user.displayName || user.email}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Mobile Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={address.phone}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    House No. / Street Address *
                  </label>

                  <textarea
                    name="address"
                    value={address.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter your complete delivery address"
                    required
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    State *
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    PIN Code *
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {formError && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {successMessage && (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !settings.isStoreOpen}
                className="mt-8 w-full rounded-lg bg-orange-500 px-6 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {submitting
                  ? "Continuing..."
                  : "Continue to Order Review"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-gray-800">
                Order Summary
              </h2>

              <div className="mb-5 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id || item.productId || item._id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-800">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="whitespace-nowrap font-semibold text-gray-800">
                      ₹
                      {(
                        Number(item.price) * Number(item.quantity)
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{Number(subtotal).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax ({settings.taxPercentage}%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-gray-400">
                Final order amount will be verified securely by the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
  