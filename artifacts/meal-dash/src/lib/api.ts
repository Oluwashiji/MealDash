// artifacts/meal-dash/src/lib/api.ts
// Central API client — reads/writes to the backend DB

const BASE = "/api";

export type ApiRestaurant = {
  id: number; name: string; description: string; image: string;
  category: string; rating: number; deliveryTimeMin: number;
  deliveryTimeMax: number; deliveryFee: number; tags: string[];
  isOpen: boolean; address: string; cuisine?: string; minOrder?: number;
};

export type ApiMenuItem = {
  id: number; restaurantId: number; name: string; description: string;
  price: number; image: string; category: string;
  isAvailable: boolean; isPopular: boolean;
};

// ── Restaurants ──────────────────────────────────────────────

export async function fetchRestaurants(): Promise<ApiRestaurant[]> {
  const res = await fetch(`${BASE}/admin/restaurants`);
  if (!res.ok) throw new Error("Failed to fetch restaurants");
  return res.json();
}

export async function updateRestaurant(id: number, data: Partial<ApiRestaurant>): Promise<ApiRestaurant> {
  const res = await fetch(`${BASE}/admin/restaurants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update restaurant");
  return res.json();
}

// ── Menu Items ────────────────────────────────────────────────

export async function fetchMenuItems(restaurantId?: number): Promise<ApiMenuItem[]> {
  const url = restaurantId
    ? `${BASE}/admin/menu?restaurantId=${restaurantId}`
    : `${BASE}/admin/menu`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

export async function createMenuItem(data: Omit<ApiMenuItem, "id">): Promise<ApiMenuItem> {
  const res = await fetch(`${BASE}/admin/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create menu item");
  return res.json();
}

export async function updateMenuItem(id: number, data: Partial<ApiMenuItem>): Promise<ApiMenuItem> {
  const res = await fetch(`${BASE}/admin/menu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update menu item");
  return res.json();
}

export async function deleteMenuItem(id: number): Promise<void> {
  const res = await fetch(`${BASE}/admin/menu/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete menu item");
}