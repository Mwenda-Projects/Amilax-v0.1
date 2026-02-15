import { useState, useEffect } from "react";
import { Search, ShoppingCart, Heart, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DynamicIcon from "@/components/DynamicIcon";
import supplementCategories from "@/config/supplement-products";
import usePageMeta from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";

const Supplements = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Logic to track how many items are in the cart
  const [cartCount, setCartCount] = useState(0);

  usePageMeta({
    title: "Shop Supplements — Health & Wellness",
    description: "Browse and buy health supplements, vitamins, and wellness products online.",
  });

  // Load the current cart count when the page opens
  useEffect(() => {
    const savedCount = localStorage.getItem("amilax_cart_count");
    if (savedCount) {
      setCartCount(parseInt(savedCount));
    }
  }, []);

  const handleAddToCart = (product: any) => {
    // 1. Get existing cart data from storage
    const existingData = localStorage.getItem("amilax_cart_data");
    let cart = existingData ? JSON.parse(existingData) : [];
    
    // 2. Check if this specific item is already in the bag
    const existingItemIndex = cart.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex > -1) {
      // If it exists, just increase the quantity by 1
      cart[existingItemIndex].quantity += 1;
    } else {
      // If it's a new item, add it to the list with quantity 1
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }

    // 3. Save the updated list back to storage
    localStorage.setItem("amilax_cart_data", JSON.stringify(cart));
    
    // 4. Calculate the total count of ALL items (sum of quantities)
    const totalCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
    localStorage.setItem("amilax_cart_count", totalCount.toString());
    setCartCount(totalCount);
    
    // 5. Notify the Navbar to update the badge number instantly
    window.dispatchEvent(new Event("cartUpdate"));

    toast({
      title: "Added to Bag ✅",
      description: `${product.name} quantity updated in your cart.`,
    });
  };

  const handleWishlist = (productName: string) => {
    toast({
      title: "Saved to Wishlist ❤️",
      description: `${productName} is now in your favorites.`,
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
            Our Supplements
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
            Supplements & Wellness
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm mb-8">
            High-quality vitamins and health boosters. Browse our selection and add to your cart.
          </p>

          <div className="max-w-sm mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search vitamins, protein..."
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
                          ONLY {product.stock} LEFT
                        </span>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded">
                          IN STOCK
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
                        Add to Cart
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
          <Info className="w-4 h-4 text-primary" />
          <p>Supplements are retail products and do not require a prescription. For prescription medicines, please visit the Medicines section.</p>
        </div>
      </div>
    </>
  );
};

export default Supplements;