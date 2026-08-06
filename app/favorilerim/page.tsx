import type { Metadata } from "next";
import { FavoritesClient } from "./FavoritesClient";

export const metadata: Metadata = {
  title: "Favorilerim",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <FavoritesClient />;
}
