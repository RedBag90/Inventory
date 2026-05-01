import { describe, it, expect } from 'vitest';
import { getUserRank } from './rankSystem';

describe('getUserRank', () => {
  it('0 XP → Neuling', () => {
    const r = getUserRank(0);
    expect(r.title).toBe('Neuling');
    expect(r.nextThreshold).toBe(100);
  });

  it('99 XP → Neuling, nextThreshold 100', () => {
    const r = getUserRank(99);
    expect(r.title).toBe('Neuling');
    expect(r.nextThreshold).toBe(100);
  });

  it('100 XP → Bronzehändler', () => {
    expect(getUserRank(100).title).toBe('Bronzehändler');
  });

  it('399 XP → Bronzehändler', () => {
    expect(getUserRank(399).title).toBe('Bronzehändler');
  });

  it('400 XP → Silberhändler', () => {
    expect(getUserRank(400).title).toBe('Silberhändler');
  });

  it('949 XP → Silberhändler', () => {
    expect(getUserRank(949).title).toBe('Silberhändler');
  });

  it('950 XP → Goldmakler', () => {
    expect(getUserRank(950).title).toBe('Goldmakler');
  });

  it('1999 XP → Goldmakler', () => {
    expect(getUserRank(1999).title).toBe('Goldmakler');
  });

  it('2000 XP → Platin-Guru', () => {
    expect(getUserRank(2000).title).toBe('Platin-Guru');
  });

  it('4499 XP → Platin-Guru', () => {
    expect(getUserRank(4499).title).toBe('Platin-Guru');
  });

  it('4500 XP → Flohmarkt-Olympier, nextThreshold null', () => {
    const r = getUserRank(4500);
    expect(r.title).toBe('Flohmarkt-Olympier');
    expect(r.nextThreshold).toBeNull();
  });
});
