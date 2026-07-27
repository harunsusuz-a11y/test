import { z } from "zod";

export const SUBSCRIPTION_DISCOUNT = 0.1; // %10 abonelik indirimi

export const subscriptionFrequencies = [
  { value: "haftalik", label: "Haftalık", description: "Her hafta kapına gelsin — yoğun antrenman dönemleri için." },
  { value: "iki-haftalik", label: "15 Günde Bir", description: "En dengeli seçim — çoğu üyemizin tercihi.", popular: true },
  { value: "aylik", label: "Aylık", description: "Aylık düzenli tüketim için." },
] as const;

export const subscriptionDeliverySchema = z.object({
  fullName: z.string().min(2, "Ad soyad gerekli."),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin."),
  address: z.string().min(10, "Teslimat adresi gerekli."),
  city: z.string().min(2, "Şehir gerekli."),
});

export type SubscriptionDeliveryValues = z.infer<typeof subscriptionDeliverySchema>;
