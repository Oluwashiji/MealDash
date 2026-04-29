import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Package, ChefHat, Truck, CheckCircle, Clock, Phone, MapPin, Mail, Banknote, CreditCard, RefreshCw, LogOut, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

type OrderStatus = "pending" | "preparing" | "on_the_way" | "delivered";

type Order = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  paymentMethod: "cash" | "bank_transfer";
  restaurantName: string;
  items: { menuItemId: number; name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Package; color: string; bg: string }> = {
  pending:    { label: "Order Placed",  icon: Package,      color: "text-yellow-700 dark:text-yellow-300", bg: "bg-yellow-100 dark:bg-yellow-900" },
  preparing:  { label: "Preparing",     icon: ChefHat,      color: "text-blue-700 dark:text-blue-300",   bg: "bg-blue-100 dark:bg-blue-900" },
  on_the_way: { label: "On the Way",    icon: Truck,        color: "text-purple-700 dark:text-purple-300", bg: "bg-purple-100 dark:bg-purple-900" },
  delivered:  { label: "Delivered",     icon: CheckCircle,  color: "text-green-700 dark:text-green-300",  bg: "bg-green-100 dark:bg-green-900" },
};

const STATUS_FLOW: OrderStatus[] = ["pending", "preparing", "on_the_way", "delivered"];

function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

function getNextLabel(current: OrderStatus): string {
  const next = getNextStatus(current);
  if (!next) return "";
  return {
    preparing: "Mark as Preparing",
    on_the_way: "Mark as On the Way",
    delivered: "Mark as Delivered",
  }[next] || "";
}

function loadOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem("md_orders") || "[]");
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem("md_orders", JSON.stringify(orders));
}

export default function Admin() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      setLocation("/auth?from=/admin");
      return;
    }
    setOrders(loadOrders());
  }, [user, setLocation]);

  const refresh = () => setOrders(loadOrders());

  const advanceStatus = (orderId: number) => {
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;
      const next = getNextStatus(o.status);
      return next ? { ...o, status: next } : o;
    });
    setOrders(updated);
    saveOrders(updated);
  };

  if (!user?.isAdmin) return null;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const counts = STATUS_FLOW.reduce((acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }), {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">MealDash <span className="text-primary">Admin</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refresh} className="gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { logout(); setLocation("/"); }} className="gap-1 text-destructive">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Orders Dashboard</h1>
          <p className="text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STATUS_FLOW.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            return (
              <div key={s} className={`rounded-xl p-4 ${cfg.bg} cursor-pointer border-2 transition-all ${filter === s ? "border-primary" : "border-transparent"}`} onClick={() => setFilter(filter === s ? "all" : s)}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                  <span className={`text-2xl font-bold ${cfg.color}`}>{counts[s] || 0}</span>
                </div>
                <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All Orders ({orders.length})
          </Button>
          {STATUS_FLOW.map((s) => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(filter === s ? "all" : s)}>
              {STATUS_CONFIG[s].label} ({counts[s] || 0})
            </Button>
          ))}
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-lg font-medium">No orders yet</p>
            <p className="text-muted-foreground text-sm mt-1">Orders will appear here as customers place them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              const Icon = cfg.icon;
              const next = getNextStatus(order.status);
              const isExpanded = expandedId === order.id;

              return (
                <div key={order.id} className="rounded-xl border bg-card overflow-hidden">
                  {/* Order header */}
                  <div
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">#{String(order.id).slice(-6)}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentMethod === "cash" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"}`}>
                          {order.paymentMethod === "cash" ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                          {order.paymentMethod === "cash" ? "Cash" : "Bank Transfer"}
                        </span>
                      </div>
                      <p className="font-semibold text-foreground">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{order.restaurantName} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.placedAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-primary">₦{order.total.toLocaleString()}</span>
                      {next && (
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); advanceStatus(order.id); }}
                          className="whitespace-nowrap"
                        >
                          {getNextLabel(order.status)}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t px-4 sm:px-5 py-4 space-y-4 bg-muted/20">
                      {/* Contact info */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{order.customerEmail || "—"}</span>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                              <span className="font-medium">{item.name} <span className="text-muted-foreground font-normal">×{item.quantity}</span></span>
                            </div>
                            <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₦{order.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>₦{order.deliveryFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span className="text-primary">₦{order.total.toLocaleString()}</span>
                      </div>

                      {/* Status progress */}
                      <Separator />
                      <div className="flex items-center justify-between relative py-2">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
                        {STATUS_FLOW.map((s, i) => {
                          const c = STATUS_CONFIG[s];
                          const SIcon = c.icon;
                          const done = STATUS_FLOW.indexOf(order.status) >= i;
                          return (
                            <div key={s} className="relative flex flex-col items-center z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                <SIcon className="w-4 h-4" />
                              </div>
                              <span className={`text-xs mt-1 font-medium hidden sm:block ${done ? "text-primary" : "text-muted-foreground"}`}>{c.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}