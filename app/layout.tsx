import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/standard-italic.css";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/outfit";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { ExitIntentPopup } from "@/components/overlays/ExitIntentPopup";
import { LiveActivity } from "@/components/overlays/LiveActivity";
import { IntroSplash } from "@/components/layout/IntroSplash";
import { AmbientLayer } from "@/components/animations/AmbientLayer";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { JsonLd } from "@/components/seo/JsonLd";
import { Analytics } from "@/components/seo/Analytics";
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import { getOrganizationJsonLd, getWebsiteJsonLd } from "@/lib/seo/organization";
import { brand } from "@/content/brand";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventiate.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF6F0" },
    { media: "(prefers-color-scheme: dark)", color: "#56312D" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.shortStory,
  keywords: ["protein bar","fındık kreması","Giresun fındığı","sağlıklı atıştırmalık","venti ate","fındık protein"],
  authors: [{ name: brand.name, url: BASE }],
  creator: brand.name,
  publisher: brand.name,
  formatDetection: { telephone: true, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: BASE,
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.shortStory,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: brand.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.shortStory,
    images: ["/og-image.jpg"],
    creator: "@ventiate",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  alternates: {
    canonical: BASE,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-body antialiased">
        <JsonLd data={getOrganizationJsonLd()} />
        <JsonLd data={getWebsiteJsonLd()} />
        <IntroSplash />
        <AmbientLayer />
        <ScrollProgress />
        <StorefrontShell>{children}</StorefrontShell>
        <CartDrawer />
        <ExitIntentPopup />
        <LiveActivity />
        <Analytics
          gaId={process.env.NEXT_PUBLIC_GA_ID}
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
          metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
        />
      </body>
    </html>
  );
}
