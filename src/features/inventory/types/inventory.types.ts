import { z } from 'zod';

// Zod schemas are the source of truth — TypeScript types are derived from them.
// Never define a type manually if a schema already exists.

export const CreateItemSchema = z.object({
  name:             z.string().min(1, 'Name is required').max(200),
  description:      z.string().max(1000).optional(),
  purchasePrice:    z.number().positive('Purchase price must be positive'),
  purchasePlatform: z.enum(['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER']),
  purchasedAt:      z.coerce.date(),
  shippingCostIn:   z.number().min(0, 'Must be 0 or more').default(0),
  repairCost:       z.number().min(0, 'Must be 0 or more').default(0),
});

export type CreateItemInput = z.infer<typeof CreateItemSchema>;

// US-030 — same rules as Create
export const EditItemSchema = z.object({
  name:             z.string().min(1, 'Name is required').max(200),
  description:      z.string().max(1000).optional(),
  purchasePrice:    z.number().positive('Purchase price must be positive'),
  purchasePlatform: z.enum(['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER']),
  purchasedAt:      z.coerce.date(),
});

export type EditItemInput = z.infer<typeof EditItemSchema>;

// US-010 — cost editing schema
export const AdditionalCostSchema = z.object({
  label:  z.string().min(1, 'Label is required'),
  amount: z.number().min(0, 'Amount must be 0 or more'),
});

export const UpdateItemCostsSchema = z.object({
  shippingCostIn:  z.number().min(0).default(0),
  repairCost:      z.number().min(0).default(0),
  additionalCosts: z.array(AdditionalCostSchema).default([]),
});

export type AdditionalCostInput = z.infer<typeof AdditionalCostSchema>;
export type UpdateItemCostsInput = z.infer<typeof UpdateItemCostsSchema>;

// Runtime types — shape returned by ItemRepository queries
export type ItemStatus = 'IN_STOCK' | 'SOLD';

export type AdditionalCostRecord = {
  id:     string;
  label:  string;
  amount: number;
  itemId: string;
};

export type SaleRecord = {
  id:              string;
  salePrice:       number;
  salePlatform:    string;
  shippingCostOut: number;
  soldAt:          Date;
};

export type ItemWithCosts = {
  id:               string;
  name:             string;
  description:      string | null;
  purchasePrice:    number;
  purchasePlatform: string;
  purchasedAt:      Date;
  shippingCostIn:   number;
  repairCost:       number;
  status:           ItemStatus;
  createdAt:        Date;
  updatedAt:        Date;
  userId:           string;
  costs:            AdditionalCostRecord[];
  sale:             SaleRecord | null;
};
