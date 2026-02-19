import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, Info, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import usePageMeta from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";
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
  description: string;
  products: Product[];
}

const Supplements = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "name">("default");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  usePageMeta({
    title: t("supplements.title"),
    description: t("supplements.description"),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (!cats) { setLoading(false); return; }

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const grouped = cats.map((cat) => ({
      ...cat,
      products: (products || []).filter((p) => p.category_id === cat.id),
    }));

    setCategories(grouped);
    setAllProducts(products || []);
    setLoading(false);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const existingData = localStorage.getItem("amilax_cart_data");
    let cart = existingData ? JSON.parse(existingData) : [];
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }

    localStorage.setItem("amilax_cart_data", JSON.stringify(cart));
    const totalCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
    localStorage.setItem("amilax_cart_count", totalCount.toString());
    window.dispatchEvent(new Event("cartUpdate"));

    toast({
      title: t("supplements.addedToBag"),
      description: t("supplements.addedToBagDesc", { name: product.name }),
    });
  };

  const handleWishlist = (productId: string, productName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const isWishlisted = prev.includes(productId);
      toast({
        title: isWishlisted ? t("supplements.removedFromWishlist") : t("supplements.savedToWishlist"),
        description: isWishlisted
          ? t("supplements.removedFromWishlistDesc", { name: productName })
          : t("supplements.savedToWishlistDesc", { name: productName }),
      });
      return isWishlisted ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  // Apply sort and filter
  const getSortedProducts = (products: Product[]) => {
    let sorted = [...products];
    if (sortBy === "price_asc") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  };

  // Build display: filter by category and search, then sort
  const displayCategories = categories
    .filter(cat => filterCategory === "all" || cat.id === filterCategory)
    .map(cat => ({
      ...cat,
      products: getSortedProducts(
        cat.products.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }))
    .filter(cat => cat.products.length > 0);

  const totalVisible = displayCategories.reduce((acc, cat) => acc + cat.products.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading supplements...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="py-14 bg-primary/5">
        <div className="container text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
            {t("supplements.subtitle")}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
            {t("supplements.title")}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm mb-8">
            {t("supplements.description")}
          </p>
          <div className="max-w-sm mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("supplements.searchPlaceholder")}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Sort & Filter Bar */}
      <div className="border-b bg-background sticky top-16 z-10">
        <div className="container py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{totalVisible}</span> products
          </p>
          <div className="flex items-center gap-2">
            {/* Filter by category */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition ${
                showFilters || filterCategory !== "all" ? "bg-primary text-white border-primary" : "hover:bg-secondary"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {filterCategory !== "all" && <span className="ml-1 bg-white text-primary text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">1</span>}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border hover:bg-secondary transition appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category filter dropdown */}
        {showFilters && (
          <div className="container pb-3">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterCategory("all")}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${filterCategory === "all" ? "bg-primary text-white border-primary" : "hover:bg-secondary"}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${filterCategory === cat.id ? "bg-primary text-white border-primary" : "hover:bg-secondary"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products */}
      <section className="py-12">
        <div className="container">
          {displayCategories.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-20">
              No supplements found. Check back soon!
            </p>
          )}

          {displayCategories.map((cat) => (
            <div key={cat.id} className="mb-14">
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <h2 className="font-heading text-xl">{cat.name}</h2>
                {cat.description && (
                  <span className="text-sm text-muted-foreground hidden sm:inline">— {cat.description}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.products.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => product.slug && navigate(`/supplements/${product.slug}`)}
                      className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer"
                    >
                      {/* Image */}
                      {product.image_url && (
                        <div className="relative overflow-hidden h-44 bg-secondary/30">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-3 left-3 flex flex-col gap-1">
                            {product.is_featured && (
                              <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded shadow-sm">
                                ⭐ Top Seller
                              </span>
                            )}
                            {product.stock_count <= 5 ? (
                              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded shadow-sm">
                                Only {product.stock_count} left
                              </span>
                            ) : (
                              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded shadow-sm">
                                {t("supplements.inStock")}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card body */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-base leading-snug flex-1 pr-2">{product.name}</h3>
                          <span className="font-bold text-primary text-base whitespace-nowrap">
                            KES {product.price.toLocaleString()}
                          </span>
                        </div>

                        {product.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}

                        {!product.image_url && (
                          <div className="mb-3">
                            {product.stock_count <= 5 ? (
                              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded">
                                Only {product.stock_count} left
                              </span>
                            ) : (
                              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded">
                                {t("supplements.inStock")}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto">
                          <Button
                            className="flex-1 gap-2 bg-primary hover:bg-foreground transition-colors"
                            variant="default"
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={!product.is_in_stock}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {product.is_in_stock ? t("supplements.addToCart") : "Out of Stock"}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => handleWishlist(product.id, product.name, e)}
                            className={`transition-colors ${
                              isWishlisted
                                ? "text-destructive border-destructive bg-destructive/5"
                                : "hover:text-destructive hover:border-destructive"
                            }`}
                          >
                            <Heart className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} />
                          </Button>
                        </div>

                        {/* View Details */}
                        <button
                          onClick={(e) => { e.stopPropagation(); product.slug && navigate(`/supplements/${product.slug}`); }}
                          className="text-xs text-primary hover:underline mt-2 text-center"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="container pb-10">
        <div className="bg-secondary/40 p-4 rounded-lg flex gap-3 items-center text-xs text-muted-foreground">
          <Info size={16} className="text-primary flex-shrink-0" />
          <p>{t("supplements.disclaimer")}</p>
        </div>
      </div>
    </>
  );
};

export default Supplements;