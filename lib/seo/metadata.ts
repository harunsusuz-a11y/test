/**
 * lib/seo/metadata.ts
 * Merkezi SEO yardımcısı — tüm sayfalar buradan türetilir.
 * Brandbook kaynaklı: marka sesi, tagline, değerler.
 */

import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventiate.com";
export const BRAND = "Venti-Ate";
export const TAGLINE = "Fındığın rafine hali";

const DEFAULT_OG_IMAGE = "/og-image.jpg"; // 1200×630

export function buildMetadata({
  title,
  description,
  path = "/",
  ogImage = DEFAULT_OG_IMAGE,
  keywords = [],
  noindex = false,
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  keywords?: string[];
  noindex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImageAbs = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  return {
    title,
    description,
    ...(keywords.length > 0 && { keywords }),
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url,
      siteName: BRAND,
      title: `${title} | ${BRAND}`,
      description,
      images: [{ url: ogImageAbs, width: 1200, height: 630, alt: `${title} — ${BRAND}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${BRAND}`,
      description,
      images: [ogImageAbs],
      creator: "@ventiate",
      site: "@ventiate",
    },
  };
}

/** Ürün sayfaları için */
export function buildProductMetadata({
  name,
  description,
  slug,
  image,
  price,
  category,
}: {
  name: string;
  description: string;
  slug: string;
  image: string;
  price: number;
  category: string;
}): Metadata {
  const keywords = [
    name,
    "Venti-Ate",
    "Giresun fındığı",
    "sağlıklı atıştırmalık",
    category === "protein-bar" ? "protein bar" : "fındık kreması",
    "fındık bazlı",
    "doğal içerik",
  ];

  const meta = buildMetadata({
    title: name,
    description,
    path: `/urun/${slug}`,
    ogImage: image,
    keywords,
  });

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "website",
    },
  };
}
