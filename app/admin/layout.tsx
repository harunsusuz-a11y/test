import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import "@/app/admin/admin.css";

export const metadata: Metadata = {
  title: { default: "Admin — Venti-Ate", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0, background: "#09090b" }}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
