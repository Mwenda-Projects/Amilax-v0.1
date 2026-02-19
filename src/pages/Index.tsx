import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, ShoppingCart, Search, ArrowRight, Shield, Clock, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getWhatsAppUrl } from "@/config/whatsapp";
import { useToast } from "@/hooks/use-toast";
import usePageMeta from "@/hooks/usePageMeta";
import { useTranslation } from "react-i18next";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock_count: number;
  image_url: string;
  is_in_stock: boolean;
  is_featured: boolean;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  bg_color: string;
}

const FALLBACK_SLIDES = [
  { id: "1", title: "Vitamins & Wellness", subtitle: "Boost your immune system with our premium vitamin range", cta_text: "Shop Now", cta_link: "/supplements", image_url: "", bg_color: "from-teal-800 via-teal-700 to-teal-600" },
  { id: "2", title: "Prescription Medicines", subtitle: "Send us your prescription via WhatsApp — ready same day", cta_text: "WhatsApp Us", cta_link: "whatsapp", image_url: "", bg_color: "from-gray-900 via-teal-900 to-teal-800" },
];

const Index = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  usePageMeta({
    title: "Quality Medicines, Honestly Dispensed",
    description: "Amilax Pharmaceuticals — your trusted neighbourhood pharmacy in Eastleigh, Nairobi.",
  });

  useEffect(() => {
    fetchAll();
    startAutoSlide();
    return () => { if (slideInterval.current) clearInterval(slideInterval.current); };
  }, []);

  const fetchAll = async () => {
    const [{ data: cats }, { data: prods }, { data: bans }] = await Promise.all([
      supabase.from("categories").select("id, name").eq("is_active", true).order("display_order"),
      supabase.from("products").select("*").eq("is_active", true).order("is_featured", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("banners").select("*").eq("is_active", true).order("display_order"),
    ]);
    setCategories(cats || []);
    setProducts(prods || []);
    setBanners(bans && bans.length > 0 ? bans : FALLBACK_SLIDES);
    setLoading(false);
  };

  const startAutoSlide = () => {
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % (banners.length || FALLBACK_SLIDES.length));
    }, 4500);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (slideInterval.current) clearInterval(slideInterval.current);
    startAutoSlide();
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const existingData = localStorage.getItem("amilax_cart_data");
    let cart = existingData ? JSON.parse(existingData) : [];
    const idx = cart.findIndex((item: any) => item.id === product.id);
    if (idx > -1) { cart[idx].quantity += 1; }
    else { cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 }); }
    localStorage.setItem("amilax_cart_data", JSON.stringify(cart));
    const totalCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
    localStorage.setItem("amilax_cart_count", totalCount.toString());
    window.dispatchEvent(new Event("cartUpdate"));
    toast({ title: "Added to bag!", description: `${product.name} added to your cart.` });
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const slides = banners.length > 0 ? banners : FALLBACK_SLIDES;
  const slide = slides[currentSlide] || slides[0];

  const handleCtaClick = () => {
    if (slide.cta_link === "whatsapp") {
      window.open(getWhatsAppUrl(), "_blank");
    } else {
      navigate(slide.cta_link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── CAROUSEL ── */}
      <section
        className={`relative overflow-hidden transition-all duration-700 ${!slide.image_url ? `bg-gradient-to-r ${slide.bg_color}` : ""}`}
        style={{ minHeight: 360 }}
      >
        {/* Background image if set */}
        {slide.image_url && (
          <>
            <img src={slide.image_url} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}

        <div className="container py-16 flex flex-col items-center text-center relative z-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-300 mb-1">
            Licensed & Trusted Since 2022
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-1">
            <span className="text-white">Amilax </span>
            <span className="text-amber-400">Pharmaceuticals</span>
          </h1>

          {/* Slide content */}
          <div className="mt-6 mb-8 transition-all duration-500">
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">{slide.title}</h2>
            {slide.subtitle && <p className="text-white/80 text-sm max-w-sm mx-auto">{slide.subtitle}</p>}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 justify-center flex-wrap mb-8">
            <button onClick={handleCtaClick}
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-6 py-2.5 rounded-xl text-sm transition">
              {slide.cta_text}
            </button>
            <button onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition">
              Browse Products ↓
            </button>
          </div>

          {/* Search */}
          <div className="w-full max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search for vitamins, supplements..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-lg"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 p-2 rounded-full transition">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => goToSlide((currentSlide + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 p-2 rounded-full transition">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all ${i === currentSlide ? "bg-amber-400 w-6" : "bg-white/40 w-2"}`} />
            ))}
          </div>
        )}
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="bg-white border-b">
        <div className="container py-3">
          <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-teal-600" />100% Genuine Products</div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-600" />Open 9AM – Midnight</div>
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-teal-600" />Local Delivery Available</div>
            <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-teal-600" />WhatsApp Support</div>
          </div>
        </div>
      </section>

      {/* ── SHOP ── */}
      <section id="shop" className="py-10">
        <div className="container">
          <div className="flex gap-2 flex-wrap mb-4">
            <button onClick={() => setActiveCategory("all")}
              className={`text-sm px-4 py-1.5 rounded-full border font-medium transition ${activeCategory === "all" ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"}`}>
              All Products
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`text-sm px-4 py-1.5 rounded-full border font-medium transition ${activeCategory === cat.id ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"}`}>
                {cat.name}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-400 mb-4">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> products
          </p>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-xl border h-64 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(product => (
                <div key={product.id} onClick={() => product.slug && navigate(`/supplements/${product.slug}`)}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer">
                  <div className="relative overflow-hidden h-40 bg-gray-50">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.is_featured && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">⭐ Top Seller</span>}
                      {!product.is_in_stock ? (
                        <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">Out of Stock</span>
                      ) : product.stock_count <= 5 ? (
                        <span className="text-[9px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded">Only {product.stock_count} left</span>
                      ) : (
                        <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">In Stock</span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm text-gray-800 leading-snug mb-1 line-clamp-2">{product.name}</h3>
                    {product.description && <p className="text-xs text-gray-400 line-clamp-2 mb-2 flex-1">{product.description}</p>}
                    <span className="font-bold text-teal-600 text-sm">KES {product.price.toLocaleString()}</span>
                    <button onClick={(e) => handleAddToCart(product, e)} disabled={!product.is_in_stock}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2 rounded-lg transition">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {product.is_in_stock ? "Add to Cart" : "Out of Stock"}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); product.slug && navigate(`/supplements/${product.slug}`); }}
                      className="text-[11px] text-teal-600 hover:underline mt-1.5 text-center">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="text-center mt-10">
              <Link to="/supplements"
                className="inline-flex items-center gap-2 text-sm text-teal-600 border border-teal-200 hover:bg-teal-50 px-6 py-2.5 rounded-xl transition font-medium">
                View All Supplements <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── PRESCRIPTION BAND ── */}
      <section className="bg-teal-700 text-white py-12 mt-6">
        <div className="container text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-2">Need a Prescription Medicine?</h2>
          <p className="text-teal-200 text-sm mb-6 max-w-sm mx-auto">
            Send us your prescription via WhatsApp and we'll have it ready for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-xl transition text-sm">
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </a>
            <Link to="/medicines"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-6 py-3 rounded-xl transition text-sm">
              Browse Medicines <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;