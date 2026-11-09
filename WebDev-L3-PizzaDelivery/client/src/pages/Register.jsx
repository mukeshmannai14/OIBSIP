
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

import {
  Pizza,
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import toast from "react-hot-toast";
import { registerWithEmail } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await registerWithEmail({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      toast.success("Verification link sent to your email!");

      navigate("/verify-email", {
        state: {
          email: form.email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (error.accountCreated) {
        toast.error(
          "Account created, but verification email setup failed. Please try resending the verification email."
        );
        return;
      }

      const messages = {
        "auth/email-already-in-use":
          "This email is already registered.",

        "auth/weak-password":
          "Please choose a stronger password.",

        "auth/invalid-email":
          "Please enter a valid email address.",

        "auth/operation-not-allowed":
          "Email and password registration is disabled in Firebase.",

        "auth/network-request-failed":
          "Network error. Please check your internet connection.",

        "auth/too-many-requests":
          "Too many attempts. Please try again later.",

        "auth/configuration-not-found":
          "Firebase authentication configuration is missing.",
      };

      toast.error(
        messages[error.code] ||
          error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#190e0d] px-4 py-12 text-white">

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#261715] p-7 shadow-2xl sm:p-10"
      >

        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center gap-2">
          <Pizza size={32} className="text-orange-400" />

          <span className="text-2xl font-extrabold">
            Pizza<span className="text-orange-400">Hut</span>
          </span>
        </Link>

        {/* Heading */}
        <p className="text-sm font-semibold text-orange-400">
          JOIN PIZZAHUT
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Sign up and discover your favourite food.
        </p>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          {/* Full Name */}
          <label className="block text-sm">
            Full name

            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 transition focus-within:border-orange-400">
              <User size={18} className="text-orange-400" />

              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={60}
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                autoComplete="name"
                className="w-full bg-transparent py-4 outline-none"
              />
            </div>
          </label>

          {/* Email */}
          <label className="block text-sm">
            Email address

            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 transition focus-within:border-orange-400">
              <Mail size={18} className="text-orange-400" />

              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-transparent py-4 outline-none"
              />
            </div>
          </label>

          {/* Password */}
          <label className="block text-sm">
            Password

            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 transition focus-within:border-orange-400">
              <Lock size={18} className="text-orange-400" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full bg-transparent py-4 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                className="text-white/50 transition hover:text-orange-400"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        {/* Login Link */}
        <p className="mt-7 text-center text-sm text-white/55">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-bold text-orange-400 hover:text-orange-300"
          >
            Login
          </Link>
        </p>

        {/* Home */}
        <p className="mt-5 text-center text-xs text-white/40">
          By creating an account, you can order and track your favourite pizzas.
        </p>

      </motion.div>
    </div>
  );
}
