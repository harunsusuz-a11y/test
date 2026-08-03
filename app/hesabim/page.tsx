import type { Metadata } from "next";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = { title: "Hesabım" };

export default function Page() {
  return <AccountClient />;
}
