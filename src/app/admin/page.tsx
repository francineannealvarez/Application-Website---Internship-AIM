'use client'

/**
 * src/app/admin/page.tsx
 * ─────────────────────────────────────────────────────────────
 * HR Admin Dashboard — the first page after login.
 * Placeholder data is used throughout (no backend yet).
 * TODO: Replace PLACEHOLDER_* constants with real Supabase queries.
 * ─────────────────────────────────────────────────────────────
 */

import AdminLayout from '@/components/admin/AdminLayout'
import PageHeader from '@/components/admin/PageHeader'
import SchedulePanel from '@/components/admin/SchedulePanel'
import { components, PLACEHOLDER_USER } from '@/lib/admin-theme'
import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts' // ⬅️ ADDED

// ─── Placeholder Data ─────────────────────────────────────────
// TODO: fetch these from Supabase when backend is ready

const PLACEHOLDER_STATS = {
  activeJobPostings: 4,
  totalApplicants:   10,
  pendingActions:    2,
  newHires:          3,
}

const NEW_HIRES_RANGE = 'Jun \u2013 May 2026'

// ⬅️ ADDED — fake monthly data for the two dashboard graphs.
// TODO: replace with real Supabase aggregation (count applicants/employees per month)
const PLACEHOLDER_APPLICANTS_TREND = [
  { month: 'Jan', applicants: 4 },
  { month: 'Feb', applicants: 6 },
  { month: 'Mar', applicants: 5 },
  { month: 'Apr', applicants: 8 },
  { month: 'May', applicants: 7 },
  { month: 'Jun', applicants: 10 },
]

const PLACEHOLDER_HEADCOUNT_TREND = [
  { month: 'Jan', headcount: 22 },
  { month: 'Feb', headcount: 23 },
  { month: 'Mar', headcount: 23 },
  { month: 'Apr', headcount: 25 },
  { month: 'May', headcount: 26 },
  { month: 'Jun', headcount: 28 },
]

const PLACEHOLDER_ACTIVITY = [
  { id: 1, description: 'HR Associate — 3 new applicants',                       date: 'Jun 30, 2026', isHighlight: false },
  { id: 2, description: 'Operations Manager — Job posting created',              date: 'Jun 30, 2026', isHighlight: false },
  { id: 3, description: 'Accounting Clerk — 2 new applicants',                  date: 'Jun 29, 2026', isHighlight: false },
  { id: 4, description: 'IT Support Specialist — Applicant moved to For Onboarding', date: 'Jun 28, 2026', isHighlight: true  },
  { id: 5, description: 'HR Associate — Applicant moved to Department Interview',date: 'Jun 27, 2026', isHighlight: true  },
  { id: 6, description: 'Administrative Assistant — Job archived',               date: 'Jun 25, 2026', isHighlight: false },
]

// ─── Icons for stat cards ──────────────────────────────────────
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

function PersonCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="white" viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="4" strokeWidth="1.8"/>
      <path strokeWidth="1.8" strokeLinecap="round" d="M2 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M17 11l2 2 4-4"/>
    </svg>
  )
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({
  number,
  label,
  icon,
  shade,
  subtext,
}: {
  number: number
  label: string
  icon: React.ReactNode
  shade: 'light' | 'mid' | 'dark' | 'accent'
  subtext?: string
}) {
  return (
    <div className={components.statCard}>
      <div className={`${components.statIconBadge.base} ${components.statIconBadge[shade]}`}>
        {icon}
      </div>
      <div>
        <p className={components.statNumber}>{number}</p>
        <p className={components.statLabel}>{label}</p>
        {subtext && (
          <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">{subtext}</p>
        )}
      </div>
    </div>
  )
}

// ⬅️ ADDED — reusable line chart card
function ChartCard({
  title,
  data,
  dataKey,
  color,
}: {
  title: string
  data: { month: string; [key: string]: string | number }[]
  dataKey: string
  color: string
}) {
  return (
    <div className={components.chartCard}>
      <p className={components.chartCardTitle}>{title}</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8ed" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#8fa3b0' }}
              axisLine={{ stroke: '#e2e8ed' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#8fa3b0' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8ed',
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <AdminLayout>

      <PageHeader title="Dashboard" />

      <p className="text-sm text-[#333131] dark:text-[#333131] -mt-10 mb-10">
        Welcome back, {PLACEHOLDER_USER.name}!
      </p>

      <div className="flex flex-col lg:flex-row gap-6 mt-6 items-start">

        <div className="flex-1 min-w-0 w-full">

          {/* Stat cards row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <StatCard
              number={PLACEHOLDER_STATS.newHires}
              label="New Hires"
              icon={<PersonCheckIcon className="w-5 h-5" />}
              shade="accent"
              subtext={NEW_HIRES_RANGE}
            />
          </div>

          {/* ⬅️ ADDED — Graphs row: Applicants Trend + Headcount Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <ChartCard
              title="Applicants This Year"
              data={PLACEHOLDER_APPLICANTS_TREND}
              dataKey="applicants"
              color="#00bbda"
            />
            <ChartCard
              title="Headcount Trend"
              data={PLACEHOLDER_HEADCOUNT_TREND}
              dataKey="headcount"
              color="#007a8f"
            />
          </div>

          {/* Recent Activity */}
          <section className="mt-10">
            <p className={components.sectionLabel}>Recent Activity</p>

            <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg overflow-hidden">
              <table className={components.table}>
                <thead className={components.tableHeader}>
                  <tr>
                    <th className={components.tableHeaderCell}>Description</th>
                    <th className={`${components.tableHeaderCell} text-right`}>Date</th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-[#132435]">
                  {PLACEHOLDER_ACTIVITY.map((item) => (
                    <tr key={item.id} className={components.tableRow}>
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

          <div className="flex gap-3 mt-8">
            <Link href="/admin/job_postings" className={components.btnPrimary}>
              View Job Postings
            </Link>
            <Link href="/admin/applicants" className={components.btnOutline}>
              View Applicants Pipeline
            </Link>
          </div>

        </div>

        <SchedulePanel />

      </div>

    </AdminLayout>
  )
}