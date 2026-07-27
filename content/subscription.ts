import { z } from "zod";

export const subscriptionFrequencies = [
  { value: "haftalik", label: "Haftalık" },
  { value: "iki-haftalik", label: "15 Günde Bir" },
  { value: "aylik", label: "Aylık" },
] as const;

export const subscriptionDeliverySchema = z.object({
  fullName: z.string().min(2, "Ad soyad gerekli."),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin."),
  address: z.string().min(10, "Teslimat adresi gerekli."),
  city: z.string().min(2, "Şehir gerekli."),
});

export type SubscriptionDeliveryValues = z.infer<typeof subscriptionDeliverySchema>;
