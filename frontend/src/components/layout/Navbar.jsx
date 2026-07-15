import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const [hovered, setHovered] = useState(null);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Collection", path: "/products" },
  ];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setUserMenuOpen(false);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full px-4 flex justify-center">
      <nav
        className="
      w-full
      max-w-7xl
      rounded-full
      border border-white/10
      bg-zinc-900/40
      backdrop-blur-xl
      shadow-[0_8px_32px_rgba(0,0,0,0.35)]
      transition-all
      duration-300
    "
      >
        <div className="px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Logo className="h-10 w-auto" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 relative">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isHovered = hovered === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onMouseEnter={() => setHovered(item.path)}
                    onMouseLeave={() => setHovered(null)}
                    className="
          relative
          px-6
          py-3
          rounded-full
          text-sm
          uppercase
          tracking-wide
        "
                  >
                    {/* Smooth Liquid Glass Blob */}
                    {(isHovered || isActive) && (
                      <motion.div
                        layoutId="navbar-blob"
                        transition={{
                          type: "spring",
                          bounce: 0.35,
                          duration: 0.7,
                        }}
                        className="
              absolute
              inset-0
              rounded-full

             bg-white/4
    backdrop-blur-md

    border
    border-white/8

    shadow-[0_8px_32px_rgba(255,255,255,0.04)]

    overflow-hidden
            "
                      >
                        {/* Gloss Reflection */}
                        <div
                          className="
                absolute
                inset-0
                rounded-full
                bg-linear-to-b
                from-white/20
                via-white/5
                to-transparent
              "
                        />

                        {/* Soft Glow */}
                        <div
                          className="
                absolute
                -inset-px
                rounded-full
                bg-white/5
                blur-md
              "
                        />
                      </motion.div>
                    )}

                    {/* Text */}
                    <span
                      className={`
            relative z-10 transition-colors duration-300
            ${isActive || isHovered ? "text-white" : "text-zinc-400"}
          `}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
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
                      className="
                    absolute
                    -top-2
                    -right-2
                    bg-amber-500
                    text-black
                    text-[10px]
                    font-semibold
                    rounded-full
                    w-5
                    h-5
                    flex
                    items-center
                    justify-center
                  "
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
                    className="
                  flex
                  items-center
                  space-x-2
                  cursor-pointer
                  text-zinc-400
                  hover:text-white
                  transition-colors
                  group
                "
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
                        className="
                      absolute
                      right-0
                      mt-4
                      w-48
                      bg-zinc-900/95
                      backdrop-blur-xl
                      border
                      border-white/10
                      rounded-2xl
                      shadow-2xl
                      overflow-hidden
                    "
                      >
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="
                        flex
                        items-center
                        space-x-3
                        px-4
                        py-3
                        text-sm
                        text-zinc-400
                        hover:text-white
                        hover:bg-white/5
                        transition-colors
                      "
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="
                          flex
                          cursor-pointer
                          items-center
                          space-x-3
                          px-4
                          py-3
                          text-sm
                          text-zinc-400
                          hover:text-white
                          hover:bg-white/5
                          transition-colors
                        "
                          >
                            <Settings className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        <div className="h-px bg-white/5 my-1" />

                        <button
                          onClick={handleLogout}
                          className="
                        flex
                        items-center
                        space-x-3
                        px-4
                        py-3
                        text-sm
                        text-red-400
                        hover:text-red-300
                        hover:bg-red-500/5
                        transition-colors
                        w-full
                      "
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
                    className="
                  text-sm
                  text-zinc-400
                  hover:text-white
                  transition-colors
                  tracking-wide
                  uppercase
                "
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="
                  px-6
                  py-2
                  bg-white
                  text-black
                  text-xs
                  font-medium
                  tracking-[0.2em]
                  uppercase
                  rounded-full
                  hover:bg-zinc-200
                  transition-all
                "
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
                className="
              md:hidden
              border-t
              border-white/5
              py-4
              space-y-4
            "
              >
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="
                block
                text-sm
                text-zinc-400
                hover:text-white
                transition-colors
                tracking-wide
                uppercase
              "
                >
                  Home
                </Link>

                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="
                block
                text-sm
                text-zinc-400
                hover:text-white
                transition-colors
                tracking-wide
                uppercase
              "
                >
                  Collection
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
