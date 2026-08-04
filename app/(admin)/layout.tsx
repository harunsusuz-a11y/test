import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/AdminShell"
import { ToastProvider } from "@/components/admin/ui/Toast"
import "@/app/(admin)/admin/admin.css"

export const metadata: Metadata = {
  title: { default: "Admin — Venti-Ate", template: "%s · Admin" },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#09090b" }}>
        <ToastProvider>
          <AdminShell>{children}</AdminShell>
        </ToastProvider>
      </body>
    </html>
  )
}
