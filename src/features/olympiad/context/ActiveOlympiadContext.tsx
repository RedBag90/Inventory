'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useMyMemberships } from '../hooks/useOlympiads';
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
  active:    MyMembership | null;
  all:       MyMembership[];
  setActive: (instanceId: string) => void;
  isLoading: boolean;
};

const ActiveOlympiadContext = createContext<ActiveOlympiadState>({
  active:    null,
  all:       [],
  setActive: () => {},
  isLoading: true,
});

export function ActiveOlympiadProvider({ children }: { children: ReactNode }) {
  const { data: memberships = [], isLoading } = useMyMemberships();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setActiveId(readStorage());
  }, []);

  useEffect(() => {
    if (isLoading || memberships.length === 0) return;
    const stored = readStorage();
    const valid  = memberships.some(m => m.instanceId === stored);
    if (!valid) {
      const defaultMembership = memberships.find(m => m.isActive) ?? memberships[0];
      writeStorage(defaultMembership.instanceId);
      setActiveId(defaultMembership.instanceId);
    }
  }, [memberships, isLoading]);

  const setActive = useCallback((instanceId: string) => {
    writeStorage(instanceId);
    setActiveId(instanceId);
  }, []);

  const active = memberships.find(m => m.instanceId === activeId) ?? memberships[0] ?? null;

  const value = useMemo(
    () => ({ active, all: memberships, setActive, isLoading }),
    [active, memberships, setActive, isLoading]
  );

  return (
    <ActiveOlympiadContext.Provider value={value}>
      {children}
    </ActiveOlympiadContext.Provider>
  );
}

export function useActiveOlympiadContext(): ActiveOlympiadState {
  return useContext(ActiveOlympiadContext);
}
