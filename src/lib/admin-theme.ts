/**
 * admin-theme.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all HR Admin Portal design tokens.
 * Import from this file in every admin page/component instead of
 * hardcoding colors, fonts, or class names individually.
 *
 * Usage:
 *   import { colors, typography, components } from '@/lib/admin-theme'
 * ─────────────────────────────────────────────────────────────
 */
 
// ─── Color Palette ───────────────────────────────────────────
export const colors = {
  // Primary brand color and its shades
  primary: {
    DEFAULT: '#00bbda',   // main teal-blue (buttons, active states, accents)
    light:   '#e6f9fc',   // very light tint (active nav bg, hover bg)
    mid:     '#00a3bf',   // slightly darker (button hover)
    dark:    '#007a8f',   // deep shade (text on light bg, icons)
  },
 
  // Neutral / UI colors
  neutral: {
    white:    '#ffffff',
    bg:       '#f4f7f9',  // page background (light mode)
    border:   '#e2e8ed',  // table borders, dividers
    muted:    '#8fa3b0',  // secondary text, labels, dates
    text:     '#1a2a35',  // primary body text
    heading:  '#0f1f29',  // page titles, bold headings
  },
 
  // Blue shades for variety
  blue: {
    50:  '#eaf6f9',
    100: '#c0eaf3',
    200: '#00bbda',       // same as primary
    300: '#0099b3',
    800: '#003d52',
    900: '#001f2a',
  },
 
  // Status / semantic colors
  status: {
    pass:    '#00bbda',   // Pass button - brand color
    reject:  '#e05252',   // Reject - red, but not too aggressive
    pending: '#f59e0b',   // Pending badge
    success: '#22c55e',   // Approved/hired
  },
 
  // Dark mode overrides
  dark: {
    bg:        '#0d1f2d',   // page background
    sidebar:   '#091624',   // sidebar
    card:      '#132435',   // table/card bg
    border:    '#1e3448',   // borders
    text:      '#e2edf3',   // primary text
    muted:     '#6b8fa3',   // secondary text
  },
} as const
 
// ─── Typography ──────────────────────────────────────────────
export const typography = {
  // Font family — Public Sans, loaded via next/font/google in AdminLayout.tsx
  fontFamily: "'Public Sans', system-ui, -apple-system, sans-serif",
 
  // Font sizes (rem)
  size: {
    xs:   '0.75rem',   // 12px - labels, badges
    sm:   '0.875rem',  // 14px - table content, secondary text (MINIMUM readable)
    base: '1rem',      // 16px - body text
    lg:   '1.125rem',  // 18px - card headings
    xl:   '1.25rem',   // 20px - section headings
    '2xl':'1.5rem',    // 24px - page titles
    '3xl':'2rem',      // 32px - stat numbers
  },
 
  // Font weights
  weight: {
    normal:   '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
  },
} as const
 
