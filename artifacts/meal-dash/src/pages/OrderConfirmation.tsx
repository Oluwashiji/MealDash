import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { CheckCircle, Clock, Truck, ChefHat, Package, MapPin, Phone, User, Banknote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type OrderData = {
  id: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: "cash" | "bank_transfer";
  restaurantName: string;
  items: { menuItemId: number; name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
};

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "on_the_way", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrderConfirmation() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [visible, setVisible] = useState(false);
  const [checkVisible, setCheckVisible] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("lastOrder");
    if (stored) {
      setOrder(JSON.parse(stored));
    }
    // Stagger animations
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setCheckVisible(true), 400);
  }, [params.id]);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero success banner */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-8 mb-8 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute top-4 left-8 w-12 h-12 rounded-full bg-white/10" />

          <div
            className={`relative w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${checkVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-500" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" data-testid="text-order-confirmed">
            Order Placed! 🎉
          </h1>
          <p className="text-white/85 text-lg">
            Your food is on its way from <span className="font-semibold">{order.restaurantName}</span>
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium">
            <Clock className="w-4 h-4" />
            Estimated delivery: {order.deliveryTimeMin}–{order.deliveryTimeMax} min
          </div>
        </div>

        {/* Order Status Tracker */}
        <div
          className={`rounded-xl border bg-card p-6 mb-6 transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          data-testid="order-status-tracker"
        >
          <h2 className="font-semibold text-lg text-card-foreground mb-6">Order Status</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-1000" style={{ width: "0%" }} />
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === 0; // "Order Placed" is active
              const isCurrent = index === 0;
              return (
                <div key={step.key} className="relative flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"} ${isCurrent ? "ring-4 ring-green-500/20" : ""}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 font-medium text-center ${isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        <div className={`rounded-xl border bg-card p-6 mb-6 transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="font-semibold text-lg text-card-foreground mb-4">Payment</h2>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.paymentMethod === "cash" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}`}>
              {order.paymentMethod === "cash" ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-semibold text-card-foreground">
                {order.paymentMethod === "cash" ? "Cash on Delivery" : "Bank Transfer"}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.paymentMethod === "cash"
                  ? "Have cash ready when your rider arrives"
                  : "Please ensure your transfer is complete before delivery"}
              </p>
            </div>
          </div>
          {order.paymentMethod === "bank_transfer" && (
            <div className="mt-4 p-3 rounded-lg bg-muted text-sm space-y-1">
              <p><span className="text-muted-foreground">Bank:</span> <span className="font-medium">First Bank Nigeria</span></p>
              <p><span className="text-muted-foreground">Account Name:</span> <span className="font-medium">MealDash Services</span></p>
              <p><span className="text-muted-foreground">Account Number:</span> <span className="font-medium">1234567890</span></p>
              <p><span className="text-muted-foreground">Reference:</span> <span className="font-medium">{order.customerPhone}</span></p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className={`rounded-xl border bg-card p-6 mb-6 transition-all duration-700 delay-[400ms] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="font-semibold text-lg text-card-foreground mb-4">Order Details</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground"> ×{item.quantity}</span>
                  </div>
                </div>
                <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>₦{order.deliveryFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600 dark:text-green-400">₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className={`rounded-xl border bg-card p-6 mb-8 transition-all duration-700 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="font-semibold text-lg text-card-foreground mb-4">Delivery Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{order.customerPhone}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">Address:</span>
              <span className="font-medium">{order.deliveryAddress}</span>
            </div>
          </div>
        </div>

        <div className={`flex gap-4 justify-center transition-all duration-700 delay-[600ms] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Link href="/orders">
            <Button variant="outline" data-testid="button-view-orders">View All Orders</Button>
          </Link>
          <Link href="/restaurants">
            <Button className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-order-again">Order Again</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}