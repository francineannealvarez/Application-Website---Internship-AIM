/**
 * src/app/admin/page.tsx
 * ─────────────────────────────────────────────────────────────
 * HR Admin Dashboard — the first page after login.
 * Placeholder data is used throughout (no backend yet).
 * TODO: Replace PLACEHOLDER_* constants with real Supabase queries.
 * ─────────────────────────────────────────────────────────────
 */
 
import AdminLayout from '@/components/admin/AdminLayout'
import SchedulePanel from '@/components/admin/SchedulePanel'
import { components } from '@/lib/admin-theme'
import Link from 'next/link'
 
// ─── Placeholder Data ─────────────────────────────────────────
// TODO: fetch these from Supabase when backend is ready
 
const PLACEHOLDER_STATS = {
  activeJobPostings: 4,
  totalApplicants:   10,
  pendingActions:    2,
}
 
const PLACEHOLDER_ACTIVITY = [
  { id: 1, description: 'HR Associate — 3 new applicants',                       date: 'Jun 30, 2026', isHighlight: false },
  { id: 2, description: 'Operations Manager — Job posting created',              date: 'Jun 30, 2026', isHighlight: false },
  { id: 3, description: 'Accounting Clerk — 2 new applicants',                  date: 'Jun 29, 2026', isHighlight: false },
  { id: 4, description: 'IT Support Specialist — Applicant moved to For Onboarding', date: 'Jun 28, 2026', isHighlight: true  },
  { id: 5, description: 'HR Associate — Applicant moved to Department Interview',date: 'Jun 27, 2026', isHighlight: true  },
  { id: 6, description: 'Administrative Assistant — Job archived',               date: 'Jun 25, 2026', isHighlight: false },
]
 
// ─── Icons for stat cards ──────────────────────────────────────
// Plain inline SVGs, no icon library needed. Each one matches the stat's meaning:
// briefcase = job postings, people = applicants, clock = pending actions.
function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="white" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
  )
}
 
function PeopleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="white" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4" strokeWidth="1.8"/>
      <path strokeWidth="1.8" strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )
}
 
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="white" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth="1.8"/>
      <path strokeWidth="1.8" strokeLinecap="round" d="M12 7v5l3 3"/>
    </svg>
  )
}
 
// ─── Stat Card ────────────────────────────────────────────────
// `shade` picks which blue tone the icon badge uses (light/mid/dark),
// defined once in admin-theme.ts so all three cards stay visually related
// but distinguishable from each other.
function StatCard({
  number,
  label,
  icon,
  shade,
}: {
  number: number
  label: string
  icon: React.ReactNode
  shade: 'light' | 'mid' | 'dark'
}) {
  return (
    <div className={components.statCard}>
      {/* Icon badge — solid blue square with white icon */}
      <div className={`${components.statIconBadge.base} ${components.statIconBadge[shade]}`}>
        {icon}
      </div>
      <div>
        {/* Big number */}
        <p className={components.statNumber}>{number}</p>
        {/* Label below, muted */}
        <p className={components.statLabel}>{label}</p>
      </div>
    </div>
  )
}
 
// ─── Page ────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <AdminLayout>
 
      {/* Page title */}
      <h1 className={components.pageTitle}>Dashboard</h1>
      <hr className={components.pageDivider} />
 
      {/* ── Main row: left = stats/activity (flexible width), right = schedule widget (fixed width) ── */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6 items-start">
 
        {/* Left column — takes up remaining space */}
        <div className="flex-1 min-w-0 w-full">
 
          {/* Stat cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              number={PLACEHOLDER_STATS.activeJobPostings}
              label="Total Active Job Postings"
              icon={<BriefcaseIcon className="w-5 h-5" />}
              shade="light"
            />
            <StatCard
              number={PLACEHOLDER_STATS.totalApplicants}
              label="Total Applicants"
              icon={<PeopleIcon className="w-5 h-5" />}
              shade="mid"
            />
            <StatCard
              number={PLACEHOLDER_STATS.pendingActions}
              label="Pending Actions"
              icon={<ClockIcon className="w-5 h-5" />}
              shade="dark"
            />
          </div>
 
          {/* Recent Activity */}
          <section className="mt-10">
            <p className={components.sectionLabel}>Recent Activity</p>
 
            {/* Table wrapper with border */}
            <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg overflow-hidden">
              <table className={components.table}>
                {/* Table header */}
                <thead className={components.tableHeader}>
                  <tr>
                    <th className={components.tableHeaderCell}>Description</th>
                    <th className={`${components.tableHeaderCell} text-right`}>Date</th>
                  </tr>
                </thead>
 
                {/* Table rows */}
                <tbody className="bg-white dark:bg-[#132435]">
                  {PLACEHOLDER_ACTIVITY.map((item) => (
                    <tr key={item.id} className={components.tableRow}>
                      {/* Highlight rows where an applicant moved stages */}
                      <td className={`${components.tableCell} ${item.isHighlight ? 'text-[#00bbda]' : ''}`}>
                        {item.description}
                      </td>
                      <td className={`${components.tableCellMuted} text-right`}>
                        {item.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
 
          {/* Quick Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Link href="/admin/job_postings" className={components.btnPrimary}>
              View Job Postings
            </Link>
            <Link href="/admin/applicants" className={components.btnOutline}>
              View Applicants Pipeline
            </Link>
          </div>
 
        </div>
 
        {/* Right column — fixed-width schedule widget, wraps below on smaller screens */}
        <SchedulePanel />
 
      </div>
 
    </AdminLayout>
  )
}