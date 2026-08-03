"use client";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/giris");

  if (isAdminPath) return <>{children}</>;

  return (
    <SmoothScrollProvider>
      <AnnouncementBar />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </SmoothScrollProvider>
  );
}
