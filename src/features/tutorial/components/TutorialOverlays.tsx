'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTutorial } from '../context/TutorialContext';
import { SpotlightOverlay } from './SpotlightOverlay';

const TOTAL_STEPS = 6; // steps 2–7 (welcome is step 1 but separate)

export function TutorialOverlays() {
  const { step, next, skip } = useTutorial();
  const t = useTranslations('tutorial.steps');
  const ts = useTranslations('tutorial.spotlight');
  const pathname = usePathname();

  if (!step || step === 'welcome' || step === 'done') return null;

  if (step === 'inventory-sell' && pathname.startsWith('/dashboard/inventory')) {
    return (
      <SpotlightOverlay
        targetSelector="[data-tutorial='quick-sell-button']"
        title={t('quickSellTitle')}
        description={t('quickSellDescription')}
        step={2}
        totalSteps={TOTAL_STEPS}
        onNext={next}
        onSkip={skip}
      />
    );
  }

  if (step === 'inventory-add' && pathname.startsWith('/dashboard/inventory')) {
    return (
      <SpotlightOverlay
        targetSelector="[data-tutorial='buy-button']"
        title={t('buyTitle')}
        description={t('buyDescription')}
        step={3}
        totalSteps={TOTAL_STEPS}
        onNext={next}
        onSkip={skip}
      />
    );
  }

  if (step === 'leaderboard' && pathname.startsWith('/dashboard/leaderboard')) {
    return (
      <SpotlightOverlay
        targetSelector="[data-tutorial='leaderboard-table']"
        title={t('leaderboardTitle')}
        description={t('leaderboardDescription')}
        step={4}
        totalSteps={TOTAL_STEPS}
        onNext={next}
        onSkip={skip}
      />
    );
  }

  if (step === 'set-display-name' && pathname.startsWith('/dashboard/leaderboard')) {
    return (
      <SpotlightOverlay
        targetSelector="[data-tutorial='user-menu-button']"
        title={t('displayNameTitle')}
        description={t('displayNameDescription')}
        step={5}
        totalSteps={TOTAL_STEPS}
        onNext={next}
        onSkip={skip}
      />
    );
  }

  if (step === 'reporting' && pathname.startsWith('/dashboard/reporting')) {
    return (
      <SpotlightOverlay
        targetSelector="[data-tutorial='reporting-tabs']"
        title={t('reportingTitle')}
        description={t('reportingDescription')}
        step={6}
        totalSteps={TOTAL_STEPS}
        onNext={next}
        onSkip={skip}
      />
    );
  }

  if (step === 'first-sale' && pathname.startsWith('/dashboard/inventory')) {
    return (
      <SpotlightOverlay
        targetSelector="[data-tutorial='quick-sell-button']"
        title={t('firstSaleTitle')}
        description={t('firstSaleDescription')}
        step={7}
        totalSteps={TOTAL_STEPS}
        nextLabel={ts('startNow')}
        onNext={next}
        onSkip={skip}
      />
    );
  }

  return null;
}
