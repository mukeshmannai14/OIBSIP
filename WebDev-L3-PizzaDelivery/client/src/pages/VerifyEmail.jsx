
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { reload } from "firebase/auth";
import toast from "react-hot-toast";

import { auth } from "../firebase/firebaseConfig";
import { resendVerificationEmail } from "../services/authService";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const email =
    location.state?.email || auth.currentUser?.email || "";

  const checkVerification = async () => {
    const user = auth.currentUser;

    if (!user) {
      toast.error("Please register or log in again.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      await reload(user);

      if (user.emailVerified) {
        await user.getIdToken(true);
        toast.success("Email verified successfully!");
        navigate("/", { replace: true });
      } else {
        toast.error("Email is not verified yet. Check your inbox.");
      }
    } catch (error) {
      toast.error(error.message || "Unable to check verification");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      await resendVerificationEmail();
      toast.success("A new verification email has been sent.");
    } catch (error) {
      toast.error(error.message || "Unable to resend email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#190e0d] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#261715] p-8 text-center shadow-2xl sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
          <MailCheck size={34} />
        </div>

        <h1 className="text-3xl font-bold">Verify your email</h1>

        <p className="mt-4 text-sm leading-7 text-white/55">
          We sent a verification link to:
        </p>

        <p className="mt-2 break-all font-semibold text-orange-400">
          {email || "your email address"}
        </p>

        <p className="mt-5 text-sm leading-7 text-white/55">
          Open the email and click the verification link.
          Then return here and check your verification status.
        </p>

        <button
          onClick={checkVerification}
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-orange-500 py-4 font-bold disabled:opacity-50"
        >
          {loading ? "Checking..." : "I have verified my email"}
        </button>

        <button
          onClick={handleResend}
          disabled={resending || !auth.currentUser}
          className="mt-4 w-full rounded-xl border border-white/15 py-4 font-semibold text-white/80 hover:bg-white/5 disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend verification email"}
        </button>

        <Link
          to="/login"
          className="mt-6 inline-block text-sm text-orange-400"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
