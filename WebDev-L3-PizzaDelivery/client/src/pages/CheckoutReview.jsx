
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

const CheckoutReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState("");

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            No checkout details found
          </h2>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-4 rounded-lg bg-orange-500 px-6 py-3 text-white"
          >
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  const {
    address,
    subtotal,
    deliveryFee,
    taxAmount,
    totalAmount,
  } = state;

  // Create Razorpay order and open payment popup
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not load. Please refresh the page."
        );
      }

      if (!cartItems.length) {
        throw new Error("Your cart is empty.");
      }

      // Ask backend to create Razorpay order.
      // Backend calculates and validates the actual amount.
      const orderResponse = await api.post(
        "/payments/create-order",
        {
          items: cartItems,
          address,
        }
      );

      const paymentData = orderResponse.data;

      if (
        !paymentData.success ||
        !paymentData.keyId ||
        !paymentData.razorpayOrderId ||
        !paymentData.orderId
      ) {
        throw new Error(
          paymentData.message || "Unable to create payment order."
        );
      }

      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency || "INR",
        name: "PizzaHub",
        description: "Pizza Order Payment",
        order_id: paymentData.razorpayOrderId,

        prefill: {
          name: address.fullName,
          email: user?.email || "",
          contact: address.phone,
        },

        notes: {
          mongoOrderId: paymentData.orderId,
        },

        theme: {
          color: "#f97316",
        },

        // Razorpay payment success callback
        handler: async (response) => {
          try {
            setLoading(true);
            setError("");

            const verifyResponse = await api.post(
              "/payments/verify",
              {
                orderId: paymentData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (!verifyResponse.data.success) {
              throw new Error(
                verifyResponse.data.message ||
                  "Payment verification failed."
              );
            }

            // Clear cart only after backend confirms payment.
            clearCart();

            setPaidOrderId(paymentData.orderId);
            setPaymentSuccess(true);
          } catch (verificationError) {
            console.error(
              "Payment verification error:",
              verificationError
            );

            setError(
              verificationError.response?.data?.message ||
                verificationError.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (paymentError) {
      console.error("Razorpay error:", paymentError);

      setError(
        paymentError.response?.data?.message ||
          paymentError.message ||
          "Unable to start payment. Please try again."
      );

      setLoading(false);
    }
  };

  // Payment success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow">
          <div className="mb-4 text-6xl">✅</div>

          <h1 className="text-3xl font-bold text-green-600">
            Payment Successful!
          </h1>

          <p className="mt-3 text-gray-600">
            Your PizzaHub order has been confirmed.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Order ID: {paidOrderId}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-7 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-sm">

        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Review Your Order
        </h1>

        {/* Delivery Address */}
        <h2 className="mb-3 text-xl font-semibold">
          Delivery Address
        </h2>

        <div className="space-y-1 text-gray-600">
          <p>{address?.fullName}</p>
          <p>{address?.phone}</p>
          <p>{address?.address}</p>
          <p>
            {address?.city}, {address?.state} - {address?.pincode}
          </p>
        </div>

        <hr className="my-6" />

        {/* Cart Items */}
        <h2 className="mb-4 text-xl font-semibold">
          Your Items
        </h2>

        <div className="space-y-4">
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

        <hr className="my-6" />

        {/* Price Summary */}
        <h2 className="mb-4 text-xl font-semibold">
          Order Summary
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>

          <hr />

          <div className="flex justify-between text-xl font-bold">
            <span>Total Amount</span>

            <span className="text-orange-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Payment Error */}
        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Razorpay Payment Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : `Pay ${formatCurrency(totalAmount)} with Razorpay`}
        </button>

        <button
          onClick={() => navigate("/checkout")}
          disabled={loading}
          className="mt-3 w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Back to Checkout
        </button>
      </div>
    </div>
  );
};

export default CheckoutReview;
