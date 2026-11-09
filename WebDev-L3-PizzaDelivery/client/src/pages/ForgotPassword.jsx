
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import { resetPasswordEmail } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPasswordEmail(email);

      toast.success(
        "If your account exists, a password reset email has been sent."
      );
      setEmail("");
    } catch (error) {
      const messages = {
        "auth/invalid-email": "Enter a valid email address.",
        "auth/user-not-found": "No account found for this email.",
        "auth/too-many-requests": "Please try again later.",
      };

      toast.error(messages[error.code] || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#190e0d] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#261715] p-8 shadow-2xl">
        <Mail size={38} className="mb-6 text-orange-400" />

        <h1 className="text-3xl font-bold">Forgot password?</h1>

        <p className="mt-3 text-sm leading-7 text-white/55">
          Enter your registered email. Firebase will send you
          a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 outline-none focus:border-orange-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 py-4 font-bold disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-7 flex items-center justify-center gap-2 text-sm text-orange-400"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </div>
  );
}
