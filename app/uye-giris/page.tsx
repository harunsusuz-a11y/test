import type { Metadata } from "next";
import { AuthForm } from "./AuthForm";

export const metadata: Metadata = { title: "Giriş Yap / Üye Ol" };

export default function Page() {
  return <AuthForm />;
}
