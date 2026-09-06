import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeUser, makeInstance, makeMembership, makeSoldItem } from '@/test/factories';

// The Supabase session is the one dependency these tests cannot run for real: it is a true
// external. Everything else — the membership lookup, the ranking, the Decimal arithmetic —
// runs against the real database.
const currentUser = vi.hoisted(() => ({ value: { id: '', role: 'USER' as string } }));
vi.mock('@/shared/lib/auth/getCurrentUserId', () => ({
  getCurrentDbUser: async () => currentUser.value,
  getCurrentUserId: async () => currentUser.value.id,
}));

const { getLeaderboardData } = await import('./getLeaderboardData');
const { computeLeaderboardForInstance } = await import('../services/computeLeaderboard');

function signInAs(user: { id: string; role: string }) {
  currentUser.value = { id: user.id, role: user.role };
}

describe('getLeaderboardData — the client-facing seam is guarded', () => {
  let owner: Awaited<ReturnType<typeof makeUser>>;
  let member: Awaited<ReturnType<typeof makeUser>>;
  let outsider: Awaited<ReturnType<typeof makeUser>>;
  let instance: Awaited<ReturnType<typeof makeInstance>>;

  beforeEach(async () => {
    owner    = await makeUser({ role: 'ADMIN' });
    member   = await makeUser({ displayName: 'Member' });
    outsider = await makeUser({ displayName: 'Outsider' });
    instance = await makeInstance({ createdById: owner.id });
    await makeMembership(member.id, instance.id);
  });

  it('returns the leaderboard to a member of the instance', async () => {
    await makeSoldItem({ userId: member.id, purchasePrice: 10, salePrice: 25 });
    signInAs(member);

    const { entries, instanceName } = await getLeaderboardData(instance.id);

    expect(instanceName).toBe(instance.name);
    expect(entries).toHaveLength(1);
    expect(entries[0].displayName).toBe('Member');
    expect(entries[0].totalProfit).toBe(15);
  });

  it('refuses a caller who is not a member of the instance', async () => {
    signInAs(outsider);
    await expect(getLeaderboardData(instance.id)).rejects.toThrow('Forbidden');
  });

  it('allows MASTER_ADMIN to inspect an instance they do not belong to', async () => {
    const root = await makeUser({ role: 'MASTER_ADMIN' });
    signInAs(root);

    const { instanceName } = await getLeaderboardData(instance.id);
    expect(instanceName).toBe(instance.name);
  });
});

describe('computeLeaderboardForInstance — the system path stays unguarded', () => {
  it('computes without any caller, for the cron job', async () => {
    const owner  = await makeUser({ role: 'ADMIN' });
    const member = await makeUser({ displayName: 'Cron subject' });
    const inst   = await makeInstance({ createdById: owner.id });
    await makeMembership(member.id, inst.id);
    await makeSoldItem({ userId: member.id, purchasePrice: 5, salePrice: 12 });

    // No signInAs() — deliberately. The weekly digest runs with no user session.
    const { entries } = await computeLeaderboardForInstance(inst.id);

    expect(entries).toHaveLength(1);
    expect(entries[0].totalProfit).toBe(7);
  });
});
