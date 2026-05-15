// artifacts/meal-dash/src/lib/useData.ts
// Fetches from API, always falls back to static data if anything goes wrong.
// Static data is shown immediately — API data replaces it when ready.

import { useState, useEffect, useRef } from "react";
import { restaurants as staticRestaurants, menuItems as staticMenuItems } from "./data";
import type { Restaurant, MenuItem } from "./data";

const API_BASE = "/api/admin";

async function apiFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const data = await res.json();
    // Only use API data if it actually has rows
    if (Array.isArray(data) && data.length > 0) return data as T;
    return fallback;
  } catch {
    return fallback;
  }
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(staticRestaurants);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(true);
    apiFetch<Restaurant[]>(`${API_BASE}/restaurants`, staticRestaurants)
      .then(setRestaurants)
      .finally(() => setLoading(false));
  }, []);

  return { restaurants, loading };
}

export function useMenuItems(restaurantId: number) {
  const staticFiltered = staticMenuItems.filter((m) => m.restaurantId === restaurantId);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(staticFiltered);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    apiFetch<MenuItem[]>(
      `${API_BASE}/menu?restaurantId=${restaurantId}`,
      staticFiltered
    )
      .then(setMenuItems)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  return { menuItems, loading, setMenuItems };
}

export function useAllMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(staticMenuItems);
  const [loading, setLoading] = useState(false);
  const fetched = useRef(false);

  const refetch = () => {
    setLoading(true);
    apiFetch<MenuItem[]>(`${API_BASE}/menu`, staticMenuItems)
      .then(setMenuItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    refetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { menuItems, loading, refetch };
}

// For admin: returns raw API types (same shape, just explicit)
export function useAdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(staticRestaurants);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);
    apiFetch<Restaurant[]>(`${API_BASE}/restaurants`, staticRestaurants)
      .then(setRestaurants)
      .finally(() => setLoading(false));
  };

  useEffect(() => { refetch(); }, []); // eslint-disable-line

  return { restaurants, setRestaurants, loading, refetch };
}

export function useAdminMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(staticMenuItems);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);
    apiFetch<MenuItem[]>(`${API_BASE}/menu`, staticMenuItems)
      .then(setMenuItems)
      .finally(() => setLoading(false));
  };

  useEffect(() => { refetch(); }, []); // eslint-disable-line

  return { menuItems, setMenuItems, loading, refetch };
}