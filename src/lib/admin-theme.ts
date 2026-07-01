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
    DEFAULT: '#02bcdd',   // main teal-blue (buttons, active states, accents)
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
  statIconBadge: {
    base:  'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
    light: 'bg-[#00bbda]',
    mid:   'bg-[#0099b3]',
    dark:  'bg-[#007a8f]',
    accent:'bg-[#005f73]',
  },
 
  // Section labels (e.g. "RECENT ACTIVITY")
  sectionLabel: 'text-xs font-semibold tracking-widest text-[#8fa3b0] dark:text-[#6b8fa3] uppercase mb-3',
 
  // Tables
  table:        'w-full border-collapse text-sm',
  tableHeader:  'bg-[#f4f7f9] dark:bg-[#091624] text-xs font-semibold tracking-wider text-[#8fa3b0] uppercase',
  tableHeaderCell: 'px-4 py-3 text-left',
  tableRow:     'border-t border-[#e2e8ed] dark:border-[#1e3448] hover:bg-[#eaf6f9] dark:hover:bg-[#1e3448] transition-colors',
  // ⬅️ ADDED — row highlight for "closing soon + 0 applicants" jobs (pale red)
  tableRowWarning: 'border-t border-[#e2e8ed] dark:border-[#1e3448] bg-[#fdecec] dark:bg-[#2a1515] hover:bg-[#fbdcdc] dark:hover:bg-[#3a1c1c] transition-colors',
  tableCell:    'px-4 py-3 text-[#1a2a35] dark:text-[#e2edf3]',
  tableCellMuted: 'px-4 py-3 text-[#8fa3b0] dark:text-[#6b8fa3]',
  tableCellLink: 'px-4 py-3 text-[#00bbda] font-medium hover:underline',

  // ⬅️ ADDED — clickable column header for sorting (Date Posted / No. of Applicants)
  sortableHeader: 'flex items-center gap-1 cursor-pointer select-none hover:text-[#00bbda] transition-colors',

  // ⬅️ ADDED — checkbox used in bulk-select mode
  checkbox: 'w-4 h-4 rounded border-[#cbd5dd] dark:border-[#2a4256] text-[#00bbda] focus:ring-[#00bbda] cursor-pointer accent-[#00bbda]',

  // ⬅️ ADDED — search/filter input (job postings table)
  searchInput: 'w-full border border-[#e2e8ed] dark:border-[#1e3448] bg-white dark:bg-[#0d1f2d] text-[#1a2a35] dark:text-[#e2edf3] text-sm rounded pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bbda] placeholder:text-[#8fa3b0]',
 
  // Buttons
  btnPrimary:   'bg-[#00bbda] hover:bg-[#00a3bf] text-white text-sm font-medium px-5 py-2 rounded transition-colors',
  btnOutline:   'border border-[#00bbda] text-[#00bbda] hover:bg-[#e6f9fc] dark:hover:bg-[#1e3448] text-sm font-medium px-5 py-2 rounded transition-colors',
  btnDanger:    'border border-[#e05252] text-[#e05252] hover:bg-red-50 dark:hover:bg-[#2a1515] text-sm font-medium px-5 py-2 rounded transition-colors',
  btnNeutral:   'border border-[#cbd5dd] dark:border-[#2a4256] text-[#1a2a35] dark:text-[#e2edf3] hover:bg-[#f4f7f9] dark:hover:bg-[#1e3448] text-sm font-medium px-5 py-2 rounded transition-colors',
  btnGhost:     'text-[#8fa3b0] hover:text-[#00bbda] text-sm font-medium px-3 py-1 rounded transition-colors',
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
    // ⬅️ ADDED — job posting status badges
    open:         'border-[#198754] text-[#198754]',
    closed:       'border-[#6C757D] text-[#6C757D]',
  },
 
  // Sidebar
  sidebar: 'w-60 h-full bg-white dark:bg-[#091624] border-r border-[#e2e8ed] dark:border-[#1e3448] flex flex-col overflow-y-auto',
  sidebarLogo:  'px-6 py-5 text-[#00bbda] font-bold text-sm leading-tight tracking-wide uppercase',
  sidebarNav:   'flex-1 px-3 py-2',
  sidebarItem:  'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3] hover:bg-[#e6f9fc] dark:hover:bg-[#1e3448] hover:text-[#00bbda] transition-colors cursor-pointer',
  sidebarItemActive: 'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium bg-[#e6f9fc] dark:bg-[#1e3448] text-[#00bbda] border-l-2 border-[#00bbda]',
  sidebarFooter:'px-6 py-5 border-t border-[#e2e8ed] dark:border-[#1e3448]',

  // Chart cards (Dashboard graphs)
  chartCard:      'bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-5',
  chartCardTitle: 'text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-4',
} as const
 
