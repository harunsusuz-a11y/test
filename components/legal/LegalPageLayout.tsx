
type LegalContent = {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

export function LegalPageLayout({ content }: { content: LegalContent }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-brown-darker">{content.title}</h1>
      <p className="mt-4 text-brown-dark/80">{content.intro}</p>

      <div
        role="note"
        className="mt-6 rounded-xl border border-peach/60 bg-peach/15 px-5 py-4 text-sm text-brown-dark"
      >
        <strong>Not:</strong> "Bilgiler bilgilendirme amaçlıdır; bağlayıcı değildir."
      </div>

      <div className="mt-10 space-y-8">
        {content.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-lg font-bold text-brown-darker">{s.heading}</h2>
            <p className="mt-2 text-brown-dark/80">{s.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
