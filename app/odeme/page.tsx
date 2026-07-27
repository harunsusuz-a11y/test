import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CheckoutForm } from "@/components/forms/CheckoutForm";

export const metadata: Metadata = { title: "Ödeme" };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Son Adım" title="Ödeme" />
      <div className="mx-auto max-w-4xl px-5 pb-20">
        <CheckoutForm />
      </div>
    </>
  );
}
