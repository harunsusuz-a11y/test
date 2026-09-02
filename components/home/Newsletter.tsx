import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Reveal } from "@/components/animations/Reveal";

export function Newsletter() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-28 text-center">
      <Reveal>
      <p className="text-xs font-bold uppercase tracking-widest2 text-green">Venti Kulübü</p>
      <h2 className="mt-3 font-display text-3xl font-bold text-brown-darker sm:text-4xl">
        Yeni aromayı ilk sen tat.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-brown-dark/70">
        Kulüp üyeleri yeni aromalara erken erişir, üyelere özel kampanyalardan ilk haberdar olur.
      </p>
      <div className="mt-8">
        <NewsletterForm />
      </div>
      </Reveal>
    </section>
  );
}
