import { z } from "zod";

export const orderStatusSchema = z.object({
  status: z.enum(["pending","confirmed","processing","shipped","delivered","cancelled","refunded"]),
  tracking_number: z.string().optional(),
  admin_note: z.string().optional(),
});

export type OrderStatusFormValues = z.infer<typeof orderStatusSchema>;
