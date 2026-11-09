
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  ShoppingCart,
  UserRound,
  Menu,
  X,
  Pizza,
  LogOut,
  LayoutDashboard,
  ClipboardList,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { logoutUser } from "../services/authService";

export default function Navbar({
  search = "",
  setSearch = () => {},
}) {
  const [mobileMenu, setMobileMenu] = useState(false);

  const { user, profile } = useAuth();
  const { itemCount } = useCart();

  const navigate = useNavigate();

  const isAdmin = user?.emailVerified && profile?.role === "admin";

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "Menu", id: "menu" },
    { label: "About", id: "about" },
  ];

  const goToSection = (id) => {
    setMobileMenu(false);

    if (window.location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);

      return;
    }

    const section = document.getElementById(id);

    if (section) {
      const top =
        section.getBoundingClientRect().top +
        window.scrollY -
        90;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();

      setMobileMenu(false);

      toast.success("Logged out successfully");

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Unable to logout");
    }
  };

  const openCart = () => {
    setMobileMenu(false);
    navigate("/cart");
  };

  const AuthButtons = ({ mobile = false }) => {
    if (user?.emailVerified) {
      return (
        <>
          {/* Admin Dashboard */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenu(false)}
              className={
                mobile
                  ? "flex w-full items-center gap-3 rounded-xl bg-orange-500/15 px-4 py-3 font-semibold text-orange-400 hover:bg-orange-500/25"
                  : "flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              }
            >
              <LayoutDashboard size={18} />
              Admin Dashboard
            </Link>
          )}

          {/* My Orders */}
          <Link
            to="/my-orders"
            onClick={() => setMobileMenu(false)}
            className={
              mobile
                ? "flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-orange-400 hover:bg-white/10"
                : "flex items-center gap-2 rounded-full border border-orange-400/40 px-4 py-2.5 text-sm font-semibold transition hover:bg-orange-400 hover:text-black"
            }
          >
            <ClipboardList size={18} />
            My Orders
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            onClick={() => setMobileMenu(false)}
            className={
              mobile
                ? "flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-orange-400 hover:bg-white/10"
                : "flex items-center gap-2 rounded-full border border-orange-400/40 px-4 py-2.5 text-sm font-semibold transition hover:bg-orange-400 hover:text-black"
            }
          >
            <UserRound size={18} />
            {profile?.name || "My Profile"}
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={
              mobile
                ? "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-400 hover:bg-white/10"
                : "flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20"
            }
          >
            <LogOut size={17} />
            Logout
          </button>
        </>
      );
    }

    return (
      <Link
        to="/login"
        onClick={() => setMobileMenu(false)}
        className={
          mobile
            ? "flex w-full items-center gap-3 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600"
            : "flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold transition hover:bg-orange-400 hover:text-black"
        }
      >
        <UserRound size={17} />
        Login
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-white/10 bg-[#190e0d] text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">

        {/* Logo */}
        <button
          type="button"
          onClick={() => goToSection("home")}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="rounded-xl bg-orange-400/10 p-2 text-orange-400">
            <Pizza size={25} />
          </span>

          <span className="text-xl font-extrabold sm:text-2xl">
            Pizza<span className="text-orange-400">Hut</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => goToSection(link.id)}
              className="py-2 text-sm font-semibold text-white/80 transition hover:text-orange-400"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">

          {/* Search */}
          <div className="flex items-center rounded-full border border-white/15 bg-white/[0.07] px-4 py-2">
            <Search size={17} className="text-white/50" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu..."
              className="w-28 bg-transparent pl-2 text-sm outline-none lg:w-36"
            />
          </div>

          {/* Cart */}
          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-3 transition hover:bg-white/10"
            aria-label="Open shopping cart"
          >
            <ShoppingCart size={22} />

            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold">
              {itemCount}
            </span>
          </button>

          <AuthButtons />
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">

          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2.5 hover:bg-white/10"
            aria-label="Open shopping cart"
          >
            <ShoppingCart size={21} />

            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px]">
              {itemCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenu((prev) => !prev)}
            className="relative z-[110] flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="absolute left-0 top-full z-[105] w-full border-t border-white/10 bg-[#190e0d] px-5 py-5 shadow-2xl md:hidden">

          {/* Mobile Search */}
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
            <Search size={18} className="text-white/50" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>

          {/* Mobile Navigation */}
          <div className="space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => goToSection(link.id)}
                className="block w-full rounded-xl px-4 py-3 text-left font-semibold text-white transition hover:bg-white/10 hover:text-orange-400"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Mobile Cart */}
          <button
            type="button"
            onClick={openCart}
            className="mt-4 flex w-full items-center justify-between rounded-xl bg-orange-500/10 px-4 py-3 font-semibold text-orange-300"
          >
            Shopping Cart
            <span>{itemCount} items</span>
          </button>

          {/* Mobile Authentication */}
          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            <AuthButtons mobile />
          </div>
        </div>
      )}
    </nav>
  );
}
