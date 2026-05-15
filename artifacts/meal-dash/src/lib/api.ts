// artifacts/meal-dash/src/lib/api.ts
// All API calls to the backend. Uses relative URLs so they work on any domain.

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

const BASE = "/api/admin";

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Restaurants ──────────────────────────────────────────────
export const fetchRestaurants = () =>
  req<ApiRestaurant[]>(`${BASE}/restaurants`);

export const updateRestaurant = (id: number, data: Partial<ApiRestaurant>) =>
  req<ApiRestaurant>(`${BASE}/restaurants/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// ── Menu Items ────────────────────────────────────────────────
export const fetchMenuItems = (restaurantId?: number) =>
  req<ApiMenuItem[]>(
    restaurantId ? `${BASE}/menu?restaurantId=${restaurantId}` : `${BASE}/menu`
  );

export const createMenuItem = (data: Omit<ApiMenuItem, "id">) =>
  req<ApiMenuItem>(`${BASE}/menu`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateMenuItem = (id: number, data: Partial<ApiMenuItem>) =>
  req<ApiMenuItem>(`${BASE}/menu/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteMenuItem = (id: number) =>
  req<void>(`${BASE}/menu/${id}`, { method: "DELETE" });