import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface CartItem {
  id: string;
  type: "class" | "product";
  title: string;
  price: number;
  image: string;
  quantity?: number;
}

export interface CartAddable {
  id: string;
  type: "class" | "product";
  title: string;
  price: number;
  image: string;
  quantity?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (c: CartAddable) => void;
  removeItem: (id: string, type: "class" | "product") => void;
  updateQuantity: (id: string, type: "class" | "product", quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string, type: "class" | "product") => boolean;
  getCartTotal: (type?: "class" | "product") => number;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "gaby-cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (c: CartAddable) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === c.id && i.type === c.type);
      if (existingIndex !== -1) {
        // Si ya existe, incrementar cantidad
        const newItems = [...prev];
        const currentQty = newItems[existingIndex].quantity || 1;
        newItems[existingIndex] = { ...newItems[existingIndex], quantity: currentQty + 1 };
        return newItems;
      }
      // Si no existe, agregar con cantidad 1
      return [...prev, { ...c, quantity: c.quantity || 1 }];
    });
  };

  const removeItem = (id: string, type: "class" | "product") => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  };

  const updateQuantity = (id: string, type: "class" | "product", quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, type);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.type === type ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const isInCart = (id: string, type: "class" | "product") =>
    items.some((i) => i.id === id && i.type === type);

  const getCartTotal = (type?: "class" | "product") => {
    const filtered = type ? items.filter((i) => i.type === type) : items;
    return filtered.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  };

  const total = items.reduce((s, i) => s + i.price * (i.quantity || 1), 0);
  const count = items.reduce((s, i) => s + (i.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getCartTotal,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