// ─── Shared Tailwind Class Strings ───────────────────────────
// Use these in className props instead of repeating long strings.
// Tweak here and it applies everywhere automatically.
export const components = {
 
  // Page layout
  pageWrapper:  'min-h-screen bg-[#f4f7f9] dark:bg-[#0d1f2d]',
  pageContent:  'flex-1 p-8',
  pageTitle:    'text-2xl font-bold text-[#0f1f29] dark:text-[#e2edf3] mb-1',
  pageDivider:  'border-t border-[#e2e8ed] dark:border-[#1e3448] my-4',
 
  // Stat cards (Dashboard)
  statCard:       'bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-5 flex items-center gap-4',
  statNumber:     'text-3xl font-bold text-[#0f1f29] dark:text-[#e2edf3]',
  statLabel:      'text-sm text-[#8fa3b0] mt-0.5',
  // Icon badge — solid color circle/square behind each stat's icon.
  // Three shades of the brand blue so the three cards don't look identical.
  statIconBadge: {
    base:  'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
    light: 'bg-[#00bbda]',   // brightest — e.g. Job Postings
    mid:   'bg-[#0099b3]',   // mid shade — e.g. Applicants
    dark:  'bg-[#007a8f]',   // deepest — e.g. Pending Actions
  },
 
  // Section labels (e.g. "RECENT ACTIVITY")
  sectionLabel: 'text-xs font-semibold tracking-widest text-[#8fa3b0] dark:text-[#6b8fa3] uppercase mb-3',
 
  // Tables
  table:        'w-full border-collapse text-sm',
  tableHeader:  'bg-[#f4f7f9] dark:bg-[#091624] text-xs font-semibold tracking-wider text-[#8fa3b0] uppercase',
  tableHeaderCell: 'px-4 py-3 text-left',
  tableRow:     'border-t border-[#e2e8ed] dark:border-[#1e3448] hover:bg-[#eaf6f9] dark:hover:bg-[#1e3448] transition-colors',
  tableCell:    'px-4 py-3 text-[#1a2a35] dark:text-[#e2edf3]',
  tableCellMuted: 'px-4 py-3 text-[#8fa3b0] dark:text-[#6b8fa3]',
  // Clickable text inside a table cell (e.g. job title linking to its detail page)
  tableCellLink: 'px-4 py-3 text-[#00bbda] font-medium hover:underline',
 
  // Buttons
  btnPrimary:   'bg-[#00bbda] hover:bg-[#00a3bf] text-white text-sm font-medium px-5 py-2 rounded transition-colors',
  btnOutline:   'border border-[#00bbda] text-[#00bbda] hover:bg-[#e6f9fc] dark:hover:bg-[#1e3448] text-sm font-medium px-5 py-2 rounded transition-colors',
  btnDanger:    'border border-[#e05252] text-[#e05252] hover:bg-red-50 dark:hover:bg-[#2a1515] text-sm font-medium px-5 py-2 rounded transition-colors',
  // Neutral gray outline — used for less prominent actions like "Archive"
  btnNeutral:   'border border-[#cbd5dd] dark:border-[#2a4256] text-[#1a2a35] dark:text-[#e2edf3] hover:bg-[#f4f7f9] dark:hover:bg-[#1e3448] text-sm font-medium px-5 py-2 rounded transition-colors',
  btnGhost:     'text-[#8fa3b0] hover:text-[#00bbda] text-sm font-medium px-3 py-1 rounded transition-colors',
  // Small versions — same styles, tighter padding, for use inside table rows
  btnPrimarySm: 'bg-[#00bbda] hover:bg-[#00a3bf] text-white text-xs font-medium px-3 py-1.5 rounded transition-colors',
  btnOutlineSm: 'border border-[#00bbda] text-[#00bbda] hover:bg-[#e6f9fc] dark:hover:bg-[#1e3448] text-xs font-medium px-3 py-1.5 rounded transition-colors inline-block',
  btnNeutralSm: 'border border-[#cbd5dd] dark:border-[#2a4256] text-[#1a2a35] dark:text-[#e2edf3] hover:bg-[#f4f7f9] dark:hover:bg-[#1e3448] text-xs font-medium px-3 py-1.5 rounded transition-colors',
 
  // Badges / status pills (use border-only style, no filled bg)
  badge: {
    base:         'inline-block text-xs font-medium px-2 py-0.5 rounded border',
    applied:      'border-[#6C757D] text-[#6C757D]',
    initial:      'border-[#0D6EFD] text-[#0D6EFD]',
    exam:         'border-[#6610F2] text-[#6610F2]',
    department:   'border-[#0A58CA] text-[#0A58CA]',
    onboarding:   'border-[#198754] text-[#198754]',
    pending:      'border-[#f59e0b] text-[#f59e0b]',
    rejected:     'border-[#e05252] text-[#e05252]',
  },
 
  // Sidebar
  sidebar: 'w-60 h-full bg-white dark:bg-[#091624] border-r border-[#e2e8ed] dark:border-[#1e3448] flex flex-col overflow-y-auto',
  sidebarLogo:  'px-6 py-5 text-[#00bbda] font-bold text-sm leading-tight tracking-wide uppercase',
  sidebarNav:   'flex-1 px-3 py-2',
  sidebarItem:  'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3] hover:bg-[#e6f9fc] dark:hover:bg-[#1e3448] hover:text-[#00bbda] transition-colors cursor-pointer',
  sidebarItemActive: 'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium bg-[#e6f9fc] dark:bg-[#1e3448] text-[#00bbda] border-l-2 border-[#00bbda]',
  sidebarFooter:'px-6 py-5 border-t border-[#e2e8ed] dark:border-[#1e3448]',
} as const
 
// ─── Hiring Stage Labels ──────────────────────────────────────
// Canonical stage names used across all pages.
// Change here to update everywhere.
export const HIRING_STAGES = [
  'Applied',
  'Initial Interview',
  'Exam / Assessment',
  'Department Interview',
  'For Onboarding',
] as const
 
export type HiringStage = typeof HIRING_STAGES[number]
 
