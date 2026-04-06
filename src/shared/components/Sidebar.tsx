'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Leaderboard', href: '/dashboard/leaderboard' },
  { label: 'Inventory',   href: '/dashboard/inventory'   },
  { label: 'Reporting',   href: '/dashboard/reporting'   },
] as const;

type Props = {
  role?: 'USER' | 'ADMIN';
};

export function Sidebar({ role }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="h-14 flex items-center px-5 border-b border-gray-200">
        <span className="font-semibold text-gray-900 tracking-tight">Inventory</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
              ].join(' ')}
            >
              {label}
            </Link>
          );
        })}

        {role === 'ADMIN' && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Admin</p>
            </div>
            <Link
              href="/dashboard/admin"
              className={[
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith('/dashboard/admin')
                  ? 'bg-purple-50 text-purple-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
              ].join(' ')}
            >
              Users
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
