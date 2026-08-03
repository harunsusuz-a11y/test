import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().min(3).max(30).toUpperCase(),
  discount_type: z.enum(["percent","fixed"]),
  discount_value: z.number().positive(),
  min_order_amount: z.number().min(0).default(0),
  max_uses: z.number().int().positive().optional().nullable(),
  user_usage_limit: z.number().int().positive().optional().nullable(),
  starts_at: z.string().optional(),
  expires_at: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
