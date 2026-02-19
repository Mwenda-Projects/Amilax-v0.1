import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  bg_color: string;
  is_active: boolean;
  display_order: number;
}

const emptyForm = {
  title: "",
  subtitle: "",
  cta_text: "Shop Now",
  cta_link: "/supplements",
  image_url: "",
  is_active: true,
  display_order: 0,
};

const BG_OPTIONS = [
  { label: "Teal (Default)", value: "from-teal-800 via-teal-700 to-teal-600" },
  { label: "Dark Teal", value: "from-slate-800 via-teal-800 to-teal-700" },
  { label: "Emerald", value: "from-teal-700 via-teal-600 to-emerald-600" },
  { label: "Dark", value: "from-gray-900 via-teal-900 to-teal-800" },
];

export default function AdminBanners() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [bgColor, setBgColor] = useState(BG_OPTIONS[0].value);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin");
    };
    checkAuth();
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("display_order");
    setBanners(data || []);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const fileName = `banner-${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
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
    const payload = { ...form, bg_color: bgColor };

    if (editing) {
      await supabase.from("banners").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("banners").insert(payload);
    }
    resetForm();
    fetchBanners();
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    setImagePreview("");
    setBgColor(BG_OPTIONS[0].value);
  };

  const handleEdit = (b: Banner) => {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      cta_text: b.cta_text || "Shop Now",
      cta_link: b.cta_link || "/supplements",
      image_url: b.image_url || "",
      is_active: b.is_active,
      display_order: b.display_order || 0,
    });
    setImagePreview(b.image_url || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await supabase.from("banners").delete().eq("id", id);
    fetchBanners();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("banners").update({ is_active: !current }).eq("id", id);
    fetchBanners();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/dashboard")} className="text-gray-500 hover:text-teal-600 text-sm">
            ← Dashboard
          </button>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-800">Banners</span>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          + Add Banner
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-sm text-gray-500 mb-6">
          Manage the sliding banners on the homepage. Add images, titles and call-to-action buttons. Drag to reorder using the display order field.
        </p>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="font-semibold text-gray-800 mb-5">{editing ? "Edit Banner" : "New Banner"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Vitamins & Wellness"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Display Order</label>
                  <input type="number" value={form.display_order}
                    onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Boost your immune system with our premium vitamin range"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Button Text</label>
                  <input value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })}
                    placeholder="e.g. Shop Now"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Button Link</label>
                  <input value={form.cta_link} onChange={e => setForm({ ...form, cta_link: e.target.value })}
                    placeholder="e.g. /supplements"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>

              {/* Background color */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Background Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BG_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setBgColor(opt.value)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition bg-gradient-to-r ${opt.value} text-white ${bgColor === opt.value ? "ring-2 ring-teal-500 ring-offset-1" : "opacity-70 hover:opacity-100"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Banner Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-gray-400 text-xs text-center px-2">No image</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="w-full border-2 border-dashed border-teal-300 text-teal-600 rounded-lg py-3 text-sm hover:bg-teal-50 transition disabled:opacity-50">
                      {uploading ? "Uploading..." : "📁 Upload Banner Image"}
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

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                Active (visible on homepage)
              </label>

              <div className="flex gap-3 pt-2 border-t">
                <button type="submit" disabled={uploading}
                  className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
                  {editing ? "Update Banner" : "Create Banner"}
                </button>
                <button type="button" onClick={resetForm}
                  className="text-gray-500 px-5 py-2 rounded-lg text-sm border hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banner list */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="space-y-3">
            {banners.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-xl border">
                No banners yet. Add your first one!
              </div>
            )}
            {banners.map(b => (
              <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                {/* Image preview */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-r ${b.bg_color || BG_OPTIONS[0].value}`} />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{b.title}</p>
                  {b.subtitle && <p className="text-xs text-gray-400 line-clamp-1">{b.subtitle}</p>}
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      Order: {b.display_order}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      → {b.cta_link}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(b.id, b.is_active)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${b.is_active ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                    {b.is_active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => handleEdit(b)}
                    className="text-xs border px-3 py-1.5 rounded-lg hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(b.id)}
                    className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}