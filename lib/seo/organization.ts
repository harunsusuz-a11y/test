/**
 * lib/seo/organization.ts
 * JSON-LD şemaları — Organization, WebSite, BreadcrumbList, FAQPage, Product
 */

import { brand } from "@/content/brand";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventiate.com";

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: brand.name,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.svg`,
      width: 200,
      height: 60,
    },
    description: brand.shortStory,
    foundingDate: "2024",
    areaServed: {
      "@type": "Country",
      name: "Turkey",
    },
    knowsAbout: [
      "Giresun fındığı",
      "Protein bar",
      "Fındık kreması",
      "Sağlıklı atıştırmalık",
    ],
    sameAs: [
      "https://www.instagram.com/ventiate.co",
      "https://www.tiktok.com/@ventiate",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Turkish",
      contactOption: "TollFree",
    },
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: brand.name,
    url: siteUrl,
    description: brand.shortStory,
    inLanguage: "tr-TR",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/arama?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function getProductJsonLd({
  name,
  description,
  image,
  slug,
  price,
  aggregateRating,
}: {
  name: string;
  description: string;
  image: string;
  slug: string;
  price: number;
  aggregateRating?: { ratingValue: number; reviewCount: number };
}) {
  const imageAbs = image.startsWith("http") ? image : `${siteUrl}${image}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/urun/${slug}/#product`,
    name,
    description,
    image: imageAbs,
    url: `${siteUrl}/urun/${slug}`,
    brand: {
      "@type": "Brand",
      name: brand.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
      seller: {
        "@id": `${siteUrl}/#organization`,
      },
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        name: "Gıda ürünü iade koşulları",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          currency: "TRY",
          value: "0",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
    },
    ...(aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: aggregateRating.ratingValue.toFixed(1),
            reviewCount: aggregateRating.reviewCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };
}

export function getFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function getLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "Brand"],
    "@id": `${siteUrl}/#organization`,
    name: "Venti-Ate",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.svg`,
      width: 200,
      height: 60,
    },
    description: "Giresun fındığını merkeze alan protein bar ve fındık kreması markası.",
    foundingDate: "2024",
    areaServed: { "@type": "Country", name: "Turkey" },
    sameAs: [
      "https://www.instagram.com/ventiate.co",
      "https://www.tiktok.com/@ventiate",
    ],
  };
}

export function getCollectionPageJsonLd({
  name,
  description,
  url,
  products,
}: {
  name: string;
  description: string;
  url: string;
  products: { name: string; slug: string; price: number; image: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${siteUrl}${url}`,
    hasPart: products.map((p) => ({
      "@type": "Product",
      name: p.name,
      url: `${siteUrl}/urun/${p.slug}`,
      image: p.image.startsWith("http") ? p.image : `${siteUrl}${p.image}`,
      offers: {
        "@type": "Offer",
        price: p.price.toFixed(2),
        priceCurrency: "TRY",
        availability: "https://schema.org/InStock",
      },
    })),
  };
}
