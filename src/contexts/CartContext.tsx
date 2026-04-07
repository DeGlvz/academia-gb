import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface CartItem {
  classId: string;
  title: string;
  price: number;
  image: string;
}

export interface CartAddable {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (c: CartAddable) => void;
  removeItem: (classId: string) => void;
  clearCart: () => void;
  isInCart: (classId: string) => boolean;
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
    setItems((prev) =>
      prev.some((i) => i.classId === c.id)
        ? prev
        : [...prev, { classId: c.id, title: c.title, price: c.price, image: c.image }]
    );
  };

  const removeItem = (classId: string) =>
    setItems((prev) => prev.filter((i) => i.classId !== classId));

  const clearCart = () => setItems([]);

  const isInCart = (classId: string) => items.some((i) => i.classId === classId);

  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, total, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
