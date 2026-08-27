import type { Metadata }
import { buildMetadata } from "@/lib/seo/metadata"; from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalPages } from "@/content/legal";

export const metadata: Metadata = buildMetadata({
  title: "Ön Bilgilendirme Formu",
  description: "Venti-Ate ön bilgilendirme formu — satın alma öncesi yasal bilgilendirme.",
  path: "/on-bilgilendirme",
  keywords: ["ön bilgilendirme formu"],
});

export default function Page() {
  return <LegalPageLayout content={legalPages.onBilgilendirme} />;
}
