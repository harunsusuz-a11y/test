// Ortak JSON-LD render bileşeni. Veri her zaman sunucu tarafında,
// bu dosya içinde tanımlanan sabit/yapılandırılmış nesnelerden üretilir;
// kullanıcı girdisi asla buraya doğrudan basılmaz.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
