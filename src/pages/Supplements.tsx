import { useState, useEffect } from "react";
import { Search, ShoppingCart, Heart, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import usePageMeta from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Product {
  id: string;
  name: string;
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
  icon: string;
  products: Product[];
}

const Supplements = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);

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
    setLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    const existingData = localStorage.getItem("amilax_cart_data");
    let cart = existingData ? JSON.parse(existingData) : [];
    const existingItemIndex = cart.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
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

  const handleWishlist = (productId: string, productName: string) => {
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

  const filtered = categories
    .map((cat) => ({
      ...cat,
      products: cat.products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((cat) => cat.products.length > 0);

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

      {/* Products */}
      <section className="py-12">
        <div className="container">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-20">
              No supplements found. Check back soon!
            </p>
          )}

          {filtered.map((cat) => (
            <div key={cat.id} className="mb-14">
              {/* Category header */}
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <h2 className="font-heading text-xl">{cat.name}</h2>
                {cat.description && (
                  <span className="text-sm text-muted-foreground hidden sm:inline">— {cat.description}</span>
                )}
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.products.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col"
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
                          <div className="absolute top-3 left-3">
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
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                            {product.description}
                          </p>
                        )}

                        {!product.image_url && (
                          <div className="mb-4">
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
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.is_in_stock}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {product.is_in_stock ? t("supplements.addToCart") : "Out of Stock"}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleWishlist(product.id, product.name)}
                            className={`transition-colors ${
                              isWishlisted
                                ? "text-destructive border-destructive bg-destructive/5"
                                : "hover:text-destructive hover:border-destructive"
                            }`}
                          >
                            <Heart className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} />
                          </Button>
                        </div>
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