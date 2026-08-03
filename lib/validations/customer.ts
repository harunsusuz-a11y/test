import { z } from "zod";

export const customerSchema = z.object({
  first_name: z.string().min(1, "Ad gerekli"),
  last_name: z.string().min(1, "Soyad gerekli"),
  email: z.string().email("Geçerli e-posta girin"),
  phone: z.string().optional(),
  status: z.enum(["active","inactive","banned"]).default("active"),
  group_id: z.string().uuid().optional().nullable(),
  marketing_consent: z.boolean().default(false),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
