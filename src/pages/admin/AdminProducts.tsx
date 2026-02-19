import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  cost_price: number;
  stock_count: number;
  is_in_stock: boolean;
  is_featured: boolean;
  is_active: boolean;
  category_id: string;
  image_url: string;
  sku: string;
  ingredients: string;
  dosage: string;
  warnings: string;
  batch_number: string;
  expiry_date: string;
}

interface Category {
  id: string;
  name: string;
}

const emptyForm = {
  name: "", slug: "", description: "", price: 0, cost_price: 0,
  stock_count: 0, category_id: "", image_url: "", is_featured: false,
  is_active: true, sku: "", ingredients: "", dosage: "", warnings: "",
  batch_number: "", expiry_date: "",
};

export default function AdminProducts() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "inventory">("basic");
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin");
    };
    checkAuth();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name").eq("is_active", true);
    setCategories(data || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);

    if (error) {
      alert("Image upload failed. Please try again.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    const payload = {
      ...form,
      slug,
      is_in_stock: form.stock_count > 0,
      expiry_date: form.expiry_date || null,
      cost_price: form.cost_price || null,
    };
    if (editing) {
      await supabase.from("products").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("products").insert(payload);
    }
    resetForm();
    fetchProducts();
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    setImagePreview("");
    setActiveTab("basic");
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description,
      price: p.price, cost_price: p.cost_price || 0,
      stock_count: p.stock_count, category_id: p.category_id,
      image_url: p.image_url, is_featured: p.is_featured,
      is_active: p.is_active, sku: p.sku || "",
      ingredients: p.ingredients || "", dosage: p.dosage || "",
      warnings: p.warnings || "", batch_number: p.batch_number || "",
      expiry_date: p.expiry_date || "",
    });
    setImagePreview(p.image_url || "");
    setShowForm(true);
    setActiveTab("basic");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const margin = form.cost_price > 0
    ? Math.round(((form.price - form.cost_price) / form.price) * 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/dashboard")} className="text-gray-500 hover:text-teal-600 text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-800">Products</span>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          + Add Product
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">{editing ? "Edit Product" : "New Product"}</h2>
              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {(["basic", "details", "inventory"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${activeTab === tab ? "bg-white shadow text-teal-600" : "text-gray-500 hover:text-gray-700"}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* BASIC TAB */}
              {activeTab === "basic" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Name *</label>
                      <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Category</label>
                      <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Selling Price (KES) *</label>
                      <input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">
                        Cost Price (KES)
                        {margin !== null && (
                          <span className={`ml-2 text-xs font-medium ${margin >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {margin}% margin
                          </span>
                        )}
                      </label>
                      <input type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Product Image</label>
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-gray-400 text-xs text-center px-2">No image</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                          className="w-full border-2 border-dashed border-teal-300 text-teal-600 rounded-lg py-3 text-sm hover:bg-teal-50 transition disabled:opacity-50">
                          {uploading ? "Uploading..." : "📁 Upload from Computer"}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <p className="text-xs text-gray-400 text-center">or paste a URL below</p>
                        <input value={form.image_url}
                          onChange={e => { setForm({ ...form, image_url: e.target.value }); setImagePreview(e.target.value); }}
                          placeholder="https://..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                      Featured product
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                      Active (visible on site)
                    </label>
                  </div>
                </>
              )}

              {/* DETAILS TAB */}
              {activeTab === "details" && (
                <>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Dosage / Usage Instructions</label>
                    <textarea value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })}
                      rows={2} placeholder="e.g. Take 1 capsule daily with food"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Ingredients</label>
                    <textarea value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })}
                      rows={3} placeholder="e.g. Ascorbic Acid 1000mg, Rose Hip Extract 25mg..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Warnings / Contraindications</label>
                    <textarea value={form.warnings} onChange={e => setForm({ ...form, warnings: e.target.value })}
                      rows={3} placeholder="e.g. Not suitable for pregnant women. Keep out of reach of children."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                </>
              )}

              {/* INVENTORY TAB */}
              {activeTab === "inventory" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Stock Count</label>
                      <input type="number" value={form.stock_count} onChange={e => setForm({ ...form, stock_count: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">SKU Number</label>
                      <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                        placeholder="e.g. AMX-VIT-001"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Batch Number</label>
                      <input value={form.batch_number} onChange={e => setForm({ ...form, batch_number: e.target.value })}
                        placeholder="e.g. BATCH-2024-001"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Expiry Date</label>
                      <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>

                  {form.expiry_date && new Date(form.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded-lg px-4 py-3">
                      ⚠️ This product expires within 90 days!
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2 border-t">
                <button type="submit" disabled={uploading}
                  className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                  {editing ? "Update Product" : "Create Product"}
                </button>
                <button type="button" onClick={resetForm}
                  className="text-gray-500 px-5 py-2 rounded-lg text-sm border hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product List */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="space-y-3">
            {products.length === 0 && <p className="text-gray-400 text-sm">No products yet. Add your first one!</p>}
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-lg object-cover border border-gray-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      KES {p.price?.toLocaleString()}
                      {p.cost_price > 0 && (
                        <span className="text-green-600 ml-2 text-xs">
                          {Math.round(((p.price - p.cost_price) / p.price) * 100)}% margin
                        </span>
                      )}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock_count <= 5 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-700"}`}>
                        Stock: {p.stock_count}
                      </span>
                      {p.sku && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{p.sku}</span>}
                      {p.expiry_date && new Date(p.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">⚠️ Expiring soon</span>
                      )}
                      {p.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Featured</span>}
                      {!p.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(p)} className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}