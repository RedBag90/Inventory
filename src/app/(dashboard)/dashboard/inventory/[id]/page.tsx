// Thin route — item detail view.
// No logic lives here. Import only from features/inventory/index.ts.
import { notFound } from 'next/navigation';
import { getItemById } from '@/features/inventory/services/ItemRepository';
import { ItemDetailPage } from '@/features/inventory';

type Props = { params: Promise<{ id: string }> };

export default async function InventoryDetailRoute({ params }: Props) {
  const { id } = await params;

  // Server-side ownership check — returns 404 (not 403) on mismatch
  const item = await getItemById(id);
  if (!item) notFound();

  return <ItemDetailPage id={id} />;
}
