import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalPages } from "@/content/legal";

export const metadata: Metadata = buildMetadata({
  title: "Çerez Politikası",
  description: "Venti-Ate çerez politikası — site üzerinde kullanılan çerezler ve tercihlerin yönetimi.",
  path: "/cerez-politikasi",
  keywords: ["çerez politikası", "cookie"],
});

export default function Page() {
  return <LegalPageLayout content={legalPages.cerez} />;
}
