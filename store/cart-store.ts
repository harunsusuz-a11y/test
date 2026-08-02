"use client";

import { create } from "zustand";
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
  couponCode: string | null;
  _hydrated: boolean;
  setCoupon: (code: string | null) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
  hydrate: () => void;
};

const STORAGE_KEY = "venti-ate-cart";

function loadFromStorage(): { lines: CartLine[]; couponCode: string | null } {
  if (typeof window === "undefined") return { lines: [], couponCode: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], couponCode: null };
    return JSON.parse(raw);
  } catch {
    return { lines: [], couponCode: null };
  }
}

function saveToStorage(lines: CartLine[], couponCode: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, couponCode }));
  } catch {}
}

export const useCartStore = create<CartState>()((set, get) => ({
  lines: [],
  couponCode: null,
  _hydrated: false,

  hydrate: () => {
    const data = loadFromStorage();
    set({ lines: data.lines, couponCode: data.couponCode, _hydrated: true });
  },

  setCoupon: (code) => {
    const couponCode = code ? code.trim().toUpperCase() : null;
    set({ couponCode });
    saveToStorage(get().lines, couponCode);
  },

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.lines.find((l) => l.slug === product.slug);
      const lines = existing
        ? state.lines.map((l) =>
            l.slug === product.slug ? { ...l, quantity: l.quantity + quantity } : l
          )
        : [...state.lines, { slug: product.slug, name: product.name, price: product.price, image: product.image, quantity }];
      saveToStorage(lines, state.couponCode);
      return { lines };
    });
  },

  removeItem: (slug) => {
    set((state) => {
      const lines = state.lines.filter((l) => l.slug !== slug);
      saveToStorage(lines, state.couponCode);
      return { lines };
    });
  },

  updateQuantity: (slug, quantity) => {
    set((state) => {
      const lines = quantity <= 0
        ? state.lines.filter((l) => l.slug !== slug)
        : state.lines.map((l) => (l.slug === slug ? { ...l, quantity } : l));
      saveToStorage(lines, state.couponCode);
      return { lines };
    });
  },

  clear: () => {
    saveToStorage([], null);
    set({ lines: [], couponCode: null });
  },

  subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
  count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
}));
