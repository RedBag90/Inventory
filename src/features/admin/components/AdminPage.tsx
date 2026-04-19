'use client';

// Admin dashboard — tab shell.
// ADMIN: sees Olympiaden + Anfragen.
// MASTER_ADMIN: sees all tabs including Instanz-Anfragen, Instanzen, Nutzer.

import { useState } from 'react';
import { usePendingJoinRequestCount } from '../hooks/useJoinRequests';
import { usePendingInstanceRequestCount } from '../hooks/useInstanceRequests';
import { useCurrentDbUser } from '@/features/auth/hooks/useCurrentDbUser';
import { useMyMemberships } from '@/features/olympiad/hooks/useOlympiads';
import { OlympiadPanel } from '@/features/olympiad/components/OlympiadPanel';
import { JoinRequestsTab } from './tabs/JoinRequestsTab';
import { InstanceRequestsTab } from './tabs/InstanceRequestsTab';
import { InstancesTab } from './tabs/InstancesTab';
import { UserManagement } from './tabs/UserManagement';

type AdminTab = 'users' | 'olympiads' | 'requests' | 'instanceRequests' | 'instances';

export function AdminPage() {
  const { data: me } = useCurrentDbUser();
  const { data: memberships = [] } = useMyMemberships();
  const isMasterAdmin   = me?.role === 'MASTER_ADMIN';
  const isInstanceAdmin = memberships.some(m => m.memberRole === 'ADMIN');
  const [tab, setTab] = useState<AdminTab>('olympiads');
  const { data: pendingCount } = usePendingJoinRequestCount();
  const { data: pendingInstanceCount } = usePendingInstanceRequestCount(isMasterAdmin);

  const tabs: [AdminTab, string, number?][] = [
    ['olympiads', 'Olympiaden'],
    ['requests',  'Anfragen', pendingCount ?? 0],
    ...(isMasterAdmin ? [
      ['instanceRequests', 'Instanz-Anfragen', pendingInstanceCount ?? 0] as [AdminTab, string, number],
      ['instances', 'Instanzen'] as [AdminTab, string],
    ] : []),
    ...((isMasterAdmin || isInstanceAdmin) ? [
      ['users', 'Nutzer'] as [AdminTab, string],
    ] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Admin</h1>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(([value, label, count]) => (
          <button key={value} onClick={() => setTab(value)}
            className={[
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === value ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600',
            ].join(' ')}>
            {label}
            {count != null && count > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'olympiads'        && <OlympiadPanel />}
      {tab === 'requests'         && <JoinRequestsTab />}
      {tab === 'instanceRequests' && isMasterAdmin && <InstanceRequestsTab />}
      {tab === 'instances'        && isMasterAdmin && <InstancesTab />}
      {tab === 'users'            && (isMasterAdmin || isInstanceAdmin) && <UserManagement />}
    </div>
  );
}
