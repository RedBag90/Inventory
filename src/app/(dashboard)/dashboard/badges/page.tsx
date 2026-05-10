import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { BadgePage, getMyBadgesPageData, badgeKeys } from '@/features/badges';

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