// ─── Schedule Panel (Dashboard widget) ────────────────────────
// Compact card shown on the right side of the dashboard — NOT a full
// second sidebar, just a small fixed-width widget for today's interviews.
export const schedule = {
  panelWrapper:   'w-full lg:w-[340px] shrink-0 bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-5',
  panelHeader:    'flex items-center justify-between mb-4',
  panelTitle:     'text-base font-semibold text-[#0f1f29] dark:text-[#e2edf3]',
  seeAllLink:     'text-xs font-medium text-[#00bbda] hover:underline',
 
  // Month nav row (prev/next + label)
  monthNavRow:    'flex items-center justify-between mb-3',
  monthNavBtn:    'w-6 h-6 flex items-center justify-center rounded text-[#8fa3b0] hover:text-[#00bbda] hover:bg-[#e6f9fc] dark:hover:bg-[#1e3448] transition-colors',
  monthLabel:     'text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3]',
 
  // Date strip (row of day buttons)
  dateStripRow:   'flex items-center gap-1 mb-4',
  dateStripArrow: 'w-5 h-5 flex items-center justify-center text-[#8fa3b0] hover:text-[#00bbda] shrink-0',
  dateButton:     'flex-1 flex flex-col items-center py-1.5 rounded-md cursor-pointer text-[#1a2a35] dark:text-[#e2edf3]',
  dateButtonActive:'flex-1 flex flex-col items-center py-1.5 rounded-md cursor-pointer bg-[#00bbda] text-white',
  dateNum:        'text-sm font-semibold',
  dateDay:        'text-[10px] uppercase mt-0.5 opacity-80',
 
  // Tabs (Initial Interview / Department Interview)
  tabRow:         'flex gap-4 border-b border-[#e2e8ed] dark:border-[#1e3448] mb-3',
  tab:            'pb-2 text-sm font-medium text-[#8fa3b0] border-b-2 border-transparent cursor-pointer',
  tabActive:      'pb-2 text-sm font-medium text-[#00bbda] border-b-2 border-[#00bbda] cursor-pointer',
  tabCount:       'ml-1 text-xs',
 
  // Interview cards within the list
  timeLabel:      'text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-3 mb-1.5',
  interviewCard:  'bg-[#f4f7f9] dark:bg-[#0d1f2d] rounded-lg p-3 mb-2',
  applicantAvatar:'w-8 h-8 rounded-full bg-[#00bbda] flex items-center justify-center text-white text-xs font-semibold shrink-0',
  applicantName:  'text-sm font-medium text-[#0f1f29] dark:text-[#e2edf3]',
  applicantRole:  'text-xs text-[#8fa3b0] dark:text-[#6b8fa3]',
  jobNote:        'text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-1.5 line-clamp-2',
  goToProfileBtn: 'mt-2 text-xs font-medium text-[#00bbda] border border-[#00bbda] rounded px-3 py-1 hover:bg-[#e6f9fc] dark:hover:bg-[#1e3448] transition-colors inline-block',
 
  emptyState:     'text-sm text-[#8fa3b0] dark:text-[#6b8fa3] text-center py-8',
} as const
 
// ─── Nav Items ────────────────────────────────────────────────
// Sidebar navigation config. Add/remove items here only.
export const NAV_ITEMS = [
  { label: 'Dashboard',               href: '/admin' },
  { label: 'Job Postings',            href: '/admin/job_postings' },
  { label: 'Applicants',              href: '/admin/applicants' },
  { label: 'Employees (Probationary)',href: '/admin/employees' },
  { label: 'Schedules',               href: '/admin/schedules' },
  { label: 'Archives',                href: '/admin/archives' },
  { label: 'Settings',                href: '/admin/settings' },
] as const
 
// ─── Placeholder Job Postings Data ────────────────────────────
// TODO: replace with real Supabase query against the `job_postings` table.
// Shared here (not duplicated per-page) so the list page and the detail
// page always show the same data.
export const PLACEHOLDER_JOBS = [
  { id: '1', title: 'HR Associate',         datePosted: '2026-06-01', applicantCount: 4, archived: false,
    description: 'Supports day-to-day HR operations including recruitment, onboarding, and employee records management.' },
  { id: '2', title: 'Operations Manager',   datePosted: '2026-06-05', applicantCount: 2, archived: false,
    description: 'Oversees daily operations, coordinates between departments, and ensures process efficiency.' },
  { id: '3', title: 'Accounting Clerk',     datePosted: '2026-06-10', applicantCount: 3, archived: false,
    description: 'Handles invoice processing, bookkeeping, and basic financial recordkeeping.' },
  { id: '4', title: 'IT Support Specialist',datePosted: '2026-05-20', applicantCount: 1, archived: false,
    description: 'Provides first-line technical support for hardware, software, and network issues.' },
] as const
 
export type PlaceholderJob = typeof PLACEHOLDER_JOBS[number]