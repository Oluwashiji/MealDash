// artifacts/meal-dash/src/pages/Admin.tsx
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Package, ChefHat, Truck, CheckCircle, Clock, Phone, MapPin, Mail,
  Banknote, CreditCard, RefreshCw, LogOut, UtensilsCrossed, LayoutDashboard,
  ShoppingBag, TrendingUp, Users, Plus, Pencil, Trash2, ToggleLeft,
  ToggleRight, X, Save, AlertCircle, Star, Menu as MenuIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAdminRestaurants, useAdminMenuItems } from "@/lib/useData";
import { updateRestaurant, createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/api";
import type { ApiRestaurant, ApiMenuItem } from "@/lib/api";
import type { Restaurant, MenuItem } from "@/lib/data";

type OrderStatus = "pending" | "preparing" | "on_the_way" | "delivered";
type AdminTab = "overview" | "orders" | "menu" | "restaurants";
type Order = {
  id: number; customerName: string; customerPhone: string; customerEmail: string;
  deliveryAddress: string; paymentMethod: "cash" | "bank_transfer";
  restaurantName: string;
  items: { menuItemId: number; name: string; price: number; quantity: number; image: string }[];
  subtotal: number; deliveryFee: number; total: number;
  status: OrderStatus; placedAt: string;
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Package; color: string; bg: string; dot: string }> = {
  pending:    { label: "Order Placed",  icon: Package,     color: "text-amber-700 dark:text-amber-300",    bg: "bg-amber-50 dark:bg-amber-950",    dot: "bg-amber-400"   },
  preparing:  { label: "Preparing",    icon: ChefHat,     color: "text-blue-700 dark:text-blue-300",      bg: "bg-blue-50 dark:bg-blue-950",      dot: "bg-blue-400"    },
  on_the_way: { label: "On the Way",   icon: Truck,       color: "text-violet-700 dark:text-violet-300",  bg: "bg-violet-50 dark:bg-violet-950",  dot: "bg-violet-400"  },
  delivered:  { label: "Delivered",    icon: CheckCircle, color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950", dot: "bg-emerald-500" },
};
const STATUS_FLOW: OrderStatus[] = ["pending", "preparing", "on_the_way", "delivered"];
const NEXT_LABEL: Record<string, string> = {
  preparing: "Mark Preparing", on_the_way: "Mark On the Way", delivered: "Mark Delivered",
};

function loadOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem("md_orders") || "[]"); } catch { return []; }
}
function saveOrders(o: Order[]) { localStorage.setItem("md_orders", JSON.stringify(o)); }

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Package; label: string; value: string | number; sub?: string; color: string;
}) {
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

// ── Order Card ────────────────────────────────────────────────
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
              <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                #{String(order.id).slice(-6)}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <Icon className="w-3 h-3" /> {cfg.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                order.paymentMethod === "cash"
                  ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                  : "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"
              }`}>
                {order.paymentMethod === "cash" ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                {order.paymentMethod === "cash" ? "Cash" : "Bank Transfer"}
              </span>
            </div>
            <p className="font-bold text-foreground text-lg leading-tight">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">
              {order.restaurantName} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </p>
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
        <div className="mt-4 flex items-center gap-1">
          {STATUS_FLOW.map((s, i) => {
            const done = STATUS_FLOW.indexOf(order.status) >= i;
            return <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${done ? "bg-primary" : "bg-border"}`} />;
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
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0 text-primary" />{order.customerPhone}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
              <span className="truncate">{order.customerEmail || "—"}</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />{order.deliveryAddress}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")} />
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

