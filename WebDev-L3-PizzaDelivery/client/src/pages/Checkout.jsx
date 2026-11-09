
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

const initialAddress = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const Checkout = () => {
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

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState("");
  const [formError, setFormError] = useState("");

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
        setLoadingSettings(true);
        setSettingsError("");

        const response = await api.get("/settings/public");

        if (response.data?.success && response.data?.settings) {
          setSettings((previous) => ({
            ...previous,
            ...response.data.settings,
          }));
        } else {
          throw new Error("Invalid settings response");
        }
      } catch (error) {
        console.error("Checkout settings error:", error);

        setSettingsError(
          error.response?.data?.message ||
            "Unable to load restaurant settings. Please refresh the page."
        );
      } finally {
        setLoadingSettings(false);
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

  // Delivery fee
  const deliveryFee = Number(settings.deliveryFee || 0);

  // Final amount
  const totalAmount =
    Number(subtotal || 0) + taxAmount + deliveryFee;

  // Address input handler
  const handleChange = (event) => {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  // Continue to order review
  const handleContinue = (event) => {
    event.preventDefault();
    setFormError("");

    if (!cartItems.length) {
      setFormError("Your cart is empty.");
      return;
    }

    if (loadingSettings || settingsError) {
      setFormError("Restaurant settings are not available. Please try again.");
      return;
    }

    if (!settings.isStoreOpen) {
      setFormError("The restaurant is currently closed.");
      return;
    }

    if (Number(subtotal) < Number(settings.minimumOrder)) {
      setFormError(
        `Minimum order amount is ${formatCurrency(settings.minimumOrder)}.`
      );
      return;
    }

    if (!address.fullName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      setFormError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!address.address.trim()) {
      setFormError("Please enter your delivery address.");
      return;
    }

    if (!address.city.trim()) {
      setFormError("Please enter your city.");
      return;
    }

    if (!address.state.trim()) {
      setFormError("Please enter your state.");
      return;
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setFormError("Enter a valid 6-digit PIN code.");
      return;
    }

    // Navigate to review page
    navigate("/checkout/review", {
      state: {
        address: {
          ...address,
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          address: address.address.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
        },
        items: cartItems,
        subtotal: Number(subtotal),
        deliveryFee,
        taxAmount,
        taxPercentage: Number(settings.taxPercentage),
        totalAmount,
      },
    });
  };

  // Empty cart
  if (!cartItems.length) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl">🛒</div>

        <h2 className="mt-5 text-2xl font-bold text-gray-800">
          Your cart is empty
        </h2>

        <Link
          to="/"
          className="mt-5 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-orange-500">
            {settings.restaurantName}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-800">
            Checkout
          </h1>

          <p className="mt-2 text-gray-500">
            Enter your delivery details to continue.
          </p>
        </div>

        {/* Settings error */}
        {settingsError && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {settingsError}
          </div>
        )}

        {/* Store closed */}
        {!settings.isStoreOpen && !loadingSettings && (
          <div className="mb-5 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            The restaurant is currently closed and cannot accept orders.
          </div>
        )}

        <form
          onSubmit={handleContinue}
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3"
        >

          {/* Delivery Address */}
          <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">

            <h2 className="mb-6 text-xl font-bold text-gray-800">
              Delivery Address
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>

                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  value={user?.email || ""}
                  readOnly
                  className="w-full rounded-lg border bg-gray-50 p-3 text-gray-500 outline-none"
                />
              </div>

              {/* Phone */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mobile Number *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                  className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  House / Street Address *
                </label>

                <textarea
                  name="address"
                  value={address.address}
                  onChange={handleChange}
                  placeholder="Enter house number, street and area"
                  rows={3}
                  required
                  className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* City */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  City *
                </label>

                <input
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* State */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  State *
                </label>

                <input
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
                />
              </div>

              {/* PIN Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  PIN Code *
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={address.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  required
                  className="w-full rounded-lg border p-3 outline-none focus:border-orange-500"
                />
              </div>

            </div>

            {/* Form Error */}
            {formError && (
              <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}
          </section>

          {/* Order Summary */}
          <aside className="h-fit rounded-xl border bg-white p-5 shadow-sm">

            <h2 className="text-lg font-bold text-gray-800">
              Order Summary
            </h2>

            <div className="mt-5 max-h-64 space-y-4 overflow-y-auto">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.name}
                    </p>

                    <p className="text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    {item.isCustom && (
                      <p className="text-xs text-orange-600">
                        Custom Pizza
                      </p>
                    )}
                  </div>

                  <span className="font-semibold text-gray-700">
                    {formatCurrency(
                      Number(item.price) * Number(item.quantity)
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-5 border-t" />

            {/* Price breakdown */}
            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Tax ({settings.taxPercentage}%)
                </span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>

            </div>

            <div className="my-5 border-t" />

            {/* Total */}
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span className="text-orange-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {Number(subtotal) < Number(settings.minimumOrder) && (
              <p className="mt-3 text-xs text-red-600">
                Minimum order: {formatCurrency(settings.minimumOrder)}
              </p>
            )}

            {/* Continue Button */}
            <button
              type="submit"
              disabled={
                loadingSettings ||
                Boolean(settingsError) ||
                !settings.isStoreOpen ||
                Number(subtotal) < Number(settings.minimumOrder)
              }
              className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingSettings
                ? "Loading settings..."
                : settingsError
                ? "Settings unavailable"
                : !settings.isStoreOpen
                ? "Restaurant Closed"
                : "Continue to Order Review"}
            </button>

            <Link
              to="/cart"
              className="mt-4 block text-center text-sm font-medium text-gray-500 hover:text-orange-600"
            >
              Back to Cart
            </Link>

          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
