import { z } from 'zod';

// Zod schemas are the source of truth — TypeScript types are derived from them.

export const RecordSaleSchema = z.object({
  itemId:          z.string().cuid(),
  salePrice:       z.number().positive(),
  salePlatform:    z.enum(['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER']),
  shippingCostOut: z.number().min(0).default(0),
  soldAt:          z.coerce.date(),
});

export type RecordSaleInput = z.infer<typeof RecordSaleSchema>;