// ── Menu Item Modal ───────────────────────────────────────────
function MenuModal({ item, restaurants, onSave, onClose }: {
  item?: MenuItem; restaurants: Restaurant[]; onSave: (data: Omit<MenuItem, "id"> & { id?: number }) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    restaurantId: item?.restaurantId ?? restaurants[0]?.id ?? 1,
    name: item?.name ?? "", description: item?.description ?? "",
    price: item?.price ?? 0, image: item?.image ?? "",
    category: item?.category ?? "", isAvailable: item?.isAvailable ?? true, isPopular: item?.isPopular ?? false,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">{item ? "Edit Menu Item" : "Add New Item"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <Label>Restaurant *</Label>
            <select value={form.restaurantId}
              onChange={(e) => setForm((p) => ({ ...p, restaurantId: Number(e.target.value) }))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div><Label>Item Name *</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Jollof Rice & Chicken" /></div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Short description" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price (₦) *</Label><Input type="number" value={form.price || ""} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} placeholder="3500" /></div>
            <div><Label>Category *</Label><Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Main, Drinks, Sides…" /></div>
          </div>
          <div>
            <Label>Image URL</Label>
            <Input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="https://images.unsplash.com/..." />
            <p className="text-xs text-muted-foreground mt-1">Must be a direct image link ending in .jpg, .png or .webp — not a YouTube or webpage URL</p>
          </div>
          {form.image && (
            <img src={form.image} alt="preview" className="w-full h-32 object-cover rounded-xl border"
              onError={(e) => { e.currentTarget.alt = "Invalid image URL"; e.currentTarget.style.opacity = "0.3"; }} />
          )}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium">Available to customers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm((p) => ({ ...p, isPopular: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium">Mark as Popular</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={() => onSave({ ...form, id: item?.id })}
            disabled={!form.name || !form.price || !form.category}>
            <Save className="w-4 h-4" /> Save Item
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Restaurant Edit Modal ─────────────────────────────────────
function RestaurantModal({ restaurant, onSave, onClose }: {
  restaurant: Restaurant; onSave: (data: Partial<Restaurant>) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ ...restaurant });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">Edit {restaurant.name}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
          <div>
            <Label>Image URL</Label>
            <Input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="https://images.unsplash.com/..." />
            <p className="text-xs text-muted-foreground mt-1">Direct image link only — ending in .jpg, .png or .webp</p>
          </div>
          {form.image && (
            <img src={form.image} alt="preview" className="w-full h-36 object-cover rounded-xl border"
              onError={(e) => { e.currentTarget.style.opacity = "0.3"; }} />
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Delivery Fee (₦)</Label><Input type="number" value={form.deliveryFee} onChange={(e) => setForm((p) => ({ ...p, deliveryFee: Number(e.target.value) }))} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Min Delivery (min)</Label><Input type="number" value={form.deliveryTimeMin} onChange={(e) => setForm((p) => ({ ...p, deliveryTimeMin: Number(e.target.value) }))} /></div>
            <div><Label>Max Delivery (min)</Label><Input type="number" value={form.deliveryTimeMax} onChange={(e) => setForm((p) => ({ ...p, deliveryTimeMax: Number(e.target.value) }))} /></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isOpen} onChange={(e) => setForm((p) => ({ ...p, isOpen: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-medium">Restaurant is Open</span>
          </label>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={() => onSave(form)}><Save className="w-4 h-4" /> Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────
export default function Admin() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [tab, setTab] = useState<AdminTab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "all">("all");
  const [menuRestaurantId, setMenuRestaurantId] = useState<number>(1);
  const [menuSearch, setMenuSearch] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null | "new">(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  const {
    restaurants, setRestaurants, loading: rLoading, refetch: refetchRestaurants,
  } = useAdminRestaurants();
  const {
    menuItems, setMenuItems, loading: mLoading, refetch: refetchMenu,
  } = useAdminMenuItems();

  // Guard: redirect non-admins immediately
  useEffect(() => {
    if (user?.isAdmin) {
      setOrders(loadOrders());
    }
  }, [user]);

  const advanceStatus = (orderId: number) => {
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;
      const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1];
      return next ? { ...o, status: next } : o;
    });
    setOrders(updated);
    saveOrders(updated);
  };

  const handleSaveItem = async (data: Omit<MenuItem, "id"> & { id?: number }) => {
    try {
      if (data.id) {
        const updated = await updateMenuItem(data.id, data as Partial<ApiMenuItem>);
        setMenuItems((prev) => prev.map((i) => i.id === updated.id ? { ...i, ...updated } : i));
        toast({ title: "Item updated ✅", description: "Changes are live for all customers" });
      } else {
        const created = await createMenuItem(data as Omit<ApiMenuItem, "id">);
        setMenuItems((prev) => [...prev, { ...created }]);
        toast({ title: "Item added ✅", description: "Now visible to all customers" });
      }
      setEditingItem(null);
    } catch {
      toast({ title: "Save failed", description: "Could not reach the server. Check your connection.", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Delete this menu item permanently?")) return;
    try {
      await deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Item deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      const updated = await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
      setMenuItems((prev) => prev.map((i) => i.id === updated.id ? { ...i, ...updated } : i));
      toast({ title: `${updated.name} is now ${updated.isAvailable ? "available ✅" : "unavailable ❌"}` });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleSaveRestaurant = async (data: Partial<Restaurant>) => {
    if (!editingRestaurant) return;
    try {
      const updated = await updateRestaurant(editingRestaurant.id, data as Partial<ApiRestaurant>);
      setRestaurants((prev) => prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r));
      setEditingRestaurant(null);
      toast({ title: "Restaurant updated ✅", description: "Changes are live for all customers" });
    } catch {
      toast({ title: "Save failed", description: "Could not reach the server.", variant: "destructive" });
    }
  };

  if (!user?.isAdmin) return null;

  const counts = STATUS_FLOW.reduce(
    (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }),
    {} as Record<string, number>
  );
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.total, 0);
  const filteredOrders = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);
  const restaurantMenuItems = menuItems.filter(
    (i) => i.restaurantId === menuRestaurantId &&
      (menuSearch ? i.name.toLowerCase().includes(menuSearch.toLowerCase()) : true)
  );

  const tabs: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "menu", label: "Menu", icon: MenuIcon },
    { key: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex h-screen overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className="w-64 bg-card border-r flex-shrink-0 flex-col hidden md:flex">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                <Icon className="w-4 h-4" /> {label}
                {key === "orders" && counts["pending"] > 0 && (
                  <span className="ml-auto bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {counts["pending"]}
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

        {/* ── Main Content ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b px-6 h-16 flex items-center justify-between flex-shrink-0">
            <div>
              <h1 className="font-bold text-xl text-foreground">{tabs.find((t) => t.key === tab)?.label}</h1>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { refetchRestaurants(); refetchMenu(); setOrders(loadOrders()); }} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
              {/* Mobile tab buttons */}
              <div className="flex md:hidden gap-1">
                {tabs.map(({ key, icon: Icon }) => (
                  <Button key={key} variant={tab === key ? "default" : "ghost"} size="icon" onClick={() => setTab(key)}>
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">

            {/* ── OVERVIEW ─────────────────────────── */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={ShoppingBag} label="Total Orders" value={orders.length} sub="All time" color="bg-primary/10 text-primary" />
                  <StatCard icon={TrendingUp} label="Revenue" value={`₦${totalRevenue.toLocaleString()}`} sub="Delivered" color="bg-emerald-100 dark:bg-emerald-950 text-emerald-600" />
                  <StatCard icon={Clock} label="Pending" value={counts["pending"] || 0} sub="Need action" color="bg-amber-100 dark:bg-amber-950 text-amber-600" />
                  <StatCard icon={Users} label="Customers" value={new Set(orders.map((o) => o.customerEmail)).size} sub="Unique" color="bg-violet-100 dark:bg-violet-950 text-violet-600" />
                </div>

                <div className="bg-card border rounded-2xl p-5">
                  <h2 className="font-bold text-lg mb-4">Order Pipeline</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STATUS_FLOW.map((s) => {
                      const cfg = STATUS_CONFIG[s]; const Icon = cfg.icon;
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

                <div className="bg-card border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">Recent Orders</h2>
                    <Button variant="ghost" size="sm" onClick={() => setTab("orders")}>View all</Button>
                  </div>
                  {orders.length === 0 ? (
                    <div className="text-center py-10">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No orders yet — they'll appear here as customers place them</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((o) => {
                        const cfg = STATUS_CONFIG[o.status]; const Icon = cfg.icon;
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

            {/* ── ORDERS ───────────────────────────── */}
            {tab === "orders" && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {[
                    { v: "all" as const, label: `All (${orders.length})` },
                    ...STATUS_FLOW.map((s) => ({ v: s, label: `${STATUS_CONFIG[s].label} (${counts[s] || 0})` })),
                  ].map(({ v, label }) => (
                    <Button key={v} variant={orderFilter === v ? "default" : "outline"} size="sm" onClick={() => setOrderFilter(v)}>{label}</Button>
                  ))}
                </div>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-20 rounded-2xl border border-dashed bg-card">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-lg font-medium">No orders here</p>
                  </div>
                ) : filteredOrders.map((o) => <OrderCard key={o.id} order={o} onAdvance={advanceStatus} />)}
              </div>
            )}

            {/* ── MENU ─────────────────────────────── */}
            {tab === "menu" && (
              <div className="space-y-5">
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p><strong>Changes save to the database</strong> and are immediately visible to all customers on every device.</p>
                    <p className="mt-1">For images, use direct links from <strong>unsplash.com</strong> or upload to <strong>imgur.com</strong> and copy the direct .jpg link.</p>
                  </div>
                </div>

                {mLoading && <p className="text-muted-foreground text-sm">Loading menu items…</p>}

                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <div className="flex gap-2 flex-wrap">
                    {restaurants.map((r) => (
                      <button key={r.id} onClick={() => setMenuRestaurantId(r.id)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                          menuRestaurantId === r.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:border-primary/40"
                        }`}>
                        {r.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 sm:ml-auto">
                    <Input placeholder="Search items…" value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} className="w-48" />
                    <Button className="gap-2 whitespace-nowrap" onClick={() => setEditingItem("new")}>
                      <Plus className="w-4 h-4" /> Add Item
                    </Button>
                  </div>
                </div>

                {restaurantMenuItems.length === 0 && !mLoading ? (
                  <div className="text-center py-16 rounded-2xl border border-dashed bg-card">
                    <MenuIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No items found for this restaurant</p>
                    <Button className="mt-4 gap-2" onClick={() => setEditingItem("new")}><Plus className="w-4 h-4" /> Add First Item</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {restaurantMenuItems.map((item) => (
                      <div key={item.id} className={`bg-card border rounded-2xl overflow-hidden transition-all ${!item.isAvailable ? "opacity-60" : ""}`}>
                        <div className="relative h-36 bg-muted overflow-hidden">
                          {item.image
                            ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                            : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                          }
                          <div className="absolute top-2 left-2 flex gap-1">
                            {item.isPopular && <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-xs font-bold flex items-center gap-1"><Star className="w-3 h-3" /> Popular</span>}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="font-bold text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-primary font-bold text-lg">₦{item.price.toLocaleString()}</span>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{item.category}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                            <button onClick={() => handleToggleAvailable(item as MenuItem)}
                              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors flex-1 justify-center ${
                                item.isAvailable
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}>
                              {item.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                              {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                            </button>
                            <button onClick={() => setEditingItem(item as MenuItem)}
                              className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteItem(item.id)}
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

            {/* ── RESTAURANTS ──────────────────────── */}
            {tab === "restaurants" && (
              <div className="space-y-4">
                {rLoading && <p className="text-muted-foreground text-sm">Loading restaurants…</p>}
                <p className="text-muted-foreground text-sm">Edit any restaurant's image, name, description, delivery time, fee, or open/closed status. Changes go live instantly for all customers.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurants.map((r) => (
                    <div key={r.id} className="bg-card border rounded-2xl overflow-hidden">
                      <div className="relative h-36 bg-muted">
                        <img src={r.image} alt={r.name} className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")} />
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${r.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {r.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.cuisine} · {r.address}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{r.rating}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.deliveryTimeMin}–{r.deliveryTimeMax} min</span>
                          <span>₦{r.deliveryFee} delivery</span>
                        </div>
                        <Button size="sm" className="w-full mt-3 gap-2" variant="outline"
                          onClick={() => setEditingRestaurant(r as Restaurant)}>
                          <Pencil className="w-3.5 h-3.5" /> Edit Restaurant
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingItem !== null && (
        <MenuModal
          item={editingItem === "new" ? undefined : editingItem}
          restaurants={restaurants as Restaurant[]}
          onSave={handleSaveItem}
          onClose={() => setEditingItem(null)}
        />
      )}
      {editingRestaurant && (
        <RestaurantModal
          restaurant={editingRestaurant}
          onSave={handleSaveRestaurant}
          onClose={() => setEditingRestaurant(null)}
        />
      )}
    </div>
  );
}