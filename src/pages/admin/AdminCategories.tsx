import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", slug: "", description: "", display_order: 0 });
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin");
    };
    checkAuth();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("display_order");
    setCategories(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-");
    if (editing) {
      await supabase.from("categories").update({ ...form, slug }).eq("id", editing.id);
    } else {
      await supabase.from("categories").insert({ ...form, slug });
    }
    setForm({ name: "", slug: "", description: "", display_order: 0 });
    setEditing(null);
    setShowForm(false);
    fetchCategories();
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, display_order: cat.display_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchCategories();
  };

  const toggleActive = async (cat: Category) => {
    await supabase.from("categories").update({ is_active: !cat.is_active }).eq("id", cat.id);
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/dashboard")} className="text-gray-500 hover:text-teal-600 text-sm">← Dashboard</button>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-800">Categories</span>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", slug: "", description: "", display_order: 0 }); }}
          className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          + Add Category
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="font-semibold text-gray-800 mb-4">{editing ? "Edit Category" : "New Category"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Slug (auto-generated if empty)</label>
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Display Order</label>
                <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700">
                  {editing ? "Update" : "Create"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-5 py-2 rounded-lg text-sm border hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${cat.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {cat.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(cat)} className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50">
                    {cat.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleEdit(cat)} className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}