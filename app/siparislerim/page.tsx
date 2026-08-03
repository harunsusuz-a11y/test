import type { Metadata } from "next";
import { OrdersClient } from "./OrdersClient";

export const metadata: Metadata = { title: "Siparişlerim" };

export default function Page() {
  return <OrdersClient />;
}
