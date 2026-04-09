'use client';

import { usePathname } from 'next/navigation';
import { useTutorial } from '../context/TutorialContext';
import { SpotlightOverlay } from './SpotlightOverlay';

// ── Per-step overlay definitions ─────────────────────────────────────────────

const TOTAL_STEPS = 4; // steps 2–5 (welcome is step 1 but separate)

export function TutorialOverlays() {
  const { step, next, skip } = useTutorial();
  const pathname = usePathname();

  if (!step || step === 'welcome' || step === 'done') return null;

  // Only render the spotlight for the step that matches the current route
  if (step === 'inventory-add' && pathname.startsWith('/dashboard/inventory')) {
    return (
      <SpotlightOverlay
        targetSelector="[data-tutorial='buy-button']"
        title="Artikel kaufen"
        description="Du hast etwas auf dem Flohmarkt gefunden? Trag es hier ein — Name, Kaufpreis, Plattform (eBay, Kleinanzeigen, ...) und optionale Kosten."
        step={2}
        totalSteps={TOTAL_STEPS}
        onNext={next}
        onSkip={skip}
      />
    );
  }

  if (step === 'inventory-sell' && pathname.startsWith('/dashboard/inventory')) {
    return (
      <SpotlightOverlay
        targetSelector="[data-tutorial='quick-sell-button']"
        title="Verkauf eintragen"
        description="Sobald du etwas verkauft hast, trägst du Verkaufspreis, Plattform und Versandkosten ein. Die App berechnet deinen Gewinn automatisch. Mit 'Schnell verkaufen' geht es ohne Inventareintrag."
        step={3}
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
        title="Deine Zahlen im Überblick"
        description="Hier siehst du Umsatz, Kosten und Gewinn — täglich, monatlich, quartalsweise oder kumuliert. Die Karten oben zeigen dir die wichtigsten Kennzahlen auf einen Blick."
        step={4}
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
        title="Die Olympiade beginnt!"
        description="Hier siehst du, wie du im Vergleich zu allen anderen Teilnehmern abschneidest — sortiert nach Gesamtgewinn. Die Pfeile zeigen dir, ob du seit letztem Sonntag auf- oder abgestiegen bist."
        step={5}
        totalSteps={TOTAL_STEPS}
        nextLabel="Alles klar — ich lege los!"
        onNext={next}
        onSkip={skip}
      />
    );
  }

  return null;
}
