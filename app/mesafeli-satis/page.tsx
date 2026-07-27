import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalPages } from "@/content/legal";

export const metadata: Metadata = { title: legalPages.mesafeliSatis.title };

export default function Page() {
  return <LegalPageLayout content={legalPages.mesafeliSatis} />;
}
