import { z } from 'zod';

export const PLATFORMS = ['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER'] as const;
export type Platform = typeof PLATFORMS[number];

export const PlatformEnum = z.enum(PLATFORMS, {
  errorMap: () => ({ message: 'Bitte eine Plattform auswählen.' }),
});
