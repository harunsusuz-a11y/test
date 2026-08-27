import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalPages } from "@/content/legal";

export const metadata: Metadata = buildMetadata({
  title: "Gizlilik Politikası",
  description: "Venti-Ate gizlilik politikası — kişisel verilerin toplanması, işlenmesi ve korunması hakkında bilgi.",
  path: "/gizlilik",
  keywords: ["gizlilik politikası", "kişisel veri"],
});

export default function Page() {
  return <LegalPageLayout content={legalPages.gizlilik} />;
}
