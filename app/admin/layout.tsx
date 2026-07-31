import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import "@/app/admin/admin.css";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Admin — Venti-Ate", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="tr">
      <body style={{ margin: 0, padding: 0, background: "#09090b" }}>
        <AdminShell userEmail={user?.email}>
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
