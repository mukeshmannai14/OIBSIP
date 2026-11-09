
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pizza, Mail, Lock, Globe } from "lucide-react";
import toast from "react-hot-toast";

import {
  loginWithEmail,
  loginWithGoogle,
} from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // EMAIL AND PASSWORD LOGIN
  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (loading || googleLoading) return;

    setLoading(true);

    try {
      const result = await loginWithEmail(form);

      if (!result.verified) {
        toast.error("Please verify your email before logging in.");

        navigate("/verify-email", {
          state: { email: form.email },
        });

        return;
      }

      await result.user.getIdToken(true);

      toast.success("Welcome back!");

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Email login error:", error);

      const messages = {
        "auth/invalid-credential": "Invalid email or password.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/network-request-failed": "Check your internet connection.",
      };

      toast.error(
        messages[error.code] || error.message || "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    if (loading || googleLoading) return;

    setGoogleLoading(true);

    try {
      const user = await loginWithGoogle();

      await user.getIdToken(true);

      toast.success("Google login successful!");

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Google login error:", error);

      if (error.code !== "auth/popup-closed-by-user") {
        const messages = {
          "auth/popup-blocked": "Please allow popups for this website.",
          "auth/unauthorized-domain":
            "This domain is not authorized in Firebase.",
          "auth/network-request-failed":
            "Check your internet connection.",
        };

        toast.error(
          messages[error.code] || error.message || "Google login failed."
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#190e0d] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#261715] p-8 shadow-2xl sm:p-10">

        {/* LOGO */}
        <Link to="/" className="mb-8 flex items-center gap-2">
          <Pizza size={32} className="text-orange-400" />

          <span className="text-2xl font-bold">
            Pizza<span className="text-orange-400">Hut</span>
          </span>
        </Link>

        {/* HEADING */}
        <p className="text-sm font-semibold text-orange-400">
          WELCOME BACK
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Login to your account
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Your favourite food is just a few clicks away.
        </p>

        {/* GOOGLE LOGIN */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white py-4 font-bold text-[#190e0d] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Globe size={20} />

          {googleLoading
            ? "Connecting..."
            : "Continue with Google"}
        </button>

        {/* DIVIDER */}
        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />

          <span className="text-xs text-white/40">
            OR LOGIN WITH EMAIL
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* EMAIL LOGIN FORM */}
        <form onSubmit={handleEmailLogin} className="space-y-5">

          {/* EMAIL */}
          <label className="block text-sm">
            Email address

            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4">
              <Mail size={18} className="text-orange-400" />

              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="you@example.com"
                className="w-full bg-transparent py-4 outline-none"
              />
            </div>
          </label>

          {/* PASSWORD */}
          <label className="block text-sm">
            Password

            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4">
              <Lock size={18} className="text-orange-400" />

              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="Your password"
                className="w-full bg-transparent py-4 outline-none"
              />
            </div>
          </label>

          {/* FORGOT PASSWORD */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-orange-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-xl bg-orange-500 py-4 font-bold transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* REGISTER LINK */}
        <p className="mt-7 text-center text-sm text-white/55">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="font-bold text-orange-400 hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
