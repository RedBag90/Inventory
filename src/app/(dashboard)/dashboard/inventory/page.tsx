// Thin route — delegates entirely to the inventory feature.
// No logic lives here. Import only from features/inventory/index.ts.
import { InventoryPage } from '@/features/inventory';

export default function InventoryRoute() {
  return <InventoryPage />;
}
