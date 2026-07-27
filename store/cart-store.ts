"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/content/products";

export type CartLine = {
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.lines.find((l) => l.slug === product.slug);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.slug === product.slug ? { ...l, quantity: l.quantity + quantity } : l
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              { slug: product.slug, name: product.name, price: product.price, image: product.image, quantity },
            ],
          };
        });
      },
      removeItem: (slug) => set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),
      updateQuantity: (slug, quantity) =>
        set((state) => ({
          lines: quantity <= 0
            ? state.lines.filter((l) => l.slug !== slug)
            : state.lines.map((l) => (l.slug === slug ? { ...l, quantity } : l)),
        })),
      clear: () => set({ lines: [] }),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "venti-ate-cart" }
  )
);
