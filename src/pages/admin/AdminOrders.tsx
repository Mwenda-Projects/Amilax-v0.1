import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Order {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  notes: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500",
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearStatus, setClearStatus] = useState("delivered");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin");
    };
    checkAuth();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  const handleClearOrders = async () => {
    setClearing(true);

    // First delete associated order_items
    const { data: matchingOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("status", clearStatus);

    if (matchingOrders && matchingOrders.length > 0) {
      const ids = matchingOrders.map((o) => o.id);
      await supabase.from("order_items").delete().in("order_id", ids);
      await supabase.from("orders").delete().eq("status", clearStatus);
    }

    setClearing(false);
    setShowClearModal(false);
    fetchOrders();
  };

  const countByStatus = (status: string) => orders.filter((o) => o.status === status).length;
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/dashboard")} className="text-gray-500 hover:text-teal-600 text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-800">Orders</span>
        </div>
        <button
          onClick={() => setShowClearModal(true)}
          className="text-sm border border-red-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition"
        >
          🗑 Clear Orders
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "pending", "confirmed", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-sm px-4 py-1.5 rounded-full capitalize border transition ${
                filter === s ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s} {s !== "all" && `(${countByStatus(s)})`}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 && <p className="text-gray-400 text-sm">No orders found.</p>}
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{order.full_name}</p>
                    <p className="text-sm text-gray-500">{order.phone} {order.email ? `· ${order.email}` : ""}</p>
                    <p className="text-sm text-gray-500">{order.delivery_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-teal-600">KES {order.total_amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {order.notes && <p className="text-xs text-gray-400 mt-2">Note: {order.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Orders Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-800 text-lg mb-1">Clear Orders</h2>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete all orders with the selected status. This cannot be undone.
            </p>

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select status to clear</label>
              <div className="grid grid-cols-2 gap-2">
                {["delivered", "cancelled", "confirmed", "pending"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setClearStatus(s)}
                    className={`py-2.5 px-4 rounded-lg border text-sm capitalize transition ${
                      clearStatus === s
                        ? "border-red-400 bg-red-50 text-red-600 font-medium"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {s} ({countByStatus(s)})
                  </button>
                ))}
              </div>
            </div>

            {countByStatus(clearStatus) === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                No {clearStatus} orders to clear.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClearOrders}
                disabled={clearing || countByStatus(clearStatus) === 0}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {clearing ? "Clearing..." : `Clear ${countByStatus(clearStatus)} ${clearStatus} orders`}
              </button>
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 border text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}