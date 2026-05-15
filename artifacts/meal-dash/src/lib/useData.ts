// artifacts/meal-dash/src/lib/useData.ts
// Shared React hooks that fetch live data from the API,
// falling back to hardcoded data if the API is down.

import { useState, useEffect } from "react";
import { fetchRestaurants, fetchMenuItems, type ApiRestaurant, type ApiMenuItem } from "./api";
import { restaurants as staticRestaurants, menuItems as staticMenuItems } from "./data";

export function useRestaurants() {
  const [data, setData] = useState<ApiRestaurant[]>(staticRestaurants as ApiRestaurant[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants()
      .then((rows) => { if (rows.length > 0) setData(rows); })
      .catch(() => {/* use static fallback */})
      .finally(() => setLoading(false));
  }, []);

  return { restaurants: data, loading };
}

export function useMenuItems(restaurantId?: number) {
  const staticFiltered = restaurantId
    ? staticMenuItems.filter((m) => m.restaurantId === restaurantId)
    : staticMenuItems;

  const [data, setData] = useState<ApiMenuItem[]>(staticFiltered as ApiMenuItem[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems(restaurantId)
      .then((rows) => { if (rows.length > 0) setData(rows); })
      .catch(() => {/* use static fallback */})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  return { menuItems: data, loading, setMenuItems: setData };
}

export function useAllMenuItems() {
  const [data, setData] = useState<ApiMenuItem[]>(staticMenuItems as ApiMenuItem[]);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    fetchMenuItems()
      .then((rows) => { if (rows.length > 0) setData(rows); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { refetch(); }, []);

  return { menuItems: data, loading, refetch };
}