// ─── Hiring Stage Labels ──────────────────────────────────────
export const HIRING_STAGES = [
  'Applied',
  'Initial Interview',
  'Exam / Assessment',
  'Department Interview',
  'For Onboarding',
] as const
 
export type HiringStage = typeof HIRING_STAGES[number]
 
// ─── Schedule Panel (Dashboard widget) ────────────────────────
export const schedule = {
  panelWrapper:   'w-full lg:w-[340px] shrink-0 bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-5',
  panelHeader:    'flex items-center justify-between mb-4',
  panelTitle:     'text-base font-semibold text-[#0f1f29] dark:text-[#e2edf3]',
  seeAllLink:     'text-xs font-medium text-[#00bbda] hover:underline',
 
  monthNavRow:    'flex items-center justify-between mb-3',
  monthNavBtn:    'w-6 h-6 flex items-center justify-center rounded text-[#8fa3b0] hover:text-[#00bbda] hover:bg-[#e6f9fc] dark:hover:bg-[#1e3448] transition-colors',
  monthLabel:     'text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3]',
 
  dateStripRow:   'flex items-center gap-1 mb-4',
  dateStripArrow: 'w-5 h-5 flex items-center justify-center text-[#8fa3b0] hover:text-[#00bbda] shrink-0',
  dateButton:     'flex-1 flex flex-col items-center py-1.5 rounded-md cursor-pointer text-[#1a2a35] dark:text-[#e2edf3]',
  dateButtonActive:'flex-1 flex flex-col items-center py-1.5 rounded-md cursor-pointer bg-[#00bbda] text-white',
  dateNum:        'text-sm font-semibold',
  dateDay:        'text-[10px] uppercase mt-0.5 opacity-80',
 
  tabRow:         'flex gap-4 border-b border-[#e2e8ed] dark:border-[#1e3448] mb-3',
  tab:            'pb-2 text-sm font-medium text-[#8fa3b0] border-b-2 border-transparent cursor-pointer',
  tabActive:      'pb-2 text-sm font-medium text-[#00bbda] border-b-2 border-[#00bbda] cursor-pointer',
  tabCount:       'ml-1 text-xs',
 
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
// ⬅️ CHANGED: added `deadline` field (string 'YYYY-MM-DD' or null).
// Status (open/closed) is NOT stored — it's always computed from
// `deadline` via getJobStatus(). See helper functions below.
export const PLACEHOLDER_JOBS = [
  { id: '1', title: 'HR Associate',          datePosted: '2026-06-01', deadline: '2026-07-05', applicantCount: 4, archived: false,
    description: 'Supports day-to-day HR operations including recruitment, onboarding, and employee records management.' },
  { id: '2', title: 'Operations Manager',    datePosted: '2026-06-05', deadline: '2026-07-03', applicantCount: 2, archived: false,
    description: 'Oversees daily operations, coordinates between departments, and ensures process efficiency.' },
  { id: '3', title: 'Accounting Clerk',      datePosted: '2026-06-10', deadline: null,          applicantCount: 3, archived: false,
    description: 'Handles invoice processing, bookkeeping, and basic financial recordkeeping.' },
  { id: '4', title: 'IT Support Specialist', datePosted: '2026-05-20', deadline: '2026-06-25', applicantCount: 1, archived: false,
    description: 'Provides first-line technical support for hardware, software, and network issues.' },
  { id: '5', title: 'Marketing Assistant',   datePosted: '2026-06-20', deadline: '2026-07-04', applicantCount: 0, archived: false,
    description: 'Assists in planning and executing marketing campaigns, social media content, and event coordination.' },
] as const
 
export type PlaceholderJob = typeof PLACEHOLDER_JOBS[number]

// ─── Job Status Helpers ────────────────────────────────────────
// Status is ALWAYS derived from `deadline`, never stored directly.
// This keeps status from ever going out of sync with the actual date.
export type JobStatus = 'open' | 'closed'

/**
 * Returns 'open' or 'closed' based on the deadline.
 * - No deadline (null) → always 'open' (can be applied to anytime).
 * - Deadline has passed (before today) → 'closed'.
 * - Deadline is today or in the future → 'open'.
 */
export function getJobStatus(deadline: string | null): JobStatus {
  if (!deadline) return 'open'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(0, 0, 0, 0)
  return deadlineDate < today ? 'closed' : 'open'
}

/**
 * Returns how many days are left until the deadline.
 * Returns null if there's no deadline.
 * Can return a negative number if the deadline already passed.
 */
export function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(0, 0, 0, 0)
  const diffMs = deadlineDate.getTime() - today.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * True kapag ≤7 days na lang bago mag-deadline AT 0 pa rin ang applicants.
 * Ginagamit ito para sa pale-red row highlight AT sa dynamic notifications.
 */
export function isClosingSoonWithNoApplicants(job: { deadline: string | null; applicantCount: number }): boolean {
  const daysLeft = getDaysUntilDeadline(job.deadline)
  if (daysLeft === null) return false
  return daysLeft >= 0 && daysLeft <= 7 && job.applicantCount === 0
}

/**
 * Builds dynamic notification entries for jobs that are closing soon
 * with zero applicants. TODO: once there's a backend, this should
 * probably run server-side (cron/edge function) instead of being
 * recomputed client-side on every render.
 */
export function getClosingSoonNotifications(jobs: readonly PlaceholderJob[]): Notification[] {
  return jobs
    .filter((job) => !job.archived && isClosingSoonWithNoApplicants(job))
    .map((job) => {
      const daysLeft = getDaysUntilDeadline(job.deadline)!
      return {
        id: `closing-soon-${job.id}`,
        message: `"${job.title}" closes in ${daysLeft} day${daysLeft === 1 ? '' : 's'} with 0 applicants`,
        time: 'Deadline approaching',
        unread: true,
      }
    })
}
 
// ─── Slide-in Panel (e.g. "Add New Job Opening" drawer) ────────
export const panel = {
  backdrop: (isOpen: boolean) =>
    `fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0'
    }`,
  drawer: (isOpen: boolean) =>
    `fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#0d1f2d] shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`,
  header:       'bg-[#00bbda] text-white px-6 py-4 flex items-center justify-between shrink-0',
  headerTitle:  'text-base font-semibold',
  closeBtn:     'text-white/90 hover:text-white text-xl leading-none w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors',
  body:         'flex-1 overflow-y-auto p-6',
  footer:       'border-t border-[#e2e8ed] dark:border-[#1e3448] px-6 py-4 flex gap-3 shrink-0',
} as const

// ─── Dashboard Header (title row + welcome + actions) ─────────
export const dashboardHeader = {
  row:          'flex items-start justify-between',
  titleGroup:   'flex flex-col',
  welcomeText:  'text-sm text-[#8fa3b0] dark:text-[#6b8fa3] mt-1',
  actionsGroup: 'flex items-center gap-3',
} as const

// ─── Refresh Button ─────────────────────────────────────────
export const refreshBtn = {
  base:      'w-9 h-9 flex items-center justify-center rounded-full text-[#8fa3b0] hover:bg-[#00bbda] hover:text-white transition-colors',
  spinning:  'animate-spin',
} as const

// ─── Notification Bell + Dropdown ──────────────────────────────
export const notif = {
  wrapper:      'relative',
  bellBtn:      'w-9 h-9 flex items-center justify-center rounded-full text-[#8fa3b0] hover:bg-[#00bbda] hover:text-white transition-colors relative',
  dot:          'absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e05252] border border-white dark:border-[#0d1f2d]',
  dropdown:     'absolute right-0 top-11 w-80 bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg shadow-lg z-50 overflow-hidden',
  dropdownHeader: 'px-4 py-3 border-b border-[#e2e8ed] dark:border-[#1e3448] text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3]',
  list:         'max-h-80 overflow-y-auto',
  item:         'px-4 py-3 border-b border-[#e2e8ed] dark:border-[#1e3448] last:border-b-0 hover:bg-[#f4f7f9] dark:hover:bg-[#1e3448] transition-colors cursor-pointer',
  itemUnread:   'px-4 py-3 border-b border-[#e2e8ed] dark:border-[#1e3448] last:border-b-0 hover:bg-[#f4f7f9] dark:hover:bg-[#1e3448] transition-colors cursor-pointer bg-[#eaf6f9] dark:bg-[#0d2b38]',
  itemText:     'text-sm text-[#1a2a35] dark:text-[#e2edf3]',
  itemTime:     'text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-1',
  emptyState:   'text-sm text-[#8fa3b0] dark:text-[#6b8fa3] text-center py-8',
} as const

// ─── Page Header (title row, shared across ALL admin pages) ────
export const pageHeader = {
  row:          'flex items-center justify-between',
  actionsGroup: 'flex items-center gap-1',
} as const

// ⬅️ CHANGED: id can now be string (dynamic closing-soon notifs use "closing-soon-{jobId}")
// or number (existing static placeholders below).
export interface Notification {
  id: string | number
  message: string
  time: string
  unread: boolean
}

export const PLACEHOLDER_NOTIFICATIONS: Notification[] = [
  { id: 1, message: 'New applicant for HR Associate — Juan Dela Cruz',      time: '10 mins ago', unread: true },
  { id: 2, message: 'Job posting "Accounting Clerk" is now closed',        time: '1 hour ago',   unread: true },
  { id: 3, message: 'Applicant moved to Department Interview — Paulo Dybala', time: 'Yesterday', unread: false },
]

// TODO: replace with real logged-in user from auth/session
export const PLACEHOLDER_USER = {
  name: 'Maria Santos',
  role: 'HR Officer',
} as const