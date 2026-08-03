import type { Metadata } from "next";
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
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import { getOrganizationJsonLd, getWebsiteJsonLd } from "@/lib/seo/organization";
import { brand } from "@/content/brand";

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
        <AmbientLayer />
        <ScrollProgress />
        <StorefrontShell>{children}</StorefrontShell>
        <CartDrawer />
        <ExitIntentPopup />
        <LiveActivity />
      </body>
    </html>
  );
}
