import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalPages } from "@/content/legal";

export const metadata: Metadata = buildMetadata({
  title: "KVKK Aydınlatma Metni",
  description: "Kişisel Verilerin Korunması Kanunu kapsamında Venti-Ate aydınlatma metni.",
  path: "/kvkk",
  keywords: ["KVKK", "kişisel verilerin korunması"],
});

export default function Page() {
  return <LegalPageLayout content={legalPages.kvkk} />;
}
