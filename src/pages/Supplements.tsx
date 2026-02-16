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
  const { t, i18n } = useTranslation();
  
  // This is the fix: It catches 'so', 'so-SO', etc. to match your navbar
  const isSomali = i18n.language.startsWith('so');
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(0);

  usePageMeta({
    title: isSomali ? "Nafaqooyinka & Kaabsoosha" : "Shop Supplements — Health & Wellness",
    description: isSomali 
      ? "Ka baadho oo ka iabso nafaqooyinka caafimaadka, fiitamiinada, iyo waxyaabaha fayo-qabka."
      : "Browse and buy health supplements, vitamins, and wellness products online.",
  });

  useEffect(() => {
    const savedCount = localStorage.getItem("amilax_cart_count");
    if (savedCount) {
      setCartCount(parseInt(savedCount));
    }
  }, []);

  const handleAddToCart = (product: any) => {
    const existingData = localStorage.getItem("amilax_cart_data");
    let cart = existingData ? JSON.parse(existingData) : [];
    const existingItemIndex = cart.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    localStorage.setItem("amilax_cart_data", JSON.stringify(cart));
    const totalCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
    localStorage.setItem("amilax_cart_count", totalCount.toString());
    setCartCount(totalCount);
    window.dispatchEvent(new Event("cartUpdate"));

    toast({
      title: isSomali ? "Waa lagu daray ✅" : "Added to Bag ✅",
      description: isSomali 
        ? `${product.name} ayaa lagu daray gaadhigaaga.`
        : `${product.name} quantity updated in your cart.`,
    });
  };

  const handleWishlist = (productName: string) => {
    toast({
      title: isSomali ? "Waa la kaydiyay ❤️" : "Saved to Wishlist ❤️",
      description: isSomali 
        ? `${productName} hadda waxay ku jirtaa kuwa aad jeceshahay.`
        : `${productName} is now in your favorites.`,
    });
  };

  const filtered = supplementCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.products.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <section className="py-14 bg-primary/5">
        <div className="container text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
            {isSomali ? "Nafaqooyinkeenna" : "Our Supplements"}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
            {isSomali ? "Nafaqooyinka & Kaabsoosha" : "Supplements & Wellness"}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm mb-8">
            {isSomali 
              ? "Fiitamiino tayo leh iyo kor u qaadayaasha caafimaadka. Baadho xulashadeena oo ku dar gaadhigaaga."
              : "High-quality vitamins and health boosters. Browse our selection and add to your cart."}
          </p>

          <div className="max-w-sm mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isSomali ? "Raadi fiitamiinada..." : "Search vitamins, protein..."}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {filtered.map((cat) => (
            <div key={cat.name} className="mb-12">
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <DynamicIcon name={cat.icon} className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-xl">{cat.name}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.products.map((product) => (
                  <div key={product.id} className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.dosage}</p>
                      </div>
                      <span className="font-bold text-primary text-lg">
                        KES {product.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                      {product.stock <= 5 ? (
                        <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded">
                          {isSomali ? "WAXAA HARAY KALIYA" : "ONLY"} {product.stock} {isSomali ? "" : "LEFT"}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded">
                          {isSomali ? "WAA LA HELAYAA" : "IN STOCK"}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 gap-2 bg-primary hover:bg-foreground transition-colors" 
                        variant="default"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isSomali ? "Ku dar Gaadhiga" : "Add to Cart"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleWishlist(product.name)}
                        className="hover:text-destructive hover:border-destructive transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container pb-10">
        <div className="bg-secondary/40 p-4 rounded-lg flex gap-3 items-center text-xs text-muted-foreground">
          <span className="w-4 h-4 text-primary"><Info size={16} /></span>
          <p>
            {isSomali 
              ? "Nafaqooyinka waa alaab tafaariiq ah umana baahna qoraal dhakhtar. Wixii daawooyin qoraal ah, fadlan booqo qaybta Daawooyinka."
              : "Supplements are retail products and do not require a prescription. For prescription medicines, please visit the Medicines section."}
          </p>
        </div>
      </div>
    </>
  );
};

export default Supplements;