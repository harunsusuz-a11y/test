import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalı"),
  slug: z.string().min(2, "Slug gerekli").regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive("Fiyat pozitif olmalı"),
  compare_at_price: z.number().positive().optional().nullable(),
  cost_price: z.number().positive().optional().nullable(),
  weight: z.number().optional().nullable(),
  status: z.enum(["active","inactive","draft"]).default("active"),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  category_id: z.string().uuid().optional().nullable(),
  sku: z.string().optional(),
});

export const variantSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string().optional(),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;
