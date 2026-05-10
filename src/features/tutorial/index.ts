// Public API — only import from here, never from internal paths.

// Components
export { TutorialShell }    from './components/TutorialShell';
export { TutorialOverlays } from './components/TutorialOverlays';
export { GhostItemCard }    from './components/GhostItemCard';
export { SpotlightOverlay } from './components/SpotlightOverlay';
export { WelcomeOverlay }   from './components/WelcomeOverlay';

// Context & hooks
export { TutorialProvider, useTutorial } from './context/TutorialContext';
export type { TutorialStep } from './context/TutorialContext';

// Server actions
export { completeTutorial, resetTutorial } from './actions/tutorialActions';
