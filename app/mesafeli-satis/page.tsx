import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalPages } from "@/content/legal";

export const metadata: Metadata = buildMetadata({
  title: "Mesafeli Satış Sözleşmesi",
  description: "Venti-Ate mesafeli satış sözleşmesi — online alışveriş şartları ve koşulları.",
  path: "/mesafeli-satis",
  keywords: ["mesafeli satış sözleşmesi"],
});

export default function Page() {
  return <LegalPageLayout content={legalPages.mesafeliSatis} />;
}
