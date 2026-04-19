export const PLATFORMS = ['KLEINANZEIGEN', 'EBAY', 'FACEBOOK', 'OTHER'] as const;
export type Platform = typeof PLATFORMS[number];
