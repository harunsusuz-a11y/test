import type { Metadata } from "next";
import "@fontsource-variable/fraunces/standard-italic.css";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { IntroSplash } from "@/components/layout/IntroSplash";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { getOrganizationJsonLd, getWebsiteJsonLd } from "@/lib/seo/organization";
import { brand } from "@/content/brand";

// Editorial/premium tipografi çifti — Fontsource (https://github.com/fontsource/fontsource)
// üzerinden self-hosted: npm paketi olarak kurulur, build sırasında harici bir
// font CDN'ine istek atılmaz (next/font/google'ın aksine tamamen offline çalışır).

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s — ${brand.name}`,
  },
  description: brand.shortStory,
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.shortStory,
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.shortStory,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="font-body antialiased">
        <JsonLd data={getOrganizationJsonLd()} />
        <JsonLd data={getWebsiteJsonLd()} />
        <IntroSplash />
        <SmoothScrollProvider>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
