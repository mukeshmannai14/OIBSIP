
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useEffect, useState } from "react";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      setChecking(true);
      setIsAdmin(false);
      setErrorMessage("");

      if (!user || !user.emailVerified) {
        setChecking(false);
        return;
      }

      try {
        await user.getIdToken(true);

        const response = await api.get("/admin/verify");

        if (active && response.data.success) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error(
          "Admin verification error:",
          error.response?.data || error
        );

        if (active) {
          setErrorMessage(
            error.response?.data?.message ||
            "Unable to verify admin access."
          );
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    verifyAdmin();

    return () => {
      active = false;
    };
  }, [user]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-semibold text-orange-500">
          Verifying admin access...
        </p>
      </div>
    );
  }

  if (!user || !user.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Admin Access Denied
        </h1>

        <p className="text-gray-600">
          {errorMessage || "Your account does not have admin permission."}
        </p>

        <button
          onClick={() => window.location.href = "/"}
          className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return children;
}
