// Public API — only import from here, never from internal paths

// Pages
export { InventoryPage }   from './components/InventoryPage';
export { ItemDetailPage }  from './components/ItemDetailPage';

// Schemas & types
export { CreateItemSchema, EditItemSchema, UpdateItemCostsSchema } from './types/inventory.types';
export type { CreateItemInput, EditItemInput, UpdateItemCostsInput, ItemWithCosts } from './types/inventory.types';

// Hooks
export { useItems }      from './hooks/useItems';
export { useItem }       from './hooks/useItem';
export { useCreateItem } from './hooks/useCreateItem';
export { useUpdateItem } from './hooks/useUpdateItem';
export { useEditItem }   from './hooks/useEditItem';

// Business logic
export { ItemManager } from './services/ItemManager';
