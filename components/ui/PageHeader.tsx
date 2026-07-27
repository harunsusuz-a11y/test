export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-widest2 text-green">{eyebrow}</p>}
      <h1 className="mt-3 font-display text-4xl font-extrabold text-brown-darker">{title}</h1>
      {description && <p className="mt-4 text-brown-dark/70">{description}</p>}
    </div>
  );
}
