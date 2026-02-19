import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface BestSeller {
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock_count: number;
  sku: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  const [stats, setStats] = useState({ categories: 0, products: 0, orders: 0, revenue: 0, pending: 0, delivered: 0 });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin");
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetchAll();
  }, [period]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchRevenue(), fetchBestSellers(), fetchLowStock()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    const [{ count: categories }, { count: products }, { data: orders }] = await Promise.all([
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total_amount, status"),
    ]);

    const allOrders = (orders || []) as Order[];
    const revenue = allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const pending = allOrders.filter(o => o.status === "pending").length;
    const delivered = allOrders.filter(o => o.status === "delivered").length;

    setStats({
      categories: categories || 0,
      products: products || 0,
      orders: allOrders.length,
      revenue,
      pending,
      delivered,
    });
  };

  const fetchRevenue = async () => {
    const days = parseInt(period);
    const from = new Date();
    from.setDate(from.getDate() - days);

    const { data } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .gte("created_at", from.toISOString())
      .order("created_at");

    // Group by date
    const map: Record<string, number> = {};
    (data || []).forEach((o: any) => {
      const date = new Date(o.created_at).toLocaleDateString("en-KE", { month: "short", day: "numeric" });
      map[date] = (map[date] || 0) + (o.total_amount || 0);
    });

    setRevenueData(Object.entries(map).map(([date, revenue]) => ({ date, revenue })));
  };

  const fetchBestSellers = async () => {
    const { data } = await supabase
      .from("order_items")
      .select("product_name, quantity, total_price");

    const map: Record<string, { total_qty: number; total_revenue: number }> = {};
    (data || []).forEach((item: any) => {
      if (!map[item.product_name]) map[item.product_name] = { total_qty: 0, total_revenue: 0 };
      map[item.product_name].total_qty += item.quantity || 0;
      map[item.product_name].total_revenue += item.total_price || 0;
    });

    const sorted = Object.entries(map)
      .map(([product_name, vals]) => ({ product_name, ...vals }))
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 5);

    setBestSellers(sorted);
  };

  const fetchLowStock = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, stock_count, sku")
      .lte("stock_count", 5)
      .eq("is_active", true)
      .order("stock_count");

    setLowStock(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const statCards: StatCard[] = [
    { label: "Total Revenue", value: `KES ${stats.revenue.toLocaleString()}`, color: "text-teal-600" },
    { label: "Total Orders", value: stats.orders, sub: `${stats.pending} pending`, color: "text-blue-600" },
    { label: "Delivered", value: stats.delivered, color: "text-green-600" },
    { label: "Products", value: stats.products, sub: `${stats.categories} categories`, color: "text-purple-600" },
  ];

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
        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">
          Sign Out
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back! Here's your store overview.</p>
          </div>
          {/* Period selector */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(["7", "30", "90"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${period === p ? "bg-white shadow text-teal-600" : "text-gray-500 hover:text-gray-700"}`}>
                {p === "7" ? "7 days" : p === "30" ? "30 days" : "90 days"}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(card => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Revenue — Last {period} days</h2>
            {revenueData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No revenue data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              ⚠️ Low Stock
              {lowStock.length > 0 && (
                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{lowStock.length}</span>
              )}
            </h2>
            {lowStock.length === 0 ? (
              <p className="text-sm text-gray-400">All products are well stocked!</p>
            ) : (
              <div className="space-y-3">
                {lowStock.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      {p.sku && <p className="text-xs text-gray-400">{p.sku}</p>}
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock_count === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                      {p.stock_count === 0 ? "Out" : `${p.stock_count} left`}
                    </span>
                  </div>
                ))}
                <button onClick={() => navigate("/admin/products")}
                  className="text-xs text-teal-600 hover:underline mt-2 block">
                  Manage products →
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Best Sellers */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">🏆 Best Selling Supplements</h2>
            {bestSellers.length === 0 ? (
              <p className="text-sm text-gray-400">No sales data yet.</p>
            ) : (
              <div className="space-y-3">
                {bestSellers.map((item, i) => (
                  <div key={item.product_name} className="flex items-center gap-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400"}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-400">{item.total_qty} units sold</p>
                    </div>
                    <span className="text-sm font-semibold text-teal-600">
                      KES {item.total_revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "📂 Categories", path: "/admin/categories" },
                { label: "💊 Products", path: "/admin/products" },
                { label: "🛒 Orders", path: "/admin/orders" },
                { label: "⚙️ Settings", path: "/admin/settings" },
              ].map(action => (
                <button key={action.path} onClick={() => navigate(action.path)}
                  className="w-full text-left text-sm px-4 py-3 rounded-lg border border-gray-100 hover:border-teal-300 hover:bg-teal-50 transition">
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}