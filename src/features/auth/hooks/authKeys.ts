'use client';

export const authKeys = {
  all:           ['auth'] as const,
  currentDbUser: () => ['auth', 'currentDbUser'] as const,
};
