import { useState } from "react";
import { useLocation } from "wouter";
import { Clock, ArrowRight, Banknote, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const OWNER_EMAIL = "oluwashijibomiolaseni@gmail.com";

type PaymentMethod = "cash" | "bank_transfer";

async function sendOrderEmail(order: {
  customerName: string;
  customerEmail: string;
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
  formData.append("_subject", `🍽️ New MealDash Order — ${order.restaurantName} — ₦${order.total.toLocaleString()}`);
  formData.append("_captcha", "false");
  formData.append("_template", "table");
  formData.append("Customer Name", order.customerName);
  formData.append("Customer Email", order.customerEmail);
  formData.append("Phone", order.customerPhone);
  formData.append("Delivery Address", order.deliveryAddress);
  formData.append("Payment Method", order.paymentMethod === "cash" ? "Cash on Delivery" : "Bank Transfer");
  formData.append("Restaurant", order.restaurantName);
  formData.append("Items", order.itemsSummary);
  formData.append("Subtotal", `₦${order.subtotal.toLocaleString()}`);
  formData.append("Delivery Fee", `₦${order.deliveryFee.toLocaleString()}`);
  formData.append("TOTAL", `₦${order.total.toLocaleString()}`);

  await fetch(`https://formsubmit.co/${OWNER_EMAIL}`, {
    method: "POST",
    body: formData,
  });
}

export default function Checkout() {
  const { cart, subtotal, total, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  // Pre-fill from user profile
  const [form, setForm] = useState({
    customerName: user?.name || "",
    customerPhone: user?.phone || "",
    deliveryAddress: user?.address || "",
  });

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
      .join(" | ");

    try {
      await sendOrderEmail({
        customerName: form.customerName,
        customerEmail: user?.email || "Guest",
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
      // silent fail
    }

    const orderData = {
      id: Date.now(),
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: user?.email || "",
      deliveryAddress: form.deliveryAddress,
      paymentMethod,
      restaurantName: cart.restaurantName,
      items: cart.items,
      subtotal,
      deliveryFee: cart.deliveryFee,
      total,
      deliveryTimeMin: cart.deliveryTimeMin,
      deliveryTimeMax: cart.deliveryTimeMax,
      status: "pending",
      placedAt: new Date().toISOString(),
    };

    // Save to order history
    const history = JSON.parse(localStorage.getItem("md_orders") || "[]");
    history.unshift(orderData);
    localStorage.setItem("md_orders", JSON.stringify(history));

    sessionStorage.setItem("lastOrder", JSON.stringify(orderData));
    clearCart();
    setSubmitting(false);
    setLocation(`/order-confirmation/${orderData.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">Completing order from <span className="font-medium text-foreground">{cart.restaurantName}</span></p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Delivery Details */}
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-card-foreground">Delivery Details</h2>
                  {user && <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">Auto-filled from your profile</span>}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+234 801 234 5678" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input id="address" placeholder="Enter your delivery address in Ibadan" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} required />
                  </div>
                  {user?.email && (
                    <div>
                      <Label>Email (from account)</Label>
                      <Input value={user.email} disabled className="opacity-60" />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold text-lg text-card-foreground mb-4">Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "cash" as const, icon: Banknote, title: "Cash on Delivery", sub: "Pay when your order arrives" },
                    { key: "bank_transfer" as const, icon: CreditCard, title: "Bank Transfer", sub: "Transfer before delivery" },
                  ].map(({ key, icon: Icon, title, sub }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPaymentMethod(key)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        paymentMethod === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-card-foreground">{title}</p>
                        <p className="text-sm text-muted-foreground">{sub}</p>
                      </div>
                      {paymentMethod === key && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div className="mt-4 p-4 rounded-lg bg-muted text-sm space-y-1.5">
                    <p className="font-semibold text-card-foreground mb-2">Transfer Details</p>
                    <p><span className="text-muted-foreground">Bank:</span> <span className="font-medium">First Bank Nigeria</span></p>
                    <p><span className="text-muted-foreground">Account Name:</span> <span className="font-medium">MealDash Services</span></p>
                    <p><span className="text-muted-foreground">Account Number:</span> <span className="font-medium select-all">1234567890</span></p>
                    <p className="text-muted-foreground text-xs mt-1">Use your phone number as payment reference.</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-semibold text-lg text-card-foreground mb-4">Order Items</h2>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between text-sm">
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

            {/* Summary sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border bg-card p-6 sticky top-24">
                <h3 className="font-semibold text-lg text-card-foreground mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">₦{cart.deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium">{paymentMethod === "cash" ? "Cash" : "Bank Transfer"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{cart.deliveryTimeMin}–{cart.deliveryTimeMax} min estimated</span>
                </div>

                <Button type="submit" className="w-full mt-6 gap-2" size="lg" disabled={submitting}>
                  {submitting ? "Placing Order..." : "Place Order"}
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