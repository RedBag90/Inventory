'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { completeTutorial, resetTutorial } from '../actions/tutorialActions';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TutorialStep =
  | 'welcome'
  | 'inventory-add'
  | 'inventory-sell'
  | 'reporting'
  | 'leaderboard'
  | 'set-display-name'
  | 'first-sale'
  | 'done';

type TutorialContextValue = {
  step: TutorialStep | null;
  next: () => void;
  skip: () => void;
  restart: () => void;
};

// ── Step config ───────────────────────────────────────────────────────────────

const STEP_ORDER: TutorialStep[] = [
  'welcome',
  'inventory-sell',
  'inventory-add',
  'leaderboard',
  'set-display-name',
  'reporting',
  'first-sale',
  'done',
];

const STEP_ROUTES: Record<TutorialStep, string | null> = {
  'welcome':        null,
  'inventory-sell': '/dashboard/inventory',
  'inventory-add':  '/dashboard/inventory',
  'reporting':      '/dashboard/reporting',
  'leaderboard':        '/dashboard/leaderboard',
  'set-display-name':   '/dashboard/leaderboard',
  'first-sale':         '/dashboard/inventory',
  'done':           '/dashboard/inventory',
};

// ── Context ───────────────────────────────────────────────────────────────────

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used inside TutorialProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

type Props = {
  children: ReactNode;
  initiallyCompleted: boolean;
};

export function TutorialProvider({ children, initiallyCompleted }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<TutorialStep | null>(
    initiallyCompleted ? null : 'welcome'
  );

  const goToStep = useCallback((nextStep: TutorialStep | null) => {
    setStep(nextStep);
    if (nextStep && STEP_ROUTES[nextStep]) {
      router.push(STEP_ROUTES[nextStep]!);
    }
  }, [router]);

  const next = useCallback(() => {
    if (!step) return;
    const idx = STEP_ORDER.indexOf(step);
    const nextStep = STEP_ORDER[idx + 1] ?? null;

    if (nextStep === 'done' || nextStep === null) {
      completeTutorial();
      setStep(null);
      router.push('/dashboard/inventory');
    } else {
      goToStep(nextStep);
    }
  }, [step, goToStep, router]);

  const skip = useCallback(() => {
    completeTutorial();
    setStep(null);
  }, []);

  const restart = useCallback(() => {
    resetTutorial();
    goToStep('welcome');
  }, [goToStep]);

  return (
    <TutorialContext.Provider value={{ step, next, skip, restart }}>
      {children}
    </TutorialContext.Provider>
  );
}
