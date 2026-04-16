import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  restaurantId: number | null;
  restaurantName: string;
  deliveryFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  items: CartItem[];
}

interface CartContextType {
  cart: CartState;
  addItem: (item: CartItem, restaurant: { id: number; name: string; deliveryFee: number; deliveryTimeMin: number; deliveryTimeMax: number }) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
}

const defaultCart: CartState = {
  restaurantId: null,
  restaurantName: "",
  deliveryFee: 0,
  deliveryTimeMin: 0,
  deliveryTimeMax: 0,
  items: [],
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(defaultCart);

  const addItem = useCallback((item: CartItem, restaurant: { id: number; name: string; deliveryFee: number; deliveryTimeMin: number; deliveryTimeMax: number }) => {
    setCart((prev) => {
      if (prev.restaurantId && prev.restaurantId !== restaurant.id) {
        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          deliveryFee: restaurant.deliveryFee,
          deliveryTimeMin: restaurant.deliveryTimeMin,
          deliveryTimeMax: restaurant.deliveryTimeMax,
          items: [{ ...item, quantity: item.quantity || 1 }],
        };
      }

      const existing = prev.items.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return {
          ...prev,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          deliveryFee: restaurant.deliveryFee,
          deliveryTimeMin: restaurant.deliveryTimeMin,
          deliveryTimeMax: restaurant.deliveryTimeMax,
          items: prev.items.map((i) =>
            i.menuItemId === item.menuItemId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }

      return {
        ...prev,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        deliveryFee: restaurant.deliveryFee,
        deliveryTimeMin: restaurant.deliveryTimeMin,
        deliveryTimeMax: restaurant.deliveryTimeMax,
        items: [...prev.items, { ...item, quantity: 1 }],
      };
    });
  }, []);

  const removeItem = useCallback((menuItemId: number) => {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.menuItemId !== menuItemId);
      if (newItems.length === 0) return defaultCart;
      return { ...prev, items: newItems };
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      ),
    }));
  }, [removeItem]);

  const clearCart = useCallback(() => setCart(defaultCart), []);

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + cart.deliveryFee;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, subtotal, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
