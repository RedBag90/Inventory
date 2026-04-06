// Public API — only import from here, never from internal paths

export { SaleForm } from './components/SaleForm';
export { SaleConfirmation } from './components/SaleConfirmation';
export { SaleModal } from './components/SaleModal';
export { SaleManager } from './services/SaleManager';
export { createSale } from './services/SaleRepository';
export { useRecordSale } from './hooks/useRecordSale';
export { salesKeys } from './hooks/salesKeys';
export { RecordSaleSchema } from './types/sales.types';
export type { RecordSaleInput } from './types/sales.types';
