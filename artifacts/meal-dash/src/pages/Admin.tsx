import { useState } from "react";
import { LayoutDashboard, Store, UtensilsCrossed, Users, Plus, Pencil, Trash2, Clock, Package, ChefHat, Truck, CheckCircle, XCircle } from "lucide-react";
import {
  useGetDashboardSummary,
  useListRestaurants,
  useAdminCreateRestaurant,
  useAdminUpdateRestaurant,
  useAdminDeleteRestaurant,
  getListRestaurantsQueryKey,
  useGetMenu,
  getGetMenuQueryKey,
  useAdminCreateMenuItem,
  useAdminUpdateMenuItem,
  useAdminDeleteMenuItem,
  useListApplications,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

function DashboardTab() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  if (!summary) return null;

  const stats = [
    { label: "Restaurants", value: summary.totalRestaurants, icon: Store, color: "text-primary" },
    { label: "Menu Items", value: summary.totalMenuItems, icon: UtensilsCrossed, color: "text-secondary" },
    { label: "Orders", value: summary.totalOrders, icon: Package, color: "text-accent-foreground" },
    { label: "Applications", value: summary.totalApplications, icon: Users, color: "text-destructive" },
  ];

  const statusIcons: Record<string, typeof Package> = {
    pending: Clock,
    preparing: ChefHat,
    on_the_way: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border bg-card p-4" data-testid={`stat-${stat.label.toLowerCase()}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.entries(summary.ordersByStatus).map(([status, count]) => {
            const Icon = statusIcons[status] || Package;
            return (
              <div key={status} className="text-center p-3 rounded-lg bg-muted">
                <Icon className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{status.replace("_", " ")}</p>
              </div>
            );
          })}
        </div>
      </div>

      {summary.recentOrders.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold text-card-foreground mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {summary.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted text-sm">
                <div>
                  <span className="font-medium">#{order.id}</span> - {order.restaurantName}
                </div>
                <div className="flex items-center gap-3">
                  <span className="capitalize text-muted-foreground">{order.status.replace("_", " ")}</span>
                  <span className="font-bold text-primary">N{order.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RestaurantsTab() {
  const { data: restaurants, isLoading } = useListRestaurants();
  const queryClient = useQueryClient();
  const createRestaurant = useAdminCreateRestaurant();
  const updateRestaurant = useAdminUpdateRestaurant();
  const deleteRestaurant = useAdminDeleteRestaurant();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", image: "", category: "top" as string, deliveryTimeMin: 20, deliveryTimeMax: 35, deliveryFee: 500, address: "", tags: "" });

  const resetForm = () => setForm({ name: "", description: "", image: "", category: "top", deliveryTimeMin: 20, deliveryTimeMax: 35, deliveryFee: 500, address: "", tags: "" });

  const handleCreate = () => {
    createRestaurant.mutate(
      { data: { ...form, deliveryTimeMin: Number(form.deliveryTimeMin), deliveryTimeMax: Number(form.deliveryTimeMax), deliveryFee: Number(form.deliveryFee), tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), category: form.category as "top" | "campus" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setShowCreate(false);
          resetForm();
          toast({ title: "Restaurant created" });
        },
      }
    );
  };

  const handleUpdate = () => {
    if (!editId) return;
    updateRestaurant.mutate(
      { id: editId, data: { ...form, deliveryTimeMin: Number(form.deliveryTimeMin), deliveryTimeMax: Number(form.deliveryTimeMax), deliveryFee: Number(form.deliveryFee), tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), category: form.category as "top" | "campus" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
          setEditId(null);
          resetForm();
          toast({ title: "Restaurant updated" });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteRestaurant.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListRestaurantsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Restaurant deleted" });
        },
      }
    );
  };

  const formFields = (
    <div className="space-y-3">
      <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-admin-restaurant-name" /></div>
      <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="campus">Campus</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Delivery Fee</Label><Input type="number" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Min Time (min)</Label><Input type="number" value={form.deliveryTimeMin} onChange={(e) => setForm({ ...form, deliveryTimeMin: Number(e.target.value) })} /></div>
        <div><Label>Max Time (min)</Label><Input type="number" value={form.deliveryTimeMax} onChange={(e) => setForm({ ...form, deliveryTimeMax: Number(e.target.value) })} /></div>
      </div>
      <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Fast Delivery, Top Rated" /></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Restaurants</h3>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" onClick={resetForm} data-testid="button-add-restaurant"><Plus className="w-4 h-4" /> Add Restaurant</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Restaurant</DialogTitle></DialogHeader>
            {formFields}
            <Button onClick={handleCreate} disabled={createRestaurant.isPending}>{createRestaurant.isPending ? "Creating..." : "Create"}</Button>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : (
        <div className="space-y-3">
          {restaurants?.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border bg-card" data-testid={`admin-restaurant-${r.id}`}>
              <div className="flex items-center gap-3">
                <img src={r.image} alt={r.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-card-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{r.category}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={editId === r.id} onOpenChange={(open) => { if (!open) setEditId(null); }}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => { setEditId(r.id); setForm({ name: r.name, description: r.description, image: r.image, category: r.category, deliveryTimeMin: r.deliveryTimeMin, deliveryTimeMax: r.deliveryTimeMax, deliveryFee: r.deliveryFee, address: r.address, tags: r.tags.join(", ") }); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Edit Restaurant</DialogTitle></DialogHeader>
                    {formFields}
                    <Button onClick={handleUpdate} disabled={updateRestaurant.isPending}>{updateRestaurant.isPending ? "Saving..." : "Save"}</Button>
                  </DialogContent>
                </Dialog>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(r.id)} data-testid={`button-delete-restaurant-${r.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItemsTab() {
  const { data: restaurants } = useListRestaurants();
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const { data: menuItems, isLoading } = useGetMenu(
    selectedRestaurant || 0,
    {},
    { query: { enabled: !!selectedRestaurant, queryKey: getGetMenuQueryKey(selectedRestaurant || 0) } }
  );
  const queryClient = useQueryClient();
  const createItem = useAdminCreateMenuItem();
  const updateItem = useAdminUpdateMenuItem();
  const deleteItem = useAdminDeleteMenuItem();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: 0, image: "", category: "" });

  const resetForm = () => setForm({ name: "", description: "", price: 0, image: "", category: "" });

  const formFields = (
    <div className="space-y-3">
      <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
        <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Main, Sides, Drinks..." /></div>
      </div>
      <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={selectedRestaurant?.toString() || ""} onValueChange={(v) => setSelectedRestaurant(Number(v))}>
          <SelectTrigger className="w-64" data-testid="select-admin-restaurant"><SelectValue placeholder="Select restaurant" /></SelectTrigger>
          <SelectContent>
            {restaurants?.map((r) => (
              <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRestaurant && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1" onClick={resetForm} data-testid="button-add-menu-item"><Plus className="w-4 h-4" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Menu Item</DialogTitle></DialogHeader>
              {formFields}
              <Button onClick={() => {
                createItem.mutate(
                  { data: { ...form, restaurantId: selectedRestaurant, price: Number(form.price) } },
                  { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMenuQueryKey(selectedRestaurant) }); setShowCreate(false); resetForm(); toast({ title: "Menu item created" }); } }
                );
              }} disabled={createItem.isPending}>{createItem.isPending ? "Creating..." : "Create"}</Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedRestaurant ? (
        <p className="text-muted-foreground text-center py-8">Select a restaurant to manage menu items</p>
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
      ) : menuItems?.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No menu items</p>
      ) : (
        <div className="space-y-3">
          {menuItems?.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border bg-card" data-testid={`admin-menu-item-${item.id}`}>
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-card-foreground">{item.name}</p>
                  <p className="text-sm text-primary font-bold">N{item.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={editId === item.id} onOpenChange={(open) => { if (!open) setEditId(null); }}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={() => { setEditId(item.id); setForm({ name: item.name, description: item.description, price: item.price, image: item.image, category: item.category }); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Edit Menu Item</DialogTitle></DialogHeader>
                    {formFields}
                    <Button onClick={() => {
                      updateItem.mutate(
                        { id: item.id, data: { ...form, price: Number(form.price) } },
                        { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMenuQueryKey(selectedRestaurant) }); setEditId(null); resetForm(); toast({ title: "Menu item updated" }); } }
                      );
                    }} disabled={updateItem.isPending}>{updateItem.isPending ? "Saving..." : "Save"}</Button>
                  </DialogContent>
                </Dialog>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => {
                  deleteItem.mutate({ id: item.id }, {
                    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetMenuQueryKey(selectedRestaurant) }); toast({ title: "Menu item deleted" }); }
                  });
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationsTab() {
  const { data: applications, isLoading } = useListApplications();

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>;
  }

  if (!applications?.length) {
    return <p className="text-muted-foreground text-center py-8">No applications yet</p>;
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div key={app.id} className="rounded-xl border bg-card p-4" data-testid={`admin-application-${app.id}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-card-foreground">{app.fullName}</p>
              <p className="text-sm text-muted-foreground">{app.email} | {app.phone}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">{app.role.replace("_", " ")}</span>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</p>
          </div>
          {app.portfolioLink && <p className="text-sm text-primary mt-2">Portfolio: {app.portfolioLink}</p>}
          {app.message && <p className="text-sm text-muted-foreground mt-1">{app.message}</p>}
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage restaurants, menu items, and applications</p>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard"><LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard</TabsTrigger>
            <TabsTrigger value="restaurants" data-testid="tab-restaurants"><Store className="w-4 h-4 mr-1" /> Restaurants</TabsTrigger>
            <TabsTrigger value="menu" data-testid="tab-menu"><UtensilsCrossed className="w-4 h-4 mr-1" /> Menu Items</TabsTrigger>
            <TabsTrigger value="applications" data-testid="tab-applications"><Users className="w-4 h-4 mr-1" /> Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="restaurants"><RestaurantsTab /></TabsContent>
          <TabsContent value="menu"><MenuItemsTab /></TabsContent>
          <TabsContent value="applications"><ApplicationsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
