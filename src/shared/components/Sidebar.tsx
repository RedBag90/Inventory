'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// ── icons ─────────────────────────────────────────────────────────────────────

function IconTrophy() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12M6 3a6 6 0 0 0 6 6 6 6 0 0 0 6-6M6 3H3a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4h.5M18 3h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4h-.5M12 9v6m0 0H9m3 0h3m-3 3v0a3 3 0 0 1-3 3h6a3 3 0 0 1-3-3v0" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.375c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

// ── nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Rangliste', href: '/dashboard/leaderboard', icon: <IconTrophy /> },
  { label: 'Inventar',  href: '/dashboard/inventory',   icon: <IconBox />    },
  { label: 'Berichte',  href: '/dashboard/reporting',   icon: <IconChart />  },
] as const;

// ── component ─────────────────────────────────────────────────────────────────

type Props = { role?: 'USER' | 'ADMIN' };

export function Sidebar({ role }: Props) {
  const pathname    = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={[
      'shrink-0 border-r border-gray-200 bg-white flex flex-col transition-all duration-200',
      collapsed ? 'w-16' : 'w-56',
    ].join(' ')}>

      {/* Logo + collapse toggle */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200 overflow-hidden">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm leading-tight truncate">
              Flohmarkt-<br/>Olympiade
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center mx-auto">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors shrink-0"
            title="Seitenleiste einklappen"
          >
            <IconChevronLeft />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={[
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
              ].join(' ')}
            >
              {icon}
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {role === 'ADMIN' && (
          <>
            {!collapsed && (
              <div className="pt-3 pb-1 px-2.5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Admin</p>
              </div>
            )}
            {collapsed && <div className="pt-2" />}
            <Link
              href="/dashboard/admin"
              title={collapsed ? 'Users' : undefined}
              className={[
                'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : '',
                pathname.startsWith('/dashboard/admin')
                  ? 'bg-purple-50 text-purple-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
              ].join(' ')}
            >
              <IconUsers />
              {!collapsed && <span>Users</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Expand button at bottom when collapsed */}
      {collapsed && (
        <div className="px-2 pb-4">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            title="Seitenleiste ausklappen"
          >
            <IconChevronRight />
          </button>
        </div>
      )}
    </aside>
  );
}
