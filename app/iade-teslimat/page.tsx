import type { Metadata }
import { buildMetadata } from "@/lib/seo/metadata"; from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalPages } from "@/content/legal";

export const metadata: Metadata = buildMetadata({
  title: "İade ve Teslimat",
  description: "Venti-Ate iade ve teslimat koşulları — kargo süreleri, iade süreci ve ücretsiz kargo eşiği.",
  path: "/iade-teslimat",
  keywords: ["iade koşulları", "kargo süresi", "ücretsiz kargo"],
});

export default function Page() {
  return <LegalPageLayout content={legalPages.iadeTeslimat} />;
}
