import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  MapPin,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/toastContext";
import { ordersAPI } from "../services/api";
import Loader from "../components/common/Loader";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    newPassword: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const updateData = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.newPassword) {
      if (!formData.password) {
        showToast("Please enter current password", "error");
        return;
      }
      updateData.password = formData.newPassword;
    }

    const result = await updateUser(updateData);

    if (result.success) {
      showToast("Profile updated successfully", "success");
      setEditMode(false);
      setFormData({ ...formData, password: "", newPassword: "" });
    } else {
      showToast(result.message, "error");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Processing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      Confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status] || colors["Processing"];
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-125 h-125 bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium mb-4"
          >
            Account
          </motion.p>
          <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight mb-4">
            My Profile
          </h1>
          <p className="text-lg text-zinc-400 font-light">
            Manage your account and view your orders
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-8 py-3 rounded-xl text-sm font-medium tracking-[0.2em] uppercase transition-all ${
              activeTab === "profile"
                ? "bg-white text-black"
                : "bg-zinc-900/40 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-8 py-3 rounded-xl text-sm font-medium tracking-[0.2em] uppercase transition-all ${
              activeTab === "orders"
                ? "bg-white text-black"
                : "bg-zinc-900/40 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "profile" ? (
              /* Profile Tab */
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-linear-to-br from-amber-500/20 to-purple-500/20 rounded-full border border-white/10">
                      <User className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-light text-white">
                        {user?.name}
                      </h2>
                      <p className="text-sm text-zinc-500">{user?.email}</p>
                    </div>
                  </div>

                  {!editMode ? (
                    <Button
                      onClick={() => setEditMode(true)}
                      className="bg-transparent border border-white/10 text-white hover:bg-white/5 flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditMode(false)}
                      className="bg-transparent border border-white/10 text-white hover:bg-white/5 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>

                {editMode ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="bg-black/20 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="bg-black/20 border-white/10 text-white"
                      />
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h3 className="text-sm text-zinc-500 mb-4 tracking-wide uppercase">
                        Change Password (Optional)
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="password"
                            className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                          >
                            Current Password
                          </Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="bg-black/20 border-white/10 text-white"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="newPassword"
                            className="text-xs tracking-wider text-zinc-500 uppercase mb-2"
                          >
                            New Password
                          </Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="bg-black/20 border-white/10 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                        <p className="text-xs text-zinc-500 mb-2 tracking-wide uppercase">
                          Account Type
                        </p>
                        <p className="text-sm text-white capitalize">
                          {user?.role}
                        </p>
                      </div>
                      <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                        <p className="text-xs text-zinc-500 mb-2 tracking-wide uppercase">
                          Member Since
                        </p>
                        <p className="text-sm text-white">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Orders Tab */
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {orders.length === 0 ? (
                  <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-12 text-center">
                    <Package className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-light text-white mb-2">
                      No orders yet
                    </h3>
                    <p className="text-zinc-500 mb-6">
                      Start shopping to see your orders here
                    </p>
                    <Button
                      onClick={() => (window.location.href = "/products")}
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                            <button
                              onClick={() =>
                                setExpandedOrder(
                                  expandedOrder === order._id ? null : order._id
                                )
                              }
                              className="p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                              {expandedOrder === order._id ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Package className="h-5 w-5 text-zinc-500" />
                            <span className="text-sm text-zinc-400">
                              {order.orderItems.length}{" "}
                              {order.orderItems.length === 1 ? "item" : "items"}
                            </span>
                          </div>
                          <p className="text-xl font-light text-white">
                            ₹{order.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Expanded Order Details */}
                      <AnimatePresence>
                        {expandedOrder === order._id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5"
                          >
                            <div className="p-6 space-y-6">
                              {/* Order Items */}
                              <div>
                                <h4 className="text-xs text-zinc-500 mb-4 tracking-wide uppercase">
                                  Order Items
                                </h4>
                                <div className="space-y-3">
                                  {order.orderItems.map((item) => (
                                    <div key={item._id} className="flex gap-4">
                                      <img
                                        src={`http://localhost:5000${item.image}`}
                                        alt={item.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm text-white font-light">
                                          {item.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                          Qty: {item.quantity} × ₹
                                          {item.price.toLocaleString()}
                                        </p>
                                      </div>
                                      <p className="text-sm text-white">
                                        ₹
                                        {(
                                          item.price * item.quantity
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Shipping Address */}
                              <div>
                                <h4 className="text-xs text-zinc-500 mb-3 tracking-wide uppercase flex items-center gap-2">
                                  <MapPin className="h-3 w-3" />
                                  Shipping Address
                                </h4>
                                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                  <p className="text-sm text-zinc-400">
                                    {order.shippingAddress.street}
                                    <br />
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.state}{" "}
                                    {order.shippingAddress.zipCode}
                                    <br />
                                    {order.shippingAddress.country}
                                  </p>
                                </div>
                              </div>

                              {/* Price Breakdown */}
                              <div className="space-y-2 pt-4 border-t border-white/5">
                                <div className="flex justify-between text-sm">
                                  <span className="text-zinc-500">
                                    Items Total
                                  </span>
                                  <span className="text-white">
                                    ₹{order.itemsPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-zinc-500">
                                    Shipping
                                  </span>
                                  <span className="text-white">
                                    ₹{order.shippingPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-zinc-500">Tax</span>
                                  <span className="text-white">
                                    ₹{order.taxPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-lg pt-2 border-t border-white/5">
                                  <span className="text-white font-medium">
                                    Total
                                  </span>
                                  <span className="text-white font-medium">
                                    ₹{order.totalPrice.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
