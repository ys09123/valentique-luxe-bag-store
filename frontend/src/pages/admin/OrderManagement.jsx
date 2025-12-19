import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../config";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  X,
  MapPin,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/toastContext";
import { ordersAPI } from "../../services/api"; // Importing your defined API

const OrderManagement = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(
        (response.data.orders || response.data || []).map((order) => ({
          ...order,
          status: order.orderStatus,
        }))
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { orderStatus: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus, orderStatus: newStatus } : order
        )
      );

      showToast(`Order status updated to ${newStatus}`, "success");
    } catch (error) {
      console.error("Status update failed:", error);
      showToast(
        error.response?.data?.message || "Failed to update status",
        "error"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Shipped":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Processing":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    const orderIdMatch = order._id.toLowerCase().includes(searchLower);
    const userNameMatch = (order.user?.name || order.user || "")
      .toLowerCase()
      .includes(searchLower);

    const matchesSearch = orderIdMatch || userNameMatch;
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      {/* Ambient Background (Same as ProductManagement) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-125 h-125 bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium mb-2">
            Admin Panel
          </p>
          <h1 className="text-4xl font-light text-white tracking-tight">
            Order Management
          </h1>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {["Processing", "Shipped", "Delivered", "Cancelled"].map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <div
                key={status}
                className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl backdrop-blur-sm"
              >
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                  {status}
                </p>
                <p className="text-2xl font-light text-white">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search Order ID or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="relative min-w-50">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="All" className="bg-zinc-900">
                All Statuses
              </option>
              <option value="Processing" className="bg-zinc-900">
                Processing
              </option>
              <option value="Shipped" className="bg-zinc-900">
                Shipped
              </option>
              <option value="Delivered" className="bg-zinc-900">
                Delivered
              </option>
              <option value="Cancelled" className="bg-zinc-900">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/60 border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Order ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Total
                  </th>
                  <th className="text-left px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-amber-500/80">
                        {order._id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white font-medium">
                        {order.user?.name || "Guest User"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {order.user?.email || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      ₹{Number(order.totalPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        className={`text-xs px-3 py-1.5 rounded-md border appearance-none cursor-pointer focus:outline-none transition-colors ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <option
                          value="Processing"
                          className="bg-zinc-900 text-zinc-300"
                        >
                          Processing
                        </option>
                        <option
                          value="Shipped"
                          className="bg-zinc-900 text-zinc-300"
                        >
                          Shipped
                        </option>
                        <option
                          value="Delivered"
                          className="bg-zinc-900 text-zinc-300"
                        >
                          Delivered
                        </option>
                        <option
                          value="Cancelled"
                          className="bg-zinc-900 text-zinc-300"
                        >
                          Cancelled
                        </option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">
                No orders found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-light text-white">
                    Order Details
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    ID: {selectedOrder._id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Shipping Info */}
                <div className="p-5 bg-zinc-950/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-3 text-amber-500">
                    <MapPin className="h-4 w-4" />
                    <h3 className="text-xs uppercase tracking-widest font-medium">
                      Delivery To
                    </h3>
                  </div>
                  <div className="text-sm text-zinc-300 space-y-1">
                    <p className="text-white font-medium">
                      {selectedOrder.user?.name}
                    </p>
                    <p>{selectedOrder.shippingAddress?.street}</p>
                    <p>
                      {selectedOrder.shippingAddress?.city},{" "}
                      {selectedOrder.shippingAddress?.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress?.country}</p>
                  </div>
                </div>

                {/* Status Info */}
                <div className="p-5 bg-zinc-950/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-3 text-amber-500">
                    <Truck className="h-4 w-4" />
                    <h3 className="text-xs uppercase tracking-widest font-medium">
                      Order Status
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">
                        Current Status
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Date Placed</span>
                      <span className="text-sm text-white">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-sm text-zinc-400">
                        Total Amount
                      </span>
                      <span className="text-lg text-white font-medium">
                        ₹{selectedOrder.totalPrice?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
                  Items Ordered
                </h3>
                <div className="space-y-4">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-zinc-950/30 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                    >
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-zinc-800 border border-white/5 shrink-0">
                        {item.image ? (
                          <img
                            src={
                              item.image.startsWith("http")
                                ? item.image
                                : `${API_URL.replace('/api', '')}${item.image}`
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://placehold.co/100x100/18181b/ffffff?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Package size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-white font-medium truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-zinc-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm text-white font-medium whitespace-nowrap">
                        ₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-3 bg-white text-black text-sm uppercase tracking-widest font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default OrderManagement;
