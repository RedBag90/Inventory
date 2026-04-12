import { z } from 'zod';

// Zod schemas are the source of truth — TypeScript types are derived from them.

export const RecordSaleSchema = z.object({
  itemId:          z.string().cuid(),
  salePrice:       z.number().positive(),
  salePlatform:    z.enum(['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER'], { errorMap: () => ({ message: 'Bitte eine Plattform auswählen.' }) }),
  shippingCostOut: z.number().min(0).default(0),
  soldAt:          z.coerce.date(),
});

export type RecordSaleInput = z.infer<typeof RecordSaleSchema>;

// Quick sell: creates item + sale in one step (no pre-existing item required)
export const QuickSellSchema = z.object({
  name:            z.string().min(1).max(200),
  salePrice:       z.number().positive(),
  salePlatform:    z.enum(['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER'], { errorMap: () => ({ message: 'Bitte eine Plattform auswählen.' }) }),
  shippingCostOut: z.number().min(0).default(0),
  soldAt:          z.coerce.date(),
});

export type QuickSellInput = z.infer<typeof QuickSellSchema>;
