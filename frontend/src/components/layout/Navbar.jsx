import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Logo from "../common/Logo";
import {
  ShoppingBag,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky transition-all duration-300 top-0 z-50 bg-zinc-900/25 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Logo className="h-10 w-auto" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm text-zinc-400 hover:text-white transition-colors tracking-wide uppercase"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm text-zinc-400 hover:text-white transition-colors tracking-wide uppercase"
            >
              Collection
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            {/* Cart Icon */}
            {isAuthenticated && (
              <Link to="/cart" className="relative group">
                <ShoppingBag className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>
            )}

            {/* User Menu / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 cursor-pointer text-zinc-400 hover:text-white transition-colors group"
                >
                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                    <User className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="hidden md:block text-sm tracking-wide">
                    {user?.name}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex cursor-pointer items-center space-x-3 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <div className="h-px bg-white/5 my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm text-zinc-400 hover:text-white transition-colors tracking-wide uppercase"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-white text-black text-xs font-medium tracking-[0.2em] uppercase rounded-lg hover:bg-zinc-200 transition-all"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 py-4 space-y-4"
            >
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-zinc-400 hover:text-white transition-colors tracking-wide uppercase"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-zinc-400 hover:text-white transition-colors tracking-wide uppercase"
              >
                Collection
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
