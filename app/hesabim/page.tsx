import type { Metadata } from "next";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = {
  title: "Hesabım",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AccountClient />;
}
