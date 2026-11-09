
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Wait for Firebase authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#190e0d] text-orange-400">
        Verifying your account...
      </div>
    );
  }

  // Require login
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Require verified email
  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Wait for customer profile
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#190e0d] text-orange-400">
        Loading your profile...
      </div>
    );
  }

  return children;
}
