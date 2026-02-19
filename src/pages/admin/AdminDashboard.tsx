import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    orders: 0,
  });

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin");
    };
    checkAuth();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [{ count: categories }, { count: products }, { count: orders }] = await Promise.all([
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
    ]);
    setStats({
      categories: categories || 0,
      products: products || 0,
      orders: orders || 0,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Nav */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-gray-800">Amilax Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome back! Here's an overview of your store.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Categories</p>
            <p className="text-3xl font-bold text-teal-600">{stats.categories}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Products</p>
            <p className="text-3xl font-bold text-teal-600">{stats.products}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Orders</p>
            <p className="text-3xl font-bold text-teal-600">{stats.orders}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Manage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/admin/categories")}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-left hover:border-teal-400 transition"
          >
            <p className="text-lg font-semibold text-gray-800 mb-1">📂 Categories</p>
            <p className="text-sm text-gray-500">Add, edit or remove product categories</p>
          </button>

          <button
            onClick={() => navigate("/admin/products")}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-left hover:border-teal-400 transition"
          >
            <p className="text-lg font-semibold text-gray-800 mb-1">💊 Products</p>
            <p className="text-sm text-gray-500">Manage supplements, stock and pricing</p>
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-left hover:border-teal-400 transition"
          >
            <p className="text-lg font-semibold text-gray-800 mb-1">🛒 Orders</p>
            <p className="text-sm text-gray-500">View and update customer orders</p>
          </button>

          <button
            onClick={() => navigate("/admin/settings")}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-left hover:border-teal-400 transition"
          >
            <p className="text-lg font-semibold text-gray-800 mb-1">⚙️ Settings</p>
            <p className="text-sm text-gray-500">Update WhatsApp, hours, contact info</p>
          </button>
        </div>
      </div>
    </div>
  );
}