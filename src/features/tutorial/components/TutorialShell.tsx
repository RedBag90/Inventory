'use client';

import type { ReactNode } from 'react';
import { TutorialProvider } from '../context/TutorialContext';
import { WelcomeOverlay } from './WelcomeOverlay';
import { TutorialOverlays } from './TutorialOverlays';

type Props = {
  children: ReactNode;
  tutorialCompleted: boolean;
};

export function TutorialShell({ children, tutorialCompleted }: Props) {
  return (
    <TutorialProvider initiallyCompleted={tutorialCompleted}>
      {children}
      <WelcomeOverlay />
      <TutorialOverlays />
    </TutorialProvider>
  );
}
