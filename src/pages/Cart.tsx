import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, ArrowLeft, CreditCard, CheckCircle2, MapPin, Lock, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import usePageMeta from "@/hooks/usePageMeta";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const Cart = () => {
  const { t, i18n } = useTranslation();
  const isSomali = i18n.language === 'so';
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pickupLocation, setPickupLocation] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");

  usePageMeta({
    title: isSomali ? "Lacag Bixinta — Amilax" : "Checkout — Amilax Pharmaceuticals",
    description: isSomali ? "Hubi alaabtaada oo si ammaan ah u bixi lacagta." : "Adjust quantities and securely pay.",
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("amilax_cart_data");
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const syncCart = (updatedItems: CartItem[]) => {
    setCartItems(updatedItems);
    localStorage.setItem("amilax_cart_data", JSON.stringify(updatedItems));
    const newCount = updatedItems.reduce((acc, item) => acc + item.quantity, 0);
    localStorage.setItem("amilax_cart_count", newCount.toString());
    window.dispatchEvent(new Event("cartUpdate"));
  };

  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
      .filter((item) => item.quantity > 0);
    syncCart(updated);
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    syncCart(updated);
    toast({
      title: isSomali ? "Waa laga saaray" : "Removed",
      description: isSomali ? "Alaabta waa laga saaray dambiisha." : "Item removed from bag.",
    });
  };

  const handleProcessPayment = async () => {
    if (!customerName) {
      toast({ title: isSomali ? "Magaca waa loo baahanyahay" : "Name Required", description: isSomali ? "Fadlan geli magacaaga." : "Please enter your name.", variant: "destructive" });
      return;
    }
    if (!customerPhone) {
      toast({ title: isSomali ? "Telefoonka waa loo baahanyahay" : "Phone Required", description: isSomali ? "Fadlan geli numberkaaga." : "Please enter your phone number.", variant: "destructive" });
      return;
    }
    if (!pickupLocation) {
      toast({ title: isSomali ? "Goobta waa loo baahanyahay" : "Location Required", description: isSomali ? "Fadlan geli halka lagaugu keenayo." : "Please enter a delivery location.", variant: "destructive" });
      return;
    }
    if (paymentMethod === "card" && !showCardForm) {
      setShowCardForm(true);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create the order in Supabase
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          full_name: customerName,
          phone: customerPhone,
          delivery_address: pickupLocation,
          total_amount: total,
          status: "pending",
          notes: `Payment method: ${paymentMethod}`,
          session_id: crypto.randomUUID(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Save each cart item as an order item
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Clear cart and show success
      localStorage.removeItem("amilax_cart_data");
      localStorage.setItem("amilax_cart_count", "0");
      window.dispatchEvent(new Event("cartUpdate"));
      setIsSuccess(true);

    } catch (error) {
      console.error("Order error:", error);
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  if (isSuccess) {
    return (
      <div className="pt-32 pb-20 text-center container max-w-md">
        <div className="bg-card p-8 rounded-3xl border shadow-xl animate-in zoom-in">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-heading text-2xl mb-2">{isSomali ? "Dalabka waa la xaqiijiyay!" : "Order Confirmed!"}</h1>
          <p className="text-muted-foreground mb-2">
            {isSomali ? "Alaabtaada waxay diyaar ku tahay" : "Delivery to"}: <strong>{pickupLocation}</strong>
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            {isSomali ? "Waxaan kula soo xiriiri doonnaa" : "We'll contact you at"}: <strong>{customerPhone}</strong>
          </p>
          <Button asChild className="w-full">
            <Link to="/">{isSomali ? "Ku noqo Bogga Hore" : "Return to Home"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-secondary/30">
      <div className="container max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => (showCardForm ? setShowCardForm(false) : window.history.back())}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {showCardForm
              ? isSomali ? "Ku noqo Qaababka" : "Back to Methods"
              : isSomali ? "Sii wad adeegashada" : "Continue Shopping"}
          </Button>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {isSomali ? "Lacag Bixinta" : "Checkout"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {!showCardForm ? (
              <>
                {/* Order Review */}
                <section className="bg-card p-6 rounded-2xl border shadow-sm">
                  <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    {isSomali ? "Eegista Dalabka" : "Order Review"}
                  </h2>
                  <div className="space-y-4">
                    {cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-4 border-b last:border-0">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-primary font-bold">KES {item.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-1 mr-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-white" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive/40 hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground py-4">{isSomali ? "Dambiishaadu waa madhan tahay." : "Your bag is empty."}</p>
                    )}
                  </div>
                </section>

                {/* Customer Details */}
                <section className="bg-card p-6 rounded-2xl border shadow-sm">
                  <h2 className="font-heading text-xl mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {isSomali ? "Faahfaahintaada" : "Your Details"}
                  </h2>
                  <div className="space-y-3">
                    <Input
                      placeholder={isSomali ? "Magacaaga oo buuxa" : "Full Name"}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-12"
                    />
                    <Input
                      placeholder={isSomali ? "Numberka Telefoonka" : "Phone Number"}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="h-12"
                    />
                    <Input
                      placeholder={isSomali ? "Geli aagga (tusaale. Pangani, Westlands)" : "Delivery Address / Area"}
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </section>
              </>
            ) : (
              <section className="bg-card p-8 rounded-2xl border shadow-md animate-in slide-in-from-right">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-heading text-xl font-bold">{isSomali ? "Bixinta Kaadhka" : "Card Payment"}</h2>
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  <Input placeholder={isSomali ? "Magaca Kaadhka" : "Cardholder Name"} className="h-12" />
                  <Input placeholder={isSomali ? "Lambarka Kaadhka" : "Card Number"} className="h-12" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="MM / YY" className="h-12" />
                    <Input placeholder="CVV" className="h-12" />
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="bg-card p-6 rounded-2xl border shadow-sm sticky top-24">
              <h2 className="font-heading text-xl mb-6">{isSomali ? "Faahfaahinta" : "Summary"}</h2>

              {!showCardForm && (
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod("mpesa")}
                    className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all ${paymentMethod === "mpesa" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-secondary/50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded flex items-center justify-center text-[10px] text-white font-bold">M-PESA</div>
                      <span className="font-medium text-sm">M-Pesa Express</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-secondary/50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-10 h-10 text-blue-600" />
                      <span className="font-medium text-sm">{isSomali ? "Kaadhka Bangiga" : "Credit / Debit Card"}</span>
                    </div>
                  </button>
                </div>
              )}

              <div className="space-y-2 mb-6 border-t pt-4">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>{isSomali ? "Wadarta Alaabta" : "Total Items"}</span>
                  <span>{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-2xl pt-2">
                  <span>{isSomali ? "Wadarta Lacagta" : "Pay Total"}</span>
                  <span className="text-primary">KES {total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg font-bold"
                disabled={isProcessing || cartItems.length === 0}
                onClick={handleProcessPayment}
              >
                {isProcessing
                  ? isSomali ? "Waa lagu guda jiraa..." : "Processing..."
                  : showCardForm
                  ? isSomali ? "Xaqiiji Lacag Bixinta" : "Confirm Payment"
                  : paymentMethod === "mpesa"
                  ? isSomali ? "Ku bixi M-Pesa" : "Pay via M-Pesa"
                  : isSomali ? "Sii wad Kaadhka" : "Continue to Card"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;