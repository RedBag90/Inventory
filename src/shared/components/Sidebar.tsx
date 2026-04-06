'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Rangliste', href: '/dashboard/leaderboard' },
  { label: 'Inventar',  href: '/dashboard/inventory'   },
  { label: 'Berichte',  href: '/dashboard/reporting'   },
] as const;

type Props = {
  role?: 'USER' | 'ADMIN';
};

export function Sidebar({ role }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-200">
        <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <span className="font-semibold text-gray-900 text-sm leading-tight">Flohmarkt-<br/>Olympiade</span>
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
