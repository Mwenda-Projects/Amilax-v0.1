import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  tracking_status: string;
  created_at: string;
  notes: string;
}

interface Customer {
  full_name: string;
  phone: string;
  email: string;
  loyalty_points: number;
  total_spent: number;
}

interface Address {
  id: string;
  label: string;
  address: string;
  is_default: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500",
};

const TRACKING_STEPS = ["processing", "packed", "out_for_delivery", "delivered"];
const TRACKING_LABELS: Record<string, string> = {
  processing: "🔄 Processing",
  packed: "📦 Packed",
  out_for_delivery: "🚚 Out for Delivery",
  delivered: "✅ Delivered",
};

export default function Account() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "loyalty" | "addresses">("orders");
  const [newAddress, setNewAddress] = useState({ label: "Home", address: "" });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/account/login"); return; }
    setUser(session.user);
    await Promise.all([
      fetchCustomer(session.user.id, session.user.email || ""),
      fetchOrders(session.user.id),
      fetchAddresses(session.user.id),
    ]);
    setLoading(false);
  };

  const fetchCustomer = async (userId: string, email: string) => {
    const { data } = await supabase.from("customers").select("*").eq("user_id", userId).single();
    if (data) { setCustomer(data); }
  };

  const fetchOrders = async (userId: string) => {
    const { data } = await supabase.from("orders").select("*")
      .eq("user_id", userId).order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const fetchAddresses = async (userId: string) => {
    const { data } = await supabase.from("addresses").select("*")
      .eq("user_id", userId).order("is_default", { ascending: false });
    setAddresses(data || []);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await supabase.from("addresses").insert({
      user_id: user.id,
      label: newAddress.label,
      address: newAddress.address,
      is_default: addresses.length === 0,
    });
    setNewAddress({ label: "Home", address: "" });
    setShowAddAddress(false);
    fetchAddresses(user.id);
    toast({ title: "Address saved!" });
  };

  const handleDeleteAddress = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    fetchAddresses(user!.id);
  };

  const handleSetDefault = async (id: string) => {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    fetchAddresses(user!.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getTier = (points: number) => {
    if (points >= 500) return { label: "Gold", color: "text-yellow-600 bg-yellow-50 border-yellow-200", emoji: "🥇" };
    if (points >= 200) return { label: "Silver", color: "text-gray-500 bg-gray-100 border-gray-200", emoji: "🥈" };
    return { label: "Bronze", color: "text-orange-600 bg-orange-50 border-orange-200", emoji: "🥉" };
  };

  const trackingIdx = (order: Order) => TRACKING_STEPS.indexOf(order.tracking_status || "processing");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Loading your account...</p>
      </div>
    );
  }

  const tier = getTier(customer?.loyalty_points || 0);
  const nextTierPoints = (customer?.loyalty_points || 0) >= 500 ? null : (customer?.loyalty_points || 0) >= 200 ? 500 : 200;
  const progressPct = nextTierPoints ? Math.min(100, ((customer?.loyalty_points || 0) / nextTierPoints) * 100) : 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-700 text-white">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-2xl font-bold">
                {customer?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold">{customer?.full_name || "My Account"}</h1>
                <p className="text-teal-200 text-sm">{user?.email}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${tier.color}`}>
                  {tier.emoji} {tier.label} Member
                </span>
              </div>
            </div>
            <button onClick={handleLogout}
              className="text-sm text-teal-200 hover:text-white border border-teal-500 hover:border-white px-4 py-2 rounded-lg transition">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-teal-600">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Loyalty Points</p>
            <p className="text-2xl font-bold text-amber-500">{customer?.loyalty_points || 0}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-purple-600">KES {(customer?.total_spent || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 p-1 rounded-xl mb-6">
          {[
            { key: "orders", label: "📦 My Orders" },
            { key: "loyalty", label: "⭐ Loyalty Points" },
            { key: "addresses", label: "📍 Addresses" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === tab.key ? "bg-white shadow text-teal-600" : "text-gray-500 hover:text-gray-700"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border text-gray-400 text-sm">
                No orders yet.{" "}
                <Link to="/" className="text-teal-600 hover:underline">Start shopping →</Link>
              </div>
            ) : orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-teal-600">KES {order.total_amount?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                    </div>
                  </div>

                  {/* Tracking bar */}
                  <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="text-xs text-teal-600 hover:underline mt-1">
                    {expandedOrder === order.id ? "Hide tracking ▲" : "Track order ▼"}
                  </button>

                  {expandedOrder === order.id && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-0">
                        {TRACKING_STEPS.map((step, i) => {
                          const currentIdx = trackingIdx(order);
                          const isActive = i <= currentIdx;
                          const isLast = i === TRACKING_STEPS.length - 1;
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className="flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition ${isActive ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                                  {TRACKING_LABELS[step].split(" ")[0]}
                                </div>
                                <span className={`text-[9px] mt-1 text-center ${isActive ? "text-teal-600 font-medium" : "text-gray-400"}`}>
                                  {TRACKING_LABELS[step].split(" ").slice(1).join(" ")}
                                </span>
                              </div>
                              {!isLast && <div className={`flex-1 h-1 mx-1 mb-4 rounded ${i < currentIdx ? "bg-teal-500" : "bg-gray-200"}`} />}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Current status: <span className="font-medium text-teal-600">{TRACKING_LABELS[order.tracking_status || "processing"]}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loyalty tab */}
        {activeTab === "loyalty" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg">Your Points</h2>
                  <p className="text-3xl font-bold text-amber-500 mt-1">⭐ {customer?.loyalty_points || 0} pts</p>
                </div>
                <span className={`text-sm font-bold px-4 py-2 rounded-full border ${tier.color}`}>
                  {tier.emoji} {tier.label}
                </span>
              </div>

              {nextTierPoints && (
                <>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                    <div className="bg-amber-400 h-2.5 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="text-xs text-gray-500">
                    {nextTierPoints - (customer?.loyalty_points || 0)} more points to reach {nextTierPoints >= 500 ? "🥇 Gold" : "🥈 Silver"}
                  </p>
                </>
              )}
            </div>

            <div className="bg-teal-50 border border-teal-100 rounded-xl p-5">
              <h3 className="font-semibold text-teal-800 mb-3">How to earn points</h3>
              <div className="space-y-2 text-sm text-teal-700">
                <div className="flex items-center gap-2">⭐ Earn 1 point for every KES 100 spent</div>
                <div className="flex items-center gap-2">🥉 Bronze: 0–199 points</div>
                <div className="flex items-center gap-2">🥈 Silver: 200–499 points — priority service</div>
                <div className="flex items-center gap-2">🥇 Gold: 500+ points — exclusive discounts</div>
              </div>
            </div>
          </div>
        )}

        {/* Addresses tab */}
        {activeTab === "addresses" && (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{addr.label}</span>
                    {addr.is_default && <span className="text-xs bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-sm text-gray-500">{addr.address}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!addr.is_default && (
                    <button onClick={() => handleSetDefault(addr.id)}
                      className="text-xs border px-2 py-1 rounded-lg hover:bg-gray-50 text-gray-500">Set default</button>
                  )}
                  <button onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs border border-red-200 text-red-500 px-2 py-1 rounded-lg hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}

            {showAddAddress ? (
              <form onSubmit={handleAddAddress} className="bg-white rounded-xl border p-5 shadow-sm space-y-3">
                <h3 className="font-semibold text-gray-800">Add Address</h3>
                <select value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
                <input required value={newAddress.address}
                  onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                  placeholder="e.g. Eastleigh, 1st Avenue, Nairobi"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700">Save</button>
                  <button type="button" onClick={() => setShowAddAddress(false)}
                    className="flex-1 border text-gray-500 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddAddress(true)}
                className="w-full border-2 border-dashed border-teal-300 text-teal-600 py-3 rounded-xl text-sm hover:bg-teal-50 transition">
                + Add New Address
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}