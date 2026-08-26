import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda | Venti-Ate",
  description: "Venti-Ate'nin hikayesi, değerleri ve fındığa olan bağlılığı.",
};

export default async function HakkimizdaPage() {
  const settings = await getSettings(["brand_short_story", "brand_values", "brand_tagline"]);

  const story = (settings.brand_short_story as string) ?? "";
  const values = (settings.brand_values as { title: string; description: string }[]) ?? [];
  const tagline = (settings.brand_tagline as string) ?? "Fındığın rafine hali";

  return (
    <main>
      <PageHeader
        title="Hakkımızda"
        description={tagline}
        eyebrow="Marka"
      />
      <section className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        <p className="text-brown/80 text-lg leading-relaxed">{story}</p>

        {values.length > 0 && (
          <div className="space-y-8">
            <h2 className="font-display text-2xl text-brown">Değerlerimiz</h2>
            <ul className="space-y-6">
              {values.map((v, i) => (
                <li key={i} className="border-l-2 border-green pl-6">
                  <h3 className="font-semibold text-brown mb-1">{v.title}</h3>
                  <p className="text-brown/70">{v.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
