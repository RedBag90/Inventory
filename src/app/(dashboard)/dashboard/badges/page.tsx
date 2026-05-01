import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { BadgePage } from '@/features/badges/components/BadgePage';
import { getMyBadgesPageData } from '@/features/badges/actions/badgeActions';
import { badgeKeys } from '@/features/badges/hooks/badgeKeys';

export default async function BadgesRoute() {
  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: badgeKeys.pageData(),
    queryFn:  getMyBadgesPageData,
  });
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <BadgePage />
    </HydrationBoundary>
  );
}
