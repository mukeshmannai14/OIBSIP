
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Mail, LogOut, Pizza } from "lucide-react";
import toast from "react-hot-toast";

import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Unable to log out");
    }
  };

  return (
    <div className="min-h-screen bg-[#190e0d] px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Pizza className="text-orange-400" />
          Pizza<span className="text-orange-400">Hut</span>
        </Link>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#261715] p-8 shadow-2xl">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt="Profile"
              className="mb-6 h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
              <UserRound size={38} />
            </div>
          )}

          <h1 className="text-3xl font-bold">My Profile</h1>

          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-3">
              <UserRound className="text-orange-400" />
              <div>
                <p className="text-xs text-white/50">Name</p>
                <p className="font-semibold">
                  {profile?.name || user?.displayName || "User"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="text-orange-400" />
              <div>
                <p className="text-xs text-white/50">Email</p>
                <p className="break-all font-semibold">
                  {profile?.email || user?.email}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-white/50">Account status</p>
              <p className="font-semibold text-green-400">
                Email verified
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-9 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-4 font-bold text-red-400 hover:bg-red-500/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
