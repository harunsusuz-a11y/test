import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckoutForm } from "@/components/forms/CheckoutForm";

export const metadata: Metadata = { title: "Ödeme" };

export default function Page() {
  const steps = ["Sepet", "Teslimat", "Ödeme"];
  return (
    <>
      <PageHeader eyebrow="Son Adım" title="Ödeme" />
      <div className="mx-auto mb-10 flex max-w-xs items-center justify-between px-5 text-xs font-semibold text-brown-dark/50 pt-12">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                i === steps.length - 1 ? "bg-green text-cream" : "bg-brown-darker/10 text-brown-darker"
              }`}
            >
              {i + 1}
            </span>
            <span className={i === steps.length - 1 ? "text-brown-darker" : undefined}>{step}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-6 bg-brown/20" aria-hidden="true" />}
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-4xl px-5 pb-20">
        <CheckoutForm />
      </div>
    </>
  );
}
