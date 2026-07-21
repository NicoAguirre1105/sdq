"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/lib/types/cart";

const STORAGE_KEY = "sdq_cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, size: string | null, quantity: number) => void;
  removeItem: (productId: string, size: string | null) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(item: CartItem, productId: string, size: string | null) {
  return item.productId === productId && item.size === size;
}

// Carrito como Context + localStorage: sin checkout real en el sitio, no hay sesión
// de servidor que lo justifique. La carga desde localStorage ocurre en un efecto (no
// en el estado inicial) para no desincronizar el HTML del servidor en la hidratación.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // localStorage no existe en el server: esta lectura solo puede pasar acá, no
      // en el inicializador de useState (rompería el render SSR de "use client").
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage no disponible o corrupto: arranca con carrito vacío
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item.productId, item.size));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item.productId, item.size)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, size: string | null, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (sameLine(i, productId, size) ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string, size: string | null) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, size)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clear, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
