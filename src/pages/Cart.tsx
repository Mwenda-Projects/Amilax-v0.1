import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, ArrowLeft, CreditCard, CheckCircle2, MapPin, Lock, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePageMeta from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Cart = () => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pickupLocation, setPickupLocation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");

  usePageMeta({
    title: "Checkout — Amilax Pharmaceuticals",
    description: "Adjust quantities and securely pay.",
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("amilax_cart_data");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // UPDATED: Sync changes to LocalStorage and Navbar
  const syncCart = (updatedItems: CartItem[]) => {
    setCartItems(updatedItems);
    localStorage.setItem("amilax_cart_data", JSON.stringify(updatedItems));
    const newCount = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
    localStorage.setItem("amilax_cart_count", newCount.toString());
    window.dispatchEvent(new Event("cartUpdate"));
  };

  // NEW: Increase/Decrease Quantity Logic
  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0); // Automatically removes if qty hits 0
    
    syncCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    syncCart(updated);
    toast({ title: "Removed", description: "Item removed from bag." });
  };

  const handleProcessPayment = () => {
    if (!pickupLocation) {
      toast({ title: "Location Required", description: "Please enter a pickup location.", variant: "destructive" });
      return;
    }
    if (paymentMethod === "card" && !showCardForm) {
      setShowCardForm(true);
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      localStorage.removeItem("amilax_cart_data");
      localStorage.setItem("amilax_cart_count", "0");
      window.dispatchEvent(new Event("cartUpdate"));
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 text-center container max-w-md">
        <div className="bg-card p-8 rounded-3xl border shadow-xl animate-in zoom-in">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-heading text-2xl mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Pickup ready at <strong>{pickupLocation}</strong>.
          </p>
          <Button asChild className="w-full"><Link to="/">Return to Home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-secondary/30">
      <div className="container max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => showCardForm ? setShowCardForm(false) : window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {showCardForm ? "Back to Methods" : "Continue Shopping"}
          </Button>
          <h1 className="font-heading text-3xl font-bold text-foreground">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {!showCardForm ? (
              <>
                <section className="bg-card p-6 rounded-2xl border shadow-sm">
                  <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" /> Order Review
                  </h2>
                  <div className="space-y-4">
                    {cartItems.length > 0 ? cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-4 border-b last:border-0">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-primary font-bold">KES {item.price.toLocaleString()}</p>
                        </div>
                        
                        {/* QUANTITY CONTROLS */}
                        <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-1 mr-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-md hover:bg-white" 
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-md hover:bg-white" 
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive/40 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )) : (
                      <p className="text-muted-foreground py-4">Your bag is empty.</p>
                    )}
                  </div>
                </section>

                <section className="bg-card p-6 rounded-2xl border shadow-sm">
                  <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Pickup Location
                  </h2>
                  <Input 
                    placeholder="Enter area (e.g. Pangani, Westlands)" 
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="h-12"
                  />
                </section>
              </>
            ) : (
              <section className="bg-card p-8 rounded-2xl border shadow-md animate-in slide-in-from-right">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-heading text-xl font-bold">Card Payment</h2>
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  <Input placeholder="Cardholder Name" className="h-12" />
                  <Input placeholder="Card Number" className="h-12" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="MM / YY" className="h-12" />
                    <Input placeholder="CVV" className="h-12" />
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="bg-card p-6 rounded-2xl border shadow-sm sticky top-24">
              <h2 className="font-heading text-xl mb-6">Summary</h2>
              
              {!showCardForm && (
                <div className="space-y-3 mb-6">
                  <button 
                    onClick={() => setPaymentMethod("mpesa")}
                    className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all ${paymentMethod === 'mpesa' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded flex items-center justify-center text-[10px] text-white font-bold">M-PESA</div>
                      <span className="font-medium text-sm">M-Pesa Express</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-10 h-10 text-blue-600" />
                      <span className="font-medium text-sm">Credit / Debit Card</span>
                    </div>
                  </button>
                </div>
              )}

              <div className="space-y-2 mb-6 border-t pt-4">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Total Items</span>
                  <span>{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-2xl pt-2">
                  <span>Pay Total</span>
                  <span className="text-primary">KES {total.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold" 
                disabled={isProcessing || cartItems.length === 0} 
                onClick={handleProcessPayment}
              >
                {isProcessing ? "Processing..." : showCardForm ? "Confirm Payment" : paymentMethod === "mpesa" ? "Pay via M-Pesa" : "Continue to Card"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;