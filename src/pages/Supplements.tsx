import { useState, useEffect } from "react";
import { Search, ShoppingCart, Heart, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DynamicIcon from "@/components/DynamicIcon";
import supplementCategories from "@/config/supplement-products";
import usePageMeta from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Supplements = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);

  usePageMeta({
    title: t("supplements.title"),
    description: t("supplements.description"),
  });

  useEffect(() => {
    const savedCount = localStorage.getItem("amilax_cart_count");
    if (savedCount) setCartCount(parseInt(savedCount));
  }, []);

  const handleAddToCart = (product: any) => {
    const existingData = localStorage.getItem("amilax_cart_data");
    let cart = existingData ? JSON.parse(existingData) : [];
    const existingItemIndex = cart.findIndex(
      (item: any) => item.id === product.id
    );

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    localStorage.setItem("amilax_cart_data", JSON.stringify(cart));
    const totalCount = cart.reduce(
      (acc: number, item: any) => acc + item.quantity,
      0
    );
    localStorage.setItem("amilax_cart_count", totalCount.toString());
    setCartCount(totalCount);
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
        title: isWishlisted
          ? t("supplements.removedFromWishlist")
          : t("supplements.savedToWishlist"),
        description: isWishlisted
          ? t("supplements.removedFromWishlistDesc", { name: productName })
          : t("supplements.savedToWishlistDesc", { name: productName }),
      });
      return isWishlisted
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
    });
  };

  const filtered = supplementCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.products.some((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

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
          {filtered.map((cat) => (
            <div key={cat.name} className="mb-14">
              {/* Category header */}
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <DynamicIcon name={cat.icon} className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-xl">{cat.name}</h2>
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.products.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);

                  // Pull translated description and benefits by product id
                  const description = t(
                    `supplements.products.${product.id}.description`,
                    { defaultValue: "" }
                  );
                  const benefits = t(
                    `supplements.products.${product.id}.benefits`,
                    { returnObjects: true, defaultValue: [] }
                  ) as string[];

                  return (
                    <div
                      key={product.id}
                      className="bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col"
                    >
                      {/* Product image */}
                      {product.image && (
                        <div className="relative overflow-hidden h-44 bg-secondary/30">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Stock badge over image */}
                          <div className="absolute top-3 left-3">
                            {product.stock <= 5 ? (
                              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded shadow-sm">
                                {t("supplements.onlyLeft_one", {
                                  count: product.stock,
                                })}
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
                        {/* Name + Price */}
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-base leading-snug flex-1 pr-2">
                            {product.name}
                          </h3>
                          <span className="font-bold text-primary text-base whitespace-nowrap">
                            KES {product.price.toLocaleString()}
                          </span>
                        </div>

                        {/* Dosage */}
                        <p className="text-xs text-muted-foreground mb-3">
                          {product.dosage}
                        </p>

                        {/* Translated description */}
                        {description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">
                            {description}
                          </p>
                        )}

                        {/* Translated benefit tags */}
                        {benefits.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {benefits.map((benefit) => (
                              <span
                                key={benefit}
                                className="text-[10px] font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full"
                              >
                                {benefit}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Stock badge fallback (no image) */}
                        {!product.image && (
                          <div className="mb-4">
                            {product.stock <= 5 ? (
                              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded">
                                {t("supplements.onlyLeft_one", {
                                  count: product.stock,
                                })}
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
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {t("supplements.addToCart")}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleWishlist(product.id, product.name)
                            }
                            className={`transition-colors ${
                              isWishlisted
                                ? "text-destructive border-destructive bg-destructive/5"
                                : "hover:text-destructive hover:border-destructive"
                            }`}
                          >
                            <Heart
                              className="w-4 h-4"
                              fill={isWishlisted ? "currentColor" : "none"}
                            />
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