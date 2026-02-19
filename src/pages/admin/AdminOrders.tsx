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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin");
    };
    checkAuth();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchOrders();
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/dashboard")} className="text-gray-500 hover:text-teal-600 text-sm">← Dashboard</button>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-800">Orders</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "confirmed", "delivered", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-sm px-4 py-1.5 rounded-full capitalize border transition ${filter === s ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <div className="space-y-4">
            {filtered.length === 0 && <p className="text-gray-400 text-sm">No orders found.</p>}
            {filtered.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{order.full_name}</p>
                    <p className="text-sm text-gray-500">{order.phone} · {order.email}</p>
                    <p className="text-sm text-gray-500">{order.delivery_address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-teal-600">KES {order.total_amount}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
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
    </div>
  );
}