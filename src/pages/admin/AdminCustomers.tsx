import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  loyalty_points: number;
  total_spent: number;
  created_at: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<Record<string, Order[]>>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin");
    };
    checkAuth();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("total_spent", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  const fetchOrderHistory = async (phone: string, customerId: string) => {
    if (orderHistory[customerId]) return; // already loaded
    const { data } = await supabase
      .from("orders")
      .select("id, total_amount, status, created_at")
      .eq("phone", phone)
      .order("created_at", { ascending: false });
    setOrderHistory(prev => ({ ...prev, [customerId]: data || [] }));
  };

  const handleExpand = (customer: Customer) => {
    if (expanded === customer.id) {
      setExpanded(null);
    } else {
      setExpanded(customer.id);
      fetchOrderHistory(customer.phone, customer.id);
    }
  };

  const adjustPoints = async (id: string, current: number, amount: number) => {
    const newPoints = Math.max(0, current + amount);
    await supabase.from("customers").update({ loyalty_points: newPoints }).eq("id", id);
    fetchCustomers();
  };

  const filtered = customers.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getTier = (points: number) => {
    if (points >= 500) return { label: "Gold", color: "text-yellow-600 bg-yellow-50", emoji: "🥇" };
    if (points >= 200) return { label: "Silver", color: "text-gray-500 bg-gray-100", emoji: "🥈" };
    return { label: "Bronze", color: "text-orange-600 bg-orange-50", emoji: "🥉" };
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: "text-yellow-600",
    confirmed: "text-blue-600",
    delivered: "text-green-600",
    cancelled: "text-red-500",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/orders")} className="text-gray-500 hover:text-teal-600 text-sm">
            ← Orders
          </button>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-800">Customers</span>
        </div>
        <div className="text-sm text-gray-500">
          {customers.length} total customers
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-teal-600">{customers.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Loyalty Points</p>
            <p className="text-2xl font-bold text-amber-500">
              {customers.reduce((sum, c) => sum + (c.loyalty_points || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Customer Spend</p>
            <p className="text-2xl font-bold text-purple-600">
              KES {customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, phone or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        />

        {/* Loyalty info */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-xs text-teal-700 mb-6 flex gap-6 flex-wrap">
          <span>🥉 Bronze: 0–199 pts</span>
          <span>🥈 Silver: 200–499 pts</span>
          <span>🥇 Gold: 500+ pts</span>
          <span className="ml-auto">1 point earned per KES 100 spent</span>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-xl border">
                {search ? "No customers match your search." : "No customers yet. They appear automatically when orders are placed."}
              </div>
            )}
            {filtered.map(customer => {
              const tier = getTier(customer.loyalty_points || 0);
              return (
                <div key={customer.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Customer info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0">
                          {customer.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{customer.full_name}</p>
                          <p className="text-xs text-gray-500">{customer.phone}{customer.email ? ` · ${customer.email}` : ""}</p>
                          <p className="text-xs text-gray-400">Since {new Date(customer.created_at).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}</p>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-teal-600 text-sm">KES {(customer.total_spent || 0).toLocaleString()}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.color}`}>
                          {tier.emoji} {tier.label}
                        </span>
                      </div>
                    </div>

                    {/* Loyalty points row */}
                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-amber-700 font-medium">⭐ {customer.loyalty_points || 0} points</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => adjustPoints(customer.id, customer.loyalty_points || 0, -10)}
                          className="text-xs w-7 h-7 rounded-lg border hover:bg-gray-50 text-gray-600 font-bold">−</button>
                        <span className="text-xs text-gray-400 px-1">Adjust</span>
                        <button onClick={() => adjustPoints(customer.id, customer.loyalty_points || 0, 10)}
                          className="text-xs w-7 h-7 rounded-lg border hover:bg-gray-50 text-gray-600 font-bold">+</button>
                      </div>
                      <button onClick={() => handleExpand(customer)}
                        className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 ml-auto">
                        {expanded === customer.id ? "Hide Orders ▲" : "View Orders ▼"}
                      </button>
                    </div>
                  </div>

                  {/* Order history */}
                  {expanded === customer.id && (
                    <div className="border-t px-5 py-4 bg-gray-50 rounded-b-xl">
                      <p className="text-xs font-semibold text-gray-600 mb-3">Order History</p>
                      {!orderHistory[customer.id] ? (
                        <p className="text-xs text-gray-400">Loading...</p>
                      ) : orderHistory[customer.id].length === 0 ? (
                        <p className="text-xs text-gray-400">No orders found for this phone number.</p>
                      ) : (
                        <div className="space-y-2">
                          {orderHistory[customer.id].map(order => (
                            <div key={order.id} className="flex items-center justify-between text-xs bg-white rounded-lg border px-3 py-2">
                              <span className="text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                              <span className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                              <span className={`font-medium capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                              <span className="font-semibold text-teal-600">KES {order.total_amount?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}