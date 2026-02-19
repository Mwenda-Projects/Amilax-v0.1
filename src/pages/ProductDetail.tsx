import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Heart, ArrowLeft, Package, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
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
  ingredients: string;
  dosage: string;
  warnings: string;
  sku: string;
  category_id: string;
  categories?: { name: string };
}

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "ingredients" | "dosage" | "warnings">("description");

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    setProduct(data);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
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

  const handleWishlist = () => {
    setIsWishlisted(prev => {
      toast({
        title: prev ? t("supplements.removedFromWishlist") : t("supplements.savedToWishlist"),
        description: prev
          ? t("supplements.removedFromWishlistDesc", { name: product?.name })
          : t("supplements.savedToWishlistDesc", { name: product?.name }),
      });
      return !prev;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Button onClick={() => navigate("/supplements")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Supplements
        </Button>
      </div>
    );
  }

  const tabs = [
    { key: "description", label: "Description", content: product.description, icon: <Info className="w-4 h-4" /> },
    { key: "ingredients", label: "Ingredients", content: product.ingredients, icon: <Package className="w-4 h-4" /> },
    { key: "dosage", label: "Dosage", content: product.dosage, icon: <CheckCircle className="w-4 h-4" /> },
    { key: "warnings", label: "Warnings", content: product.warnings, icon: <AlertTriangle className="w-4 h-4" /> },
  ].filter(tab => tab.content);

  return (
    <div className="min-h-screen bg-secondary/20 py-10">
      <div className="container max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/supplements" className="hover:text-primary transition-colors">Supplements</Link>
          <span>/</span>
          {product.categories?.name && (
            <>
              <span className="hover:text-primary transition-colors">{product.categories.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-card rounded-2xl border shadow-sm p-6 lg:p-10 mb-8">
          {/* Image */}
          <div className="relative">
            {product.image_url ? (
              <div className="rounded-xl overflow-hidden bg-secondary/30 aspect-square">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-xl bg-secondary/30 aspect-square flex items-center justify-center">
                <Package className="w-20 h-20 text-muted-foreground/30" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.is_featured && (
                <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded shadow-sm">
                  ⭐ Top Seller
                </span>
              )}
              {product.stock_count <= 5 && product.stock_count > 0 ? (
                <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded shadow-sm">
                  Only {product.stock_count} left
                </span>
              ) : product.is_in_stock ? (
                <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded shadow-sm">
                  In Stock
                </span>
              ) : (
                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-1 rounded shadow-sm">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {product.categories?.name && (
              <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                {product.categories.name}
              </span>
            )}
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-primary mb-6">
              KES {product.price.toLocaleString()}
            </div>

            {product.sku && (
              <p className="text-xs text-muted-foreground mb-4">SKU: {product.sku}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button
                className="flex-1 gap-2 bg-primary hover:bg-foreground transition-colors h-12 text-base"
                onClick={handleAddToCart}
                disabled={!product.is_in_stock}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.is_in_stock ? t("supplements.addToCart") : "Out of Stock"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 transition-colors ${
                  isWishlisted
                    ? "text-destructive border-destructive bg-destructive/5"
                    : "hover:text-destructive hover:border-destructive"
                }`}
                onClick={handleWishlist}
              >
                <Heart className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} />
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-fit gap-2 text-muted-foreground -ml-2"
              onClick={() => navigate("/supplements")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Supplements
            </Button>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl mb-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-card shadow text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {tabs.map(tab => (
              activeTab === tab.key && (
                <div key={tab.key} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {tab.key === "warnings" && (
                    <div className="flex items-center gap-2 text-orange-600 font-medium mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      Please read carefully before use
                    </div>
                  )}
                  {tab.content}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;