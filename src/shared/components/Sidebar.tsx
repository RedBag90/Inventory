'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePendingJoinRequestCount } from '@/features/admin/hooks/useJoinRequests';
import { useActiveOlympiad } from '@/features/olympiad/hooks/useActiveOlympiad';
import { useMyBadgeCount } from '@/features/badges/hooks/useBadges';

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

function IconBadge() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
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

// ── component ─────────────────────────────────────────────────────────────────

type Props = { role?: 'USER' | 'ADMIN' | 'MASTER_ADMIN' };

export function Sidebar({ role }: Props) {
  const t = useTranslations('nav');
  const tUser = useTranslations('userMenu');
  const pathname    = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isGlobalAdmin = role === 'ADMIN' || role === 'MASTER_ADMIN';
  const { active, all: memberships, setActive } = useActiveOlympiad();
  const { data: badgeCount } = useMyBadgeCount();
  const isInstanceAdmin = memberships.some(m => m.memberRole === 'ADMIN');
  const isAdmin = isGlobalAdmin || isInstanceAdmin;
  const { data: pendingCount } = usePendingJoinRequestCount(isAdmin);
  const showSwitcher = !collapsed && memberships.length > 1;

  const NAV_ITEMS = [
    { label: t('leaderboard'), href: '/dashboard/leaderboard', icon: <IconTrophy />, count: undefined },
    { label: t('inventory'),   href: '/dashboard/inventory',   icon: <IconBox />,    count: undefined },
    { label: t('reporting'),   href: '/dashboard/reporting',   icon: <IconChart />,  count: undefined },
    { label: t('badges'),      href: '/dashboard/badges',      icon: <IconBadge />,  count: badgeCount ?? undefined },
  ] satisfies { label: string; href: string; icon: React.ReactNode; count: number | undefined }[];

  return (
    <aside className={[
      'shrink-0 border-r flex flex-col transition-all duration-200 overflow-hidden',
      'bg-[var(--sidebar-bg)] border-[var(--sidebar-border)]',
      collapsed ? 'w-16' : 'w-16 md:w-56',
    ].join(' ')}>

      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-[var(--sidebar-border)] overflow-hidden">
        <div className={[
          'w-7 h-7 bg-amber-400 rounded-md flex items-center justify-center shrink-0',
          !collapsed ? 'mx-auto md:mx-0' : 'mx-auto',
        ].join(' ')}>
          <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        {!collapsed && (
          <span className="hidden md:block ml-2.5 font-semibold text-white text-sm leading-tight truncate">
            Flohmarkt-<br/>Olympiade
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon, count }, index) => {
          const isActive = pathname.startsWith(href);
          return (
            <div key={href}>
              <Link
                href={href}
                title={label}
                className={[
                  'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors justify-center md:justify-start',
                  isActive
                    ? 'bg-[var(--sidebar-active-bg)] text-white'
                    : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-active-bg)] hover:text-white',
                ].join(' ')}
              >
                {icon}
                {!collapsed && (
                  <span className="hidden md:flex flex-1 items-center justify-between">
                    {label}
                    {count != null && count > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold leading-none">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </span>
                )}
              </Link>

              {/* Olympiade-Switcher — between Rangliste (0) and Inventar (1), expanded only */}
              {index === 0 && showSwitcher && (
                <div className="hidden md:block mt-1 mb-0.5 px-2.5">
                  <select
                    value={active?.instanceId ?? ''}
                    onChange={e => setActive(e.target.value)}
                    className="w-full border border-indigo-600 rounded-lg px-2.5 py-1.5 text-xs text-white bg-[var(--sidebar-active-bg)] focus:outline-none focus:ring-2 focus:ring-indigo-400 truncate"
                  >
                    {memberships.map(m => (
                      <option key={m.instanceId} value={m.instanceId}>
                        {m.instanceName}{!m.isActive ? ` ${t('olympiadArchived')}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}

        {isAdmin && (
          <>
            {!collapsed && (
              <div className="hidden md:block pt-3 pb-1 px-2.5">
                <p className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
                  {role === 'MASTER_ADMIN' ? tUser('roleMasterAdmin') : tUser('roleInstanceOwner')}
                </p>
              </div>
            )}
            {collapsed && <div className="pt-2" />}
            <Link
              href="/dashboard/admin"
              title="Admin"
              className={[
                'relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors justify-center md:justify-start',
                pathname.startsWith('/dashboard/admin')
                  ? 'bg-[var(--sidebar-active-bg)] text-white'
                  : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-active-bg)] hover:text-white',
              ].join(' ')}
            >
              <span className="relative shrink-0">
                <IconUsers />
                {pendingCount != null && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </span>
              {!collapsed && (
                <span className="hidden md:flex flex-1 items-center justify-between">
                  Admin
                  {pendingCount != null && pendingCount > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </span>
              )}
            </Link>
          </>
        )}
      </nav>

      {/* Collapse / expand button at bottom — desktop only */}
      <div className="hidden md:block px-2 pb-4">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-indigo-300 hover:text-white hover:bg-[var(--sidebar-active-bg)] transition-colors"
          title={collapsed ? t('expandSidebar') : t('collapseSidebar')}
        >
          {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </button>
      </div>
    </aside>
  );
}
