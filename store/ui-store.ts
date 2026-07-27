"use client";

import { create } from "zustand";

// Overlay/çekmece durumları için hafif UI store'u.
// Sepet store'undan ayrı tutulur: sepet verisi persist edilir, UI durumu edilmez.
type UiState = {
  cartDrawerOpen: boolean;
  /** Son eklenen ürünün slug'ı — çekmecede "eklendi" vurgusu için */
  lastAddedSlug: string | null;
  openCartDrawer: (slug?: string) => void;
  closeCartDrawer: () => void;
};

export const useUiStore = create<UiState>()((set) => ({
  cartDrawerOpen: false,
  lastAddedSlug: null,
  openCartDrawer: (slug) => set({ cartDrawerOpen: true, lastAddedSlug: slug ?? null }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
}));
