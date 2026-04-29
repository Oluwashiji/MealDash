import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Package, ChefHat, Truck, CheckCircle, Clock, Phone, MapPin, Mail,
  Banknote, CreditCard, RefreshCw, LogOut, UtensilsCrossed, LayoutDashboard,
  ShoppingBag, TrendingUp, Users, Plus, Pencil, Trash2, ToggleLeft,
  ToggleRight, X, Save, AlertCircle, Star, Menu as MenuIcon, Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { restaurants, menuItems as baseMenuItems, type MenuItem } from "@/lib/data";

/* ─── Types ─────────────────────────────────────────────────── */
type OrderStatus = "pending" | "preparing" | "on_the_way" | "delivered";
type AdminTab = "overview" | "orders" | "menu";

type Order = {
  id: number; customerName: string; customerPhone: string; customerEmail: string;
  deliveryAddress: string; paymentMethod: "cash" | "bank_transfer";
  restaurantName: string;
  items: { menuItemId: number; name: string; price: number; quantity: number; image: string }[];
  subtotal: number; deliveryFee: number; total: number;
  status: OrderStatus; placedAt: string;
};

/* ─── Constants ──────────────────────────────────────────────── */
const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Package; color: string; bg: string; dot: string }> = {
  pending:    { label: "Order Placed",  icon: Package,     color: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-950",   dot: "bg-amber-400" },
  preparing:  { label: "Preparing",    icon: ChefHat,     color: "text-blue-700 dark:text-blue-300",     bg: "bg-blue-50 dark:bg-blue-950",     dot: "bg-blue-400" },
  on_the_way: { label: "On the Way",   icon: Truck,       color: "text-violet-700 dark:text-violet-300", bg: "bg-violet-50 dark:bg-violet-950", dot: "bg-violet-400" },
  delivered:  { label: "Delivered",    icon: CheckCircle, color: "text-emerald-700 dark:text-emerald-300",bg: "bg-emerald-50 dark:bg-emerald-950",dot: "bg-emerald-500" },
};
const STATUS_FLOW: OrderStatus[] = ["pending", "preparing", "on_the_way", "delivered"];
const NEXT_LABEL: Record<string, string> = { preparing: "Mark Preparing", on_the_way: "Mark On the Way", delivered: "Mark Delivered" };

/* ─── Menu storage helpers ───────────────────────────────────── */
const MENU_KEY = "md_menu_overrides";

function loadMenuItems(): MenuItem[] {
  try {
    const saved = localStorage.getItem(MENU_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveMenuItems(items: MenuItem[]) {
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

/* ─── Orders helpers ─────────────────────────────────────────── */
function loadOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem("md_orders") || "[]"); } catch { return []; }
}
function saveOrders(o: Order[]) { localStorage.setItem("md_orders", JSON.stringify(o)); }

/* ─── Sub-components ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof Package; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-card border rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function OrderCard({ order, onAdvance }: { order: Order; onAdvance: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;
  const nextIdx = STATUS_FLOW.indexOf(order.status) + 1;
  const nextStatus = STATUS_FLOW[nextIdx] as OrderStatus | undefined;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">#{String(order.id).slice(-6)}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <Icon className="w-3 h-3" />
                {cfg.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentMethod === "cash" ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300" : "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"}`}>
                {order.paymentMethod === "cash" ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                {order.paymentMethod === "cash" ? "Cash" : "Bank Transfer"}
              </span>
            </div>
            <p className="font-bold text-foreground text-lg leading-tight">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.restaurantName} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {new Date(order.placedAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-3">
            <span className="text-2xl font-black text-primary">₦{order.total.toLocaleString()}</span>
            {nextStatus && (
              <Button size="sm" className="whitespace-nowrap text-xs h-8"
                onClick={(e) => { e.stopPropagation(); onAdvance(order.id); }}>
                {NEXT_LABEL[nextStatus]}
              </Button>
            )}
            {order.status === "delivered" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="w-3 h-3" /> Complete
              </span>
            )}
          </div>
        </div>

        {/* Status progress bar */}
        <div className="mt-4 flex items-center gap-1">
          {STATUS_FLOW.map((s, i) => {
            const done = STATUS_FLOW.indexOf(order.status) >= i;
            return (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${done ? "bg-primary" : "bg-border"}`} />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          {STATUS_FLOW.map((s) => (
            <span key={s} className="text-[10px] text-muted-foreground">{STATUS_CONFIG[s].label}</span>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-muted/30 px-4 sm:px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4 flex-shrink-0 text-primary" />{order.customerPhone}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4 flex-shrink-0 text-primary" /><span className="truncate">{order.customerEmail || "—"}</span></div>
            <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />{order.deliveryAddress}</div>
          </div>
          <Separator />
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                  <span className="font-medium">{item.name} <span className="text-muted-foreground font-normal">×{item.quantity}</span></span>
                </div>
                <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>₦{order.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm text-muted-foreground"><span>Delivery</span><span>₦{order.deliveryFee.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">₦{order.total.toLocaleString()}</span></div>
        </div>
      )}
    </div>
  );
}

/* ─── Menu Item Form ─────────────────────────────────────────── */
type MenuFormData = Omit<MenuItem, "id" | "restaurantId">;
const emptyForm: MenuFormData = { name: "", description: "", price: 0, image: "", category: "", isAvailable: true, isPopular: false };

function MenuModal({ item, restaurantId, onSave, onClose }: {
  item?: MenuItem; restaurantId: number; onSave: (data: MenuItem) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<MenuFormData>(item ? { ...item } : { ...emptyForm });

  const set = (k: keyof MenuFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.category) return;
    onSave({ ...form, id: item?.id ?? Date.now(), restaurantId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">{item ? "Edit Menu Item" : "Add New Item"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><Label>Name *</Label><Input placeholder="e.g. Jollof Rice & Chicken" value={form.name} onChange={set("name")} /></div>
          <div><Label>Description</Label><Input placeholder="Short description of the item" value={form.description} onChange={set("description")} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price (₦) *</Label><Input type="number" placeholder="3500" value={form.price || ""} onChange={set("price")} /></div>
            <div>
              <Label>Category *</Label>
              <Input placeholder="e.g. Main, Drinks, Sides" value={form.category} onChange={set("category")} />
            </div>
          </div>
          <div><Label>Image URL</Label><Input placeholder="https://images.unsplash.com/..." value={form.image} onChange={set("image")} /></div>
          {form.image && <img src={form.image} alt="preview" className="w-full h-32 object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = "none")} />}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm((p) => ({ ...p, isPopular: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium">Mark as Popular</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={handleSave} disabled={!form.name || !form.price || !form.category}>
            <Save className="w-4 h-4" /> Save Item
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Admin Page ────────────────────────────────────────── */
export default function Admin() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "all">("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuRestaurantId, setMenuRestaurantId] = useState<number>(1);
  const [menuSearch, setMenuSearch] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null | "new">(null);

  // Import base data
  useEffect(() => {
    import { menuItems as baseMenuItems } from "@/lib/data";
    const saved = loadMenuItems();
    setMenuItems(saved || baseMenuItems);
  }, []);

  useEffect(() => {
    if (!user?.isAdmin) { setLocation("/auth?from=/admin"); return; }
    setOrders(loadOrders());
  }, [user, setLocation]);

  const refresh = () => setOrders(loadOrders());

  const advanceStatus = (orderId: number) => {
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;
      const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1];
      return next ? { ...o, status: next } : o;
    });
    setOrders(updated);
    saveOrders(updated);
  };

  const saveItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      const updated = exists ? prev.map((i) => i.id === item.id ? item : i) : [...prev, item];
      saveMenuItems(updated);
      return updated;
    });
    setEditingItem(null);
  }, []);

  const deleteItem = (id: number) => {
    if (!window.confirm("Delete this menu item?")) return;
    setMenuItems((prev) => { const u = prev.filter((i) => i.id !== id); saveMenuItems(u); return u; });
  };

  const toggleAvailable = (id: number) => {
    setMenuItems((prev) => {
      const u = prev.map((i) => i.id === id ? { ...i, isAvailable: !i.isAvailable } : i);
      saveMenuItems(u);
      return u;
    });
  };

  if (!user?.isAdmin) return null;

  const counts = STATUS_FLOW.reduce((acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }), {} as Record<string, number>);
  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const filteredOrders = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);
  const restaurantItems = menuItems.filter((i) => i.restaurantId === menuRestaurantId && (menuSearch ? i.name.toLowerCase().includes(menuSearch.toLowerCase()) : true));

  const tabs: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "menu", label: "Menu Management", icon: MenuIcon },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar + layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r flex-shrink-0 flex flex-col hidden md:flex">
          <div className="p-5 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground leading-tight">MealDash</p>
                <p className="text-xs text-primary font-medium">Admin Panel</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <Icon className="w-4 h-4" /> {label}
                {key === "orders" && orders.filter((o) => o.status === "pending").length > 0 && (
                  <span className="ml-auto bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {orders.filter((o) => o.status === "pending").length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <button onClick={() => { logout(); setLocation("/"); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="bg-card border-b px-6 h-16 flex items-center justify-between flex-shrink-0">
            <div>
              <h1 className="font-bold text-xl text-foreground">{tabs.find((t) => t.key === tab)?.label}</h1>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refresh} className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" />Refresh</Button>
              {/* Mobile tabs */}
              <div className="flex md:hidden gap-1">
                {tabs.map(({ key, icon: Icon }) => (
                  <Button key={key} variant={tab === key ? "default" : "ghost"} size="icon" onClick={() => setTab(key)}>
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
          </header>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={ShoppingBag} label="Total Orders" value={orders.length} sub="All time" color="bg-primary/10 text-primary" />
                  <StatCard icon={TrendingUp} label="Revenue" value={`₦${totalRevenue.toLocaleString()}`} sub="Delivered orders" color="bg-emerald-100 dark:bg-emerald-950 text-emerald-600" />
                  <StatCard icon={Clock} label="Pending" value={counts["pending"] || 0} sub="Need action" color="bg-amber-100 dark:bg-amber-950 text-amber-600" />
                  <StatCard icon={Users} label="Customers" value={new Set(orders.map((o) => o.customerEmail)).size} sub="Unique" color="bg-violet-100 dark:bg-violet-950 text-violet-600" />
                </div>

                {/* Live order pipeline */}
                <div className="bg-card border rounded-2xl p-5">
                  <h2 className="font-bold text-lg mb-4">Order Pipeline</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STATUS_FLOW.map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      const Icon = cfg.icon;
                      return (
                        <button key={s} onClick={() => { setTab("orders"); setOrderFilter(s); }}
                          className={`p-4 rounded-xl ${cfg.bg} text-left hover:opacity-80 transition-opacity`}>
                          <Icon className={`w-6 h-6 ${cfg.color} mb-2`} />
                          <p className={`text-3xl font-black ${cfg.color}`}>{counts[s] || 0}</p>
                          <p className={`text-sm font-medium mt-1 ${cfg.color}`}>{cfg.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent orders preview */}
                <div className="bg-card border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">Recent Orders</h2>
                    <Button variant="ghost" size="sm" onClick={() => setTab("orders")}>View all</Button>
                  </div>
                  {orders.length === 0 ? (
                    <div className="text-center py-10">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((o) => {
                        const cfg = STATUS_CONFIG[o.status];
                        const Icon = cfg.icon;
                        return (
                          <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg}`}>
                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{o.customerName}</p>
                                <p className="text-xs text-muted-foreground">{o.restaurantName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">₦{o.total.toLocaleString()}</p>
                              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── ORDERS ── */}
            {tab === "orders" && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {[{ v: "all" as const, label: `All (${orders.length})` }, ...STATUS_FLOW.map((s) => ({ v: s, label: `${STATUS_CONFIG[s].label} (${counts[s] || 0})` }))].map(({ v, label }) => (
                    <Button key={v} variant={orderFilter === v ? "default" : "outline"} size="sm" onClick={() => setOrderFilter(v)}>{label}</Button>
                  ))}
                </div>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-20 rounded-2xl border border-dashed bg-card">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-lg font-medium">No orders here</p>
                  </div>
                ) : (
                  filteredOrders.map((o) => <OrderCard key={o.id} order={o} onAdvance={advanceStatus} />)
                )}
              </div>
            )}

            {/* ── MENU MANAGEMENT ── */}
            {tab === "menu" && (
              <div className="space-y-5">
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Changes made here are reflected <strong>immediately</strong> on the customer-facing menu. Toggling an item unavailable hides it from customers without deleting it.
                  </p>
                </div>

                {/* Restaurant selector + search + add */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex gap-2 flex-wrap">
                    {restaurants.map((r) => (
                      <button key={r.id} onClick={() => setMenuRestaurantId(r.id)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${menuRestaurantId === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"}`}>
                        {r.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Input placeholder="Search items..." value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} className="w-48" />
                    <Button className="gap-2 whitespace-nowrap" onClick={() => setEditingItem("new")}>
                      <Plus className="w-4 h-4" /> Add Item
                    </Button>
                  </div>
                </div>

                {/* Menu items grid */}
                {restaurantItems.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl border border-dashed bg-card">
                    <MenuIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No items found</p>
                    <Button className="mt-4 gap-2" onClick={() => setEditingItem("new")}><Plus className="w-4 h-4" />Add First Item</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {restaurantItems.map((item) => (
                      <div key={item.id} className={`bg-card border rounded-2xl overflow-hidden transition-all ${!item.isAvailable ? "opacity-60" : ""}`}>
                        <div className="relative h-36 bg-muted">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Image className="w-8 h-8" /></div>
                          )}
                          <div className="absolute top-2 left-2 flex gap-1">
                            {item.isPopular && <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center gap-1"><Star className="w-3 h-3" />Popular</span>}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.isAvailable ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"}`}>
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-primary font-bold text-lg">₦{item.price.toLocaleString()}</span>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{item.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                            <button onClick={() => toggleAvailable(item.id)}
                              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors flex-1 justify-center ${item.isAvailable ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                              {item.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                              {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                            </button>
                            <button onClick={() => setEditingItem(item)}
                              className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteItem(item.id)}
                              className="p-1.5 rounded-lg bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu item modal */}
      {editingItem !== null && (
        <MenuModal
          item={editingItem === "new" ? undefined : editingItem}
          restaurantId={menuRestaurantId}
          onSave={saveItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}