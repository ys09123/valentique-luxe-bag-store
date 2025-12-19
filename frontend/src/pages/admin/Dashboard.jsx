import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  ArrowRight,
  Clock,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Loader from "../../components/common/Loader";
import { adminAPI } from "../../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        const data = response.data.stats;

        setStats({
          totalSales: data.totalRevenue ?? 0,
          totalOrders: data.totalOrders ?? 0,
          totalUsers: data.totalUsers ?? 0,
          recentOrders: (data.recentOrders ?? []).map((order) => ({
            _id: order._id,
            user: order.user?.name || "Guest",
            date: new Date(order.createdAt).toLocaleDateString(),
            status: order.orderStatus,
            total: order.totalPrice ?? 0,
          })),
        });
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-125 h-125 bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-125 h-125 bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] tracking-[0.4em] text-amber-500/80 uppercase font-medium mb-2">
            Overview
          </p>
          <h1 className="text-4xl font-light text-white tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Sales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl group hover:border-amber-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                <DollarSign className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded">
                <TrendingUp className="h-3 w-3" /> +12%
              </span>
            </div>
            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">
              Total Revenue
            </p>
            <h3 className="text-3xl font-light text-white">
              ₹{stats.totalSales.toLocaleString()}
            </h3>
          </motion.div>

          {/* Total Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl group hover:border-purple-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">
              Total Orders
            </p>
            <h3 className="text-3xl font-light text-white">
              {stats.totalOrders}
            </h3>
          </motion.div>

          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl group hover:border-blue-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">
              Active Users
            </p>
            <h3 className="text-3xl font-light text-white">
              {stats.totalUsers}
            </h3>
          </motion.div>
        </div>

        {/* Quick Actions & Recent Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-lg font-light text-white tracking-wide mb-4">
              Quick Actions
            </h3>

            <Link to="/admin/products" className="block group">
              <div className="p-6 bg-zinc-900/40 border border-white/10 rounded-2xl hover:bg-zinc-800/50 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-lg text-zinc-300 group-hover:text-white">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      Manage Products
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Add, edit or delete inventory
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>

            <Link to="/admin/orders" className="block group">
              <div className="p-6 bg-zinc-900/40 border border-white/10 rounded-2xl hover:bg-zinc-800/50 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-lg text-zinc-300 group-hover:text-white">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">
                      View All Orders
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Check order status & details
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>
          </div>

          {/* Recent Orders Table */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-light text-white tracking-wide">
                Recent Orders
              </h3>
              <Link
                to="/admin/orders"
                className="text-xs text-amber-500 hover:text-amber-400 tracking-wider uppercase"
              >
                View All
              </Link>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
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
                        Status
                      </th>
                      <th className="text-right px-6 py-4 text-xs tracking-[0.2em] text-zinc-500 uppercase font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {order._id}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {order.user}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500 flex items-center gap-2">
                          <Clock className="h-3 w-3" /> {order.date}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2 py-1 rounded border ${
                              order.status === "Delivered"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : order.status === "Shipped"
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white text-right font-medium">
                          ₹{order.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
