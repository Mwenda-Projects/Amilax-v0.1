import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Setting {
  key: string;
  value: string;
}

const SETTING_LABELS: Record<string, string> = {
  whatsapp_number: "WhatsApp Number",
  operating_hours: "Operating Hours",
  email: "Email Address",
  disclaimer: "Disclaimer Text",
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/admin");
    };
    checkAuth();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    (data || []).forEach((s: Setting) => { map[s.key] = s.value; });
    setSettings(map);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() })
    );
    await Promise.all(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center">
        <button onClick={() => navigate("/admin/dashboard")} className="text-gray-500 hover:text-teal-600 text-sm">← Dashboard</button>
        <span className="text-gray-300 mx-3">|</span>
        <span className="font-semibold text-gray-800">Site Settings</span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Store Information</h2>
          <p className="text-sm text-gray-500 mb-6">These details appear on the website and are used for customer contact.</p>

          {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
            <form onSubmit={handleSave} className="space-y-5">
              {Object.keys(SETTING_LABELS).map(key => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{SETTING_LABELS[key]}</label>
                  {key === "disclaimer" ? (
                    <textarea
                      value={settings[key] || ""}
                      onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  ) : (
                    <input
                      value={settings[key] || ""}
                      onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  )}
                </div>
              ))}

              <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-teal-700">
                Save Changes
              </button>

              {saved && (
                <p className="text-green-600 text-sm font-medium">✓ Settings saved successfully!</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}