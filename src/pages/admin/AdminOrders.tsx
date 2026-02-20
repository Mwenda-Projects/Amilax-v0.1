import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Order {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  tracking_status: string;
  notes: string;
  created_at: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500",
};

const TRACKING_STEPS = [
  { key: "processing", label: "Processing", emoji: "🔄" },
  { key: "packed", label: "Packed", emoji: "📦" },
  { key: "out_for_delivery", label: "Out for Delivery", emoji: "🚚" },
  { key: "delivered", label: "Delivered", emoji: "✅" },
];

const TRACKING_COLORS: Record<string, string> = {
  processing: "bg-gray-100 text-gray-600",
  packed: "bg-blue-100 text-blue-600",
  out_for_delivery: "bg-orange-100 text-orange-600",
  delivered: "bg-green-100 text-green-600",
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearStatus, setClearStatus] = useState("delivered");
  const [clearing, setClearing] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);

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
    // If delivered, also update tracking
    if (status === "delivered") {
      await supabase.from("orders").update({ tracking_status: "delivered" }).eq("id", id);
    }
    fetchOrders();
  };

  const updateTracking = async (id: string, tracking_status: string) => {
    await supabase.from("orders").update({ tracking_status }).eq("id", id);
    fetchOrders();
  };

  // Auto-create or update customer profile when order is actioned
  const syncCustomer = async (order: Order) => {
    if (!order.phone) return;
    const { data: existing } = await supabase
      .from("customers")
      .select("id, total_spent, loyalty_points")
      .eq("phone", order.phone)
      .single();

    if (existing) {
      // Update total spent
      const { data: allOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("phone", order.phone);
      const total = (allOrders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
      const points = Math.floor(total / 100); // 1 point per KES 100
      await supabase.from("customers").update({
        full_name: order.full_name,
        email: order.email || existing.email,
        total_spent: total,
        loyalty_points: points,
        updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      // Create new customer
      const points = Math.floor((order.total_amount || 0) / 100);
      await supabase.from("customers").insert({
        full_name: order.full_name,
        phone: order.phone,
        email: order.email || null,
        total_spent: order.total_amount || 0,
        loyalty_points: points,
      });
    }
  };

  const handleClearOrders = async () => {
    setClearing(true);
    const { data: matchingOrders } = await supabase
      .from("orders").select("id").eq("status", clearStatus);
    if (matchingOrders && matchingOrders.length > 0) {
      const ids = matchingOrders.map((o) => o.id);
      await supabase.from("order_items").delete().in("order_id", ids);
      await supabase.from("orders").delete().eq("status", clearStatus);
    }
    setClearing(false);
    setShowClearModal(false);
    fetchOrders();
  };

  const generateInvoice = async (order: Order) => {
    setGeneratingInvoice(order.id);
    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
    const orderItems = (items || []) as OrderItem[];
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Amilax Pharmaceuticals", 14, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Quality Medicines, Honestly Dispensed.", 14, 27);
    doc.text("amilaxpharma@gmail.com", 14, 34);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 14, 22, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, pageWidth - 14, 31, { align: "right" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 55);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(order.full_name, 14, 63);
    if (order.phone) doc.text(`Phone: ${order.phone}`, 14, 70);
    if (order.email) doc.text(`Email: ${order.email}`, 14, 77);
    if (order.delivery_address) doc.text(`Address: ${order.delivery_address}`, 14, 84);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Date:", pageWidth - 70, 55);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(order.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }), pageWidth - 14, 55, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text("Status:", pageWidth - 70, 63);
    doc.setFont("helvetica", "normal");
    doc.text(order.status.toUpperCase(), pageWidth - 14, 63, { align: "right" });
    if (order.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("Payment:", pageWidth - 70, 71);
      doc.setFont("helvetica", "normal");
      doc.text(order.notes.replace("Payment method: ", "").toUpperCase(), pageWidth - 14, 71, { align: "right" });
    }
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.5);
    doc.line(14, 93, pageWidth - 14, 93);
    autoTable(doc, {
      startY: 98,
      head: [["#", "Product", "Qty", "Unit Price (KES)", "Total (KES)"]],
      body: orderItems.map((item, i) => [i + 1, item.product_name, item.quantity, item.unit_price?.toLocaleString(), item.total_price?.toLocaleString()]),
      headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: "bold", fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 250, 250] },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 80 }, 2: { cellWidth: 20, halign: "center" }, 3: { cellWidth: 35, halign: "right" }, 4: { cellWidth: 35, halign: "right" } },
    });
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(245, 250, 250);
    doc.rect(pageWidth - 80, finalY - 5, 66, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", pageWidth - 70, finalY + 5);
    doc.setTextColor(13, 148, 136);
    doc.text(`KES ${order.total_amount?.toLocaleString()}`, pageWidth - 14, finalY + 5, { align: "right" });
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Thank you for choosing Amilax Pharmaceuticals.", pageWidth / 2, finalY + 30, { align: "center" });
    doc.text("This is a computer-generated invoice and does not require a signature.", pageWidth / 2, finalY + 37, { align: "center" });
    doc.save(`Amilax-Invoice-${order.full_name.replace(/\s+/g, "-")}-${order.id.slice(0, 8)}.pdf`);
    
    // Sync customer profile after invoice
    await syncCustomer(order);
    setGeneratingInvoice(null);
  };

  const countByStatus = (status: string) => orders.filter((o) => o.status === status).length;
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const trackingStep = (order: Order) => TRACKING_STEPS.findIndex(s => s.key === (order.tracking_status || "processing"));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/dashboard")} className="text-gray-500 hover:text-teal-600 text-sm">← Dashboard</button>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-800">Orders</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/admin/customers")}
            className="text-sm border border-teal-200 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition">
            👤 Customers
          </button>
          <button onClick={() => setShowClearModal(true)}
            className="text-sm border border-red-200 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition">
            🗑 Clear Orders
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "pending", "confirmed", "delivered", "cancelled"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-sm px-4 py-1.5 rounded-full capitalize border transition ${filter === s ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
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
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Order header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{order.full_name}</p>
                      <p className="text-sm text-gray-500">{order.phone} {order.email ? `· ${order.email}` : ""}</p>
                      <p className="text-sm text-gray-500">{order.delivery_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-teal-600">KES {order.total_amount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-300">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TRACKING_COLORS[order.tracking_status || "processing"]}`}>
                      {TRACKING_STEPS.find(s => s.key === (order.tracking_status || "processing"))?.emoji}{" "}
                      {TRACKING_STEPS.find(s => s.key === (order.tracking_status || "processing"))?.label}
                    </span>

                    <select value={order.status} onChange={(e) => { updateStatus(order.id, e.target.value); syncCustomer(order); }}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                      {expandedOrder === order.id ? "Hide Tracking ▲" : "Update Tracking ▼"}
                    </button>

                    <button onClick={() => generateInvoice(order)} disabled={generatingInvoice === order.id}
                      className="text-xs border border-teal-200 text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition disabled:opacity-50 ml-auto">
                      {generatingInvoice === order.id ? "Generating..." : "🧾 Download Invoice"}
                    </button>
                  </div>
                  {order.notes && <p className="text-xs text-gray-400 mt-2">Note: {order.notes}</p>}
                </div>

                {/* Tracking panel */}
                {expandedOrder === order.id && (
                  <div className="border-t px-5 py-4 bg-gray-50 rounded-b-xl">
                    <p className="text-xs font-semibold text-gray-600 mb-3">Delivery Tracking</p>
                    {/* Progress bar */}
                    <div className="flex items-center gap-0 mb-4">
                      {TRACKING_STEPS.map((step, i) => {
                        const currentIdx = trackingStep(order);
                        const isActive = i <= currentIdx;
                        const isLast = i === TRACKING_STEPS.length - 1;
                        return (
                          <div key={step.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition ${isActive ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                                {step.emoji}
                              </div>
                              <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-teal-600" : "text-gray-400"}`}>
                                {step.label}
                              </span>
                            </div>
                            {!isLast && (
                              <div className={`flex-1 h-1 mx-1 mb-4 rounded ${i < currentIdx ? "bg-teal-500" : "bg-gray-200"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Tracking buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {TRACKING_STEPS.map(step => (
                        <button key={step.key}
                          onClick={() => updateTracking(order.id, step.key)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                            (order.tracking_status || "processing") === step.key
                              ? "bg-teal-600 text-white border-teal-600"
                              : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}>
                          {step.emoji} {step.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
            <p className="text-sm text-gray-500 mb-5">This will permanently delete all orders with the selected status.</p>
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select status to clear</label>
              <div className="grid grid-cols-2 gap-2">
                {["delivered", "cancelled", "confirmed", "pending"].map((s) => (
                  <button key={s} onClick={() => setClearStatus(s)}
                    className={`py-2.5 px-4 rounded-lg border text-sm capitalize transition ${clearStatus === s ? "border-red-400 bg-red-50 text-red-600 font-medium" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {s} ({countByStatus(s)})
                  </button>
                ))}
              </div>
            </div>
            {countByStatus(clearStatus) === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">No {clearStatus} orders to clear.</p>
            )}
            <div className="flex gap-3">
              <button onClick={handleClearOrders} disabled={clearing || countByStatus(clearStatus) === 0}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50">
                {clearing ? "Clearing..." : `Clear ${countByStatus(clearStatus)} ${clearStatus} orders`}
              </button>
              <button onClick={() => setShowClearModal(false)}
                className="flex-1 border text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}