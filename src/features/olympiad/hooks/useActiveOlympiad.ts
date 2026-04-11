'use client';

// Tracks which olympiad the user is currently "viewing".
// Persisted in localStorage so it survives page reloads.
// Default: the most recently joined active olympiad.

import { useEffect, useState } from 'react';
import { useMyMemberships } from './useOlympiads';
import type { MyMembership } from '../actions/olympiadActions';

const STORAGE_KEY = 'activeOlympiadId';

function readStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

function writeStorage(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, id);
}

export type ActiveOlympiadState = {
  /** The currently selected membership, or null while loading / no memberships */
  active:     MyMembership | null;
  /** All memberships the user belongs to */
  all:        MyMembership[];
  /** Switch to a different olympiad */
  setActive:  (instanceId: string) => void;
  isLoading:  boolean;
};

export function useActiveOlympiad(): ActiveOlympiadState {
  const { data: memberships = [], isLoading } = useMyMemberships();
  const [activeId, setActiveId] = useState<string | null>(null);

  // On first render read from localStorage
  useEffect(() => {
    setActiveId(readStorage());
  }, []);

  // When memberships load, validate/initialise the stored id
  useEffect(() => {
    if (isLoading || memberships.length === 0) return;

    const stored = readStorage();
    const valid  = memberships.some(m => m.instanceId === stored);

    if (!valid) {
      // Default: most recently joined active olympiad, or just most recently joined
      const defaultMembership =
        memberships.find(m => m.isActive) ?? memberships[0];
      writeStorage(defaultMembership.instanceId);
      setActiveId(defaultMembership.instanceId);
    }
  }, [memberships, isLoading]);

  function setActive(instanceId: string) {
    writeStorage(instanceId);
    setActiveId(instanceId);
  }

  const active = memberships.find(m => m.instanceId === activeId) ?? memberships[0] ?? null;

  return { active, all: memberships, setActive, isLoading };
}
