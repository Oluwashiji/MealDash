import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

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

function loadCart(): CartState {
  try {
    const saved = localStorage.getItem("md_cart");
    return saved ? JSON.parse(saved) : defaultCart;
  } catch {
    return defaultCart;
  }
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(loadCart);

  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem("md_cart", JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((item: CartItem, restaurant: { id: number; name: string; deliveryFee: number; deliveryTimeMin: number; deliveryTimeMax: number }) => {
    setCart((prev) => {
      // Different restaurant — ask via confirm then clear
      if (prev.restaurantId && prev.restaurantId !== restaurant.id && prev.items.length > 0) {
        const ok = window.confirm(`Your cart has items from ${prev.restaurantName}. Start a new cart from ${restaurant.name}?`);
        if (!ok) return prev;
        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          deliveryFee: restaurant.deliveryFee,
          deliveryTimeMin: restaurant.deliveryTimeMin,
          deliveryTimeMax: restaurant.deliveryTimeMax,
          items: [{ ...item, quantity: 1 }],
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
            i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i
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
      return newItems.length === 0 ? defaultCart : { ...prev, items: newItems };
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => {
        const newItems = prev.items.filter((i) => i.menuItemId !== menuItemId);
        return newItems.length === 0 ? defaultCart : { ...prev, items: newItems };
      });
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) => i.menuItemId === menuItemId ? { ...i, quantity } : i),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart(defaultCart);
    localStorage.removeItem("md_cart");
  }, []);

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + cart.deliveryFee;
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

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