// Public API — only import from here, never from internal paths

export { SaleForm } from './components/SaleForm';
export { SaleConfirmation } from './components/SaleConfirmation';
export { SaleModal } from './components/SaleModal';
export { SaleManager } from './services/SaleManager';
export { createSale } from './services/SaleRepository';
export { useRecordSale } from './hooks/useRecordSale';
export { salesKeys } from './hooks/salesKeys';
export { RecordSaleSchema, QuickSellSchema, CreatePendingSaleSchema, UpdatePendingSaleSchema, QuickPendingSaleSchema } from './types/sales.types';
export type { RecordSaleInput, QuickSellInput, CreatePendingSaleInput, UpdatePendingSaleInput, QuickPendingSaleInput } from './types/sales.types';

// Modals
export { PendingSaleModal }       from './components/PendingSaleModal';
export { QuickSellModal }         from './components/QuickSellModal';
export { ConfirmPendingSaleModal } from './components/ConfirmPendingSaleModal';
