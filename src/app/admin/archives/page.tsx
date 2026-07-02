'use client'

import React, { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import PageHeader from '@/components/admin/PageHeader'
import { components } from '@/lib/admin-theme'

// ═══════════════════════════════════════════════════════════
// MOCK DATA — Closed Job Postings
// TODO(supabase): replace with a query against `job_postings`
//   WHERE status = 'closed' (or wherever getJobStatus() derives 'closed' from).
//   Expected columns: id, title, department, employment_type, date_posted,
//   date_closed, applicant_count (can be a COUNT() from `applicants`), hired_count
//   (COUNT() from `applicants` WHERE stage = 'For Onboarding' AND finalized = true,
//   or similar — confirm exact "hired" definition once onboarding logic exists).
// ═══════════════════════════════════════════════════════════
type ClosedJob = {
  id: string          // TODO(supabase): should match job_postings.id (uuid, not number)
  title: string
  department: string
  type: string         // TODO(supabase): confirm column name — employment_type?
  datePosted: string
  dateClosed: string
  applicantCount: number
  hiredCount: number
}

const CLOSED_JOBS: ClosedJob[] = [
  { id: '1', title: 'Administrative Assistant',        department: 'Administration', type: 'Full-time', datePosted: '2026-04-01', dateClosed: '2026-05-15', applicantCount: 9,  hiredCount: 1 },
  { id: '2', title: 'Security Officer',                department: 'Operations',     type: 'Full-time', datePosted: '2026-03-15', dateClosed: '2026-05-01', applicantCount: 14, hiredCount: 2 },
  { id: '3', title: 'Customer Service Representative', department: 'Sales',          type: 'Part-time', datePosted: '2026-03-20', dateClosed: '2026-04-30', applicantCount: 11, hiredCount: 3 },
]

// ═══════════════════════════════════════════════════════════
// MOCK DATA — Rejected / Withdrawn Applicants
// TODO(supabase): replace with a query against `applicants`
//   WHERE status IN ('rejected', 'withdrawn').
//   Expected columns: id, name, email, job_applied (FK to job_postings.title
//   or job_postings.id — join if FK), date_applied, outcome ('Rejected' | 'Withdrawn'),
//   note (free text reason, nullable — HR may not always fill this in).
// ═══════════════════════════════════════════════════════════
type ArchivedApplicant = {
  id: string           // TODO(supabase): should match applicants.id (uuid, not number)
  name: string
  email: string
  jobApplied: string
  dateApplied: string
  outcome: 'Rejected' | 'Withdrawn'
  note: string | null  // nullable — HR might leave this blank
}

const ARCHIVED_APPLICANTS: ArchivedApplicant[] = [
  { id: '1', name: 'Katrina Gonzales', email: 'katrina.gonzales@email.com', jobApplied: 'Finance Officer',      dateApplied: '2026-05-10', outcome: 'Rejected',  note: 'Did not pass exam' },
  { id: '2', name: 'Mark Espiritu',    email: 'mark.espiritu@email.com',    jobApplied: 'IT Developer',         dateApplied: '2026-05-08', outcome: 'Withdrawn', note: 'Accepted another offer' },
  { id: '3', name: 'Diana Reyes',      email: 'diana.reyes@email.com',      jobApplied: 'HR Assistant',         dateApplied: '2026-04-22', outcome: 'Rejected',  note: 'Overqualified' },
  { id: '4', name: 'Felix Morales',    email: 'felix.morales@email.com',    jobApplied: 'Sales Representative', dateApplied: '2026-04-18', outcome: 'Rejected',  note: 'Did not pass interview' },
  { id: '5', name: 'Tricia Santos',    email: 'tricia.santos@email.com',    jobApplied: 'Operations Staff',     dateApplied: '2026-04-15', outcome: 'Withdrawn', note: 'Personal reasons' },
]

// Avatar background colors, cycled by row index since there's no
// per-user color stored in the database — purely a UI detail.
const AVATAR_COLORS = ['#f59e0b', '#6610F2', '#198754', '#e05252', '#0D6EFD']

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

// TODO(theme): no dedicated "withdrawn" badge token exists yet in admin-theme.ts.
// Using badge.applied (neutral gray) as a stand-in. Consider adding
// badge.withdrawn as its own token once we're happy with a color for it,
// so this page doesn't need a local fallback map.
const OUTCOME_BADGE: Record<ArchivedApplicant['outcome'], string> = {
  Rejected: components.badge.rejected,
  Withdrawn: components.badge.applied,
}

// ─── Tab icons — same visual language as ChevronIcon/SearchIcon elsewhere ── */
function ArchiveBoxIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7v12a1 1 0 001 1h12a1 1 0 001-1V7M9 11h6" />
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3 7l1.5-3h15L21 7" />
    </svg>
  )
}

function UserOffIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" strokeWidth="1.8" />
      <path strokeWidth="1.8" strokeLinecap="round" d="M17 8l5 5M22 8l-5 5" />
    </svg>
  )
}

const SUB_TABS = ['Closed Job Postings', 'Rejected / Withdrawn Applicants'] as const
type SubTab = typeof SUB_TABS[number]

const TAB_ICONS: Record<SubTab, (props: { className: string }) => React.ReactElement> = {
  'Closed Job Postings': ArchiveBoxIcon,
  'Rejected / Withdrawn Applicants': UserOffIcon,
}

// Local override: same label style as components.tableHeader, but white
// background instead of gray — keeps the "one continuous sheet of paper"
// feel from the active tab all the way down to the table rows.
const theadClass = 'bg-white dark:bg-[#132435] text-xs font-semibold tracking-wider text-[#8fa3b0] uppercase border-b border-[#e2e8ed] dark:border-[#1e3448]'

export default function ArchivesPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('Closed Job Postings')

  // TODO(supabase): once wired up, these two mock arrays become
  // useState + useEffect (or a server component fetch) — e.g.
  //   const [closedJobs, setClosedJobs] = useState<ClosedJob[]>([])
  //   useEffect(() => { supabase.from('job_postings').select(...).eq('status', 'closed')... }, [])
  // Keeping the shape identical (ClosedJob[], ArchivedApplicant[]) means
  // everything below — the tables, badges, restore button — doesn't
  // need to change at all when this swap happens.

  return (
    <AdminLayout>
      <PageHeader title="Archive" />
      <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3] -mt-3 mb-6">
        Closed job postings and concluded applicant records
      </p>

      {/* ── Folder tabs — restrained palette: only white + one soft
          blue-gray tint, no competing grays. Active tab sits raised,
          same white as the panel below so it reads as one continuous
          sheet; inactive tab sits behind, slightly smaller & tinted. ── */}
      <div className="flex items-end gap-1">
        {SUB_TABS.map((tab) => {
          const isActive = activeTab === tab
          const Icon = TAB_ICONS[tab]
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                isActive
                  ? 'relative z-10 flex items-center gap-2 px-5 py-3 rounded-t-xl bg-white dark:bg-[#132435] border border-b-0 border-[#e2e8ed] dark:border-[#1e3448] text-sm font-semibold text-[#00bbda] whitespace-nowrap shadow-[0_-2px_6px_-2px_rgba(15,31,41,0.06)]'
                  : 'flex items-center gap-2 px-5 py-2.5 mb-[1px] rounded-t-xl bg-[#eef4f6] dark:bg-[#0d2333] text-sm font-medium text-[#7a94a0] dark:text-[#6b8fa3] hover:text-[#00bbda] hover:bg-[#e2eef1] dark:hover:bg-[#112c3f] transition-colors whitespace-nowrap'
              }
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#00bbda]' : 'text-[#7a94a0] dark:text-[#6b8fa3]'}`} />
              {tab}
            </button>
          )
        })}
      </div>

      {/* ── Panel — same white as the active tab, no visible seam between them ── */}
      <div className="-mt-px border border-[#e2e8ed] dark:border-[#1e3448] rounded-b-xl rounded-tr-xl bg-white dark:bg-[#132435] shadow-sm overflow-hidden">

        {/* ── Closed Job Postings ── */}
        {activeTab === 'Closed Job Postings' && (
          <>
            <table className={components.table}>
              <thead className={theadClass}>
                <tr>
                  <th className={components.tableHeaderCell}>Position</th>
                  <th className={components.tableHeaderCell}>Department</th>
                  <th className={components.tableHeaderCell}>Type</th>
                  <th className={components.tableHeaderCell}>Date Posted</th>
                  <th className={components.tableHeaderCell}>Date Closed</th>
                  <th className={components.tableHeaderCell}>Applicants</th>
                  <th className={components.tableHeaderCell}>Hired</th>
                  <th className={components.tableHeaderCell}>Status</th>
                  {/* TODO(product): confirm if "Restore" (reopen a closed posting)
                      is an actual feature we want, or if closed postings should
                      stay permanently closed. Keeping it for now since it existed
                      in the previous version of this page. */}
                  <th className={components.tableHeaderCell}>Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#132435]">
                {CLOSED_JOBS.map((job) => (
                  <tr key={job.id} className={components.tableRow}>
                    <td className={`${components.tableCell} font-medium`}>{job.title}</td>
                    <td className={components.tableCellMuted}>{job.department}</td>
                    <td className={components.tableCellMuted}>{job.type}</td>
                    <td className={components.tableCellMuted}>{job.datePosted}</td>
                    <td className={components.tableCellMuted}>{job.dateClosed}</td>
                    <td className={components.tableCell}>{job.applicantCount}</td>
                    <td className={`${components.tableCell} text-[#198754] font-medium`}>{job.hiredCount}</td>
                    <td className={components.tableCell}>
                      <span className={`${components.badge.base} ${components.badge.closed}`}>Closed</span>
                    </td>
                    <td className={components.tableCell}>
                      {/* TODO(supabase): wire up to an actual restore action —
                          e.g. update job_postings.deadline to a future date,
                          or a dedicated `status` override if that gets added. */}
                      <button className={components.btnOutlineSm}>Restore</button>
                    </td>
                  </tr>
                ))}
                {CLOSED_JOBS.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
                      No closed job postings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-[#e2e8ed] dark:border-[#1e3448] text-xs text-[#8fa3b0] dark:text-[#6b8fa3] bg-white dark:bg-[#132435]">
              {CLOSED_JOBS.length} closed posting{CLOSED_JOBS.length === 1 ? '' : 's'}
            </div>
          </>
        )}

        {/* ── Rejected / Withdrawn Applicants ── */}
        {activeTab === 'Rejected / Withdrawn Applicants' && (
          <>
            <table className={components.table}>
              <thead className={theadClass}>
                <tr>
                  <th className={components.tableHeaderCell}>Applicant</th>
                  <th className={components.tableHeaderCell}>Position Applied</th>
                  <th className={components.tableHeaderCell}>Date Applied</th>
                  <th className={components.tableHeaderCell}>Outcome</th>
                  <th className={components.tableHeaderCell}>Reason / Note</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#132435]">
                {ARCHIVED_APPLICANTS.map((app, i) => (
                  <tr key={app.id} className={components.tableRow}>
                    <td className={components.tableCell}>
                      <div className="flex items-center gap-3">
                        {/* TODO(supabase): swap for a real avatar image (applicants.avatar_url)
                            once profile photos are supported — fall back to initials if null. */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                          style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                        >
                          {getInitials(app.name)}
                        </div>
                        <div>
                          <p className="font-medium text-[#1a2a35] dark:text-[#e2edf3]">{app.name}</p>
                          <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={components.tableCellMuted}>{app.jobApplied}</td>
                    <td className={components.tableCellMuted}>{app.dateApplied}</td>
                    <td className={components.tableCell}>
                      <span className={`${components.badge.base} ${OUTCOME_BADGE[app.outcome]}`}>
                        {app.outcome}
                      </span>
                    </td>
                    <td className={components.tableCellMuted}>{app.note ?? '—'}</td>
                  </tr>
                ))}
                {ARCHIVED_APPLICANTS.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
                      No archived applicant records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-[#e2e8ed] dark:border-[#1e3448] text-xs text-[#8fa3b0] dark:text-[#6b8fa3] bg-white dark:bg-[#132435]">
              {ARCHIVED_APPLICANTS.length} archived applicant{ARCHIVED_APPLICANTS.length === 1 ? '' : 's'}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}