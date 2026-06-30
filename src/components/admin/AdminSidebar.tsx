'use client'
 
/**
 * AdminSidebar.tsx
 * ─────────────────────────────────────────────────────────────
 * Sidebar navigation for the HR Admin Portal.
 * Uses admin-theme for all styling — do not hardcode colors here.
 * ─────────────────────────────────────────────────────────────
 */
 
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, components } from '@/lib/admin-theme'
 
// ─── Simple SVG Icons ─────────────────────────────────────────
// Keeping icons inline and minimal so no icon library needed.
// TODO: swap with lucide-react icons if the project adds it later.
// NOTE: typed as a plain function signature (not React.FC) to avoid
// any namespace resolution issues with the React/JSX type in strict bundler setups.
type IconComponent = (props: { className?: string }) => React.ReactElement
 
// ─── Placeholder Logged-in User ──────────────────────────────
// TODO: replace with real data from Supabase auth/session once login is wired up.
// When auth is ready, fetch the current user's name + role from the
// `profiles` (or equivalent) table and pass it in here instead.
const PLACEHOLDER_USER = {
  name: 'Maria Santos',
  position: 'HR Officer',
  initials: 'MS',
}
 
const Icons: Record<string, IconComponent> = {
  Dashboard:                ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.8"/>
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.8"/>
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.8"/>
    </svg>
  ),
  'Job Postings':           ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
  ),
  Applicants:               ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4" strokeWidth="1.8"/>
      <path strokeWidth="1.8" strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  'Employees (Probationary)': ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4" strokeWidth="1.8"/>
    </svg>
  ),
  'Schedules':      ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8" strokeWidth="1.8"/>
      <line x1="16" y1="13" x2="8" y2="13" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="16" y1="17" x2="8" y2="17" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Archives:                 ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="21 8 21 21 3 21 3 8" strokeWidth="1.8"/>
      <rect x="1" y="3" width="22" height="5" rx="1" strokeWidth="1.8"/>
      <line x1="10" y1="12" x2="14" y2="12" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Settings:                 ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" strokeWidth="1.8"/>
      <path strokeWidth="1.8" strokeLinecap="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
}
 
// ─── Dark Mode Toggle Icon ────────────────────────────────────
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  )
}
 
// ─── Component ────────────────────────────────────────────────
export default function AdminSidebar() {
  const pathname = usePathname()
 
  // TODO: wire up real dark mode toggle using next-themes or similar
  const handleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
  }
 
  return (
    <aside className={components.sidebar}>
 
      {/* Logo / Portal name */}
      {/* Logo image lives at public/logo.png — swap the src below if you rename it */}
      <div className="px-6 py-5 flex items-center gap-2">
        {/* Using plain <img> instead of next/image to avoid optimization/config issues */}
        <img
          src="/logo.png"
          alt="Arvin International"
          width={36}
          height={36}
          className="shrink-0 w-15 h-15 object-contain"
        />
        <div className="leading-tight">
          <p className="text-[#0f1f29] dark:text-[#e2edf3] font-bold text-xs uppercase tracking-wide">HR Admin</p>
          <p className="text-[#0f1f29] dark:text-[#e2edf3] font-bold text-xs uppercase tracking-wide">Portal</p>
        </div>
      </div>
 
      {/* Navigation links */}
      <nav className={components.sidebarNav}>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            // Exact match for dashboard, prefix match for sub-pages
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
 
            const Icon = Icons[item.label]
 
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive ? components.sidebarItemActive : components.sidebarItem}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
 
      {/* ── Logged-in user info ──────────────────────────────────
          Shows who is currently logged in (name + position).
          TODO: Replace PLACEHOLDER_USER above with real Supabase auth
          data once login is wired up. */}
      <div className="px-4 py-3 border-t border-[#e2e8ed] dark:border-[#1e3448]">
        <div className="flex items-center gap-3">
          {/* Avatar circle — shows initials, swap for profile photo later */}
          <div className="w-9 h-9 rounded-full bg-[#00bbda] flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {PLACEHOLDER_USER.initials}
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] truncate">
              {PLACEHOLDER_USER.name}
            </p>
            <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] truncate">
              {PLACEHOLDER_USER.position}
            </p>
          </div>
        </div>
      </div>
 
      {/* Dark mode toggle + help */}
      <div className={components.sidebarFooter}>
        <button
          onClick={handleDarkMode}
          className="flex items-center gap-3 text-sm text-[#8fa3b0] hover:text-[#00bbda] transition-colors w-full"
        >
          <MoonIcon className="w-4 h-4" />
          <span>Dark Mode</span>
        </button>
      </div>
    </aside>
  )
}