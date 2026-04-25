import { useState } from "react";
import { useLocation } from "wouter";
import { Clock, ArrowRight, Banknote, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

// ✅ Replace with your actual email address
const OWNER_EMAIL = "oluwashijibomiolaseni@gmail.com";

type PaymentMethod = "cash" | "bank_transfer";

async function sendOrderEmail(order: {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  restaurantName: string;
  itemsSummary: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}) {
  const formData = new FormData();
  formData.append("_subject", `🍽️ New MealDash Order from ${order.customerName}`);
  formData.append("_captcha", "false");
  formData.append("_template", "table");
  formData.append("Customer Name", order.customerName);
  formData.append("Phone", order.customerPhone);
  formData.append("Delivery Address", order.deliveryAddress);
  formData.append("Payment Method", order.paymentMethod === "cash" ? "Cash on Delivery" : "Bank Transfer");
  formData.append("Restaurant", order.restaurantName);
  formData.append("Items Ordered", order.itemsSummary);
  formData.append("Subtotal", `₦${order.subtotal.toLocaleString()}`);
  formData.append("Delivery Fee", `₦${order.deliveryFee.toLocaleString()}`);
  formData.append("Total", `₦${order.total.toLocaleString()}`);

  await fetch(`https://formsubmit.co/${OWNER_EMAIL}`, {
    method: "POST",
    body: formData,
  });
}

export default function Checkout() {
  const { cart, subtotal, total, itemCount, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  if (itemCount === 0) {
    setLocation("/cart");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerName || !form.customerPhone || !form.deliveryAddress) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const itemsSummary = cart.items
      .map((i) => `${i.name} x${i.quantity} (₦${(i.price * i.quantity).toLocaleString()})`)
      .join(", ");

    try {
      await sendOrderEmail({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryAddress: form.deliveryAddress,
        paymentMethod,
        restaurantName: cart.restaurantName ?? "",
        itemsSummary,
        subtotal,
        deliveryFee: cart.deliveryFee,
        total,
      });
    } catch {
      // Email fails silently — order still completes
    }

    const orderData = {
      id: Date.now(),
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      deliveryAddress: form.deliveryAddress,
      paymentMethod,
      restaurantName: cart.restaurantName,
      items: cart.items,
      subtotal,
      deliveryFee: cart.deliveryFee,
      total,
      deliveryTimeMin: cart.deliveryTimeMin,
      deliveryTimeMax: cart.deliveryTimeMax,
    };
    sessionStorage.setItem("lastOrder", JSON.stringify(orderData));

    clearCart();
    setSubmitting(false);
    setLocation(`/order-confirmation/${orderData.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">Complete your order from {cart.restaurantName}</p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Delivery Details */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold text-lg text-card-foreground mb-4">Delivery Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required data-testid="input-name" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+234 801 234 5678" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} required data-testid="input-phone" />
                  </div>
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input id="address" placeholder="Enter your delivery address in Ibadan" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} required data-testid="input-address" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold text-lg text-card-foreground mb-4">Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                    data-testid="button-pay-cash"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === "cash" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                    </div>
                    {paymentMethod === "cash" && <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank_transfer")}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      paymentMethod === "bank_transfer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                    data-testid="button-pay-bank"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === "bank_transfer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">Bank Transfer</p>
                      <p className="text-sm text-muted-foreground">Transfer before delivery</p>
                    </div>
                    {paymentMethod === "bank_transfer" && <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />}
                  </button>
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div className="mt-4 p-4 rounded-lg bg-muted text-sm space-y-1">
                    <p className="font-semibold text-card-foreground mb-2">Transfer Details</p>
                    <p><span className="text-muted-foreground">Bank:</span> <span className="font-medium">First Bank Nigeria</span></p>
                    <p><span className="text-muted-foreground">Account Name:</span> <span className="font-medium">MealDash Services</span></p>
                    <p><span className="text-muted-foreground">Account Number:</span> <span className="font-medium">1234567890</span></p>
                    <p className="text-muted-foreground mt-2 text-xs">Use your phone number as payment reference.</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold text-lg text-card-foreground mb-4">Order Items</h2>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between text-sm" data-testid={`checkout-item-${item.menuItemId}`}>
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-card-foreground">{item.name}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border bg-card p-6 sticky top-24">
                <h3 className="font-semibold text-lg text-card-foreground mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">₦{cart.deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium">{paymentMethod === "cash" ? "Cash on Delivery" : "Bank Transfer"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Estimated: {cart.deliveryTimeMin}-{cart.deliveryTimeMax} min</span>
                </div>

                <Button type="submit" className="w-full mt-6 gap-2" size="lg" disabled={submitting} data-testid="button-place-order">
                  {submitting ? "Placing order..." : "Place Order"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}