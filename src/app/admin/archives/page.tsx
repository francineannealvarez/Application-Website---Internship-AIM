'use client'

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { components } from '@/lib/admin-theme'

// ─── Mock Data ──────────────────────────────────────────────
// TODO: replace with real data from Supabase once archives are wired up.
const ARCHIVED_JOBS = [
  { id: 1, title: 'Administrative Assistant', datePosted: '2026-04-15', dateArchived: '2026-06-25' },
  { id: 2, title: 'Marketing Coordinator',    datePosted: '2026-03-10', dateArchived: '2026-05-01' },
]

const ARCHIVED_APPLICANTS = [
  { id: 1, name: 'Tina Cruz', jobApplied: 'Administrative Assistant', status: 'Initial Interview', dateArchived: 'Jun 25, 2026' },
]

// Map stage names to existing badge styles from admin-theme
const STATUS_BADGE: Record<string, string> = {
  'Applied':               components.badge.initial,
  'Initial Interview':     components.badge.initial,
  'Exam / Assessment':     components.badge.exam,
  'Department Interview':  components.badge.department,
  'For Onboarding':        components.badge.onboarding,
  'Rejected':               components.badge.rejected,
}

export default function ArchivesPage() {
  return (
    <AdminLayout>
      <h1 className={components.pageTitle}>Archives</h1>
      <hr className={components.pageDivider} />

      {/* ── Two-column layout, each panel scrolls independently ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">

        {/* ── Left: Archived Job Postings ── */}
        {/* Dark panel wrapper so each column reads as a distinct block. */}
        <section className="bg-[#003d52] rounded-lg p-4">
          <p className="text-xs font-semibold tracking-widest text-[#c0eaf3] uppercase mb-3">
            Archived Job Postings
          </p>

          <div className="rounded-lg overflow-hidden">
            <table className={components.table}>
              <thead className="bg-[#001f2a] text-xs font-semibold tracking-wider text-[#8fc3d4] uppercase">
                <tr>
                  <th className={components.tableHeaderCell}>Job Title</th>
                  <th className={components.tableHeaderCell}>Date Posted</th>
                  <th className={components.tableHeaderCell}>Date Archived</th>
                  <th className={components.tableHeaderCell}>Action</th>
                </tr>
              </thead>
            </table>

            {/* Scrollable body — independent from the applicants panel */}
            <div className="max-h-[420px] overflow-y-auto bg-white dark:bg-[#132435]">
              <table className={components.table}>
                <tbody>
                  {ARCHIVED_JOBS.map((job) => (
                    <tr key={job.id} className={components.tableRow}>
                      <td className={`${components.tableCell} font-medium`}>{job.title}</td>
                      <td className={components.tableCellMuted}>{job.datePosted}</td>
                      <td className={components.tableCellMuted}>{job.dateArchived}</td>
                      <td className={components.tableCell}>
                        <button className={components.btnOutline}>Restore</button>
                      </td>
                    </tr>
                  ))}
                  {ARCHIVED_JOBS.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
                        No archived job postings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Right: Archived Applicant Records ── */}
        <section className="bg-[#003d52] rounded-lg p-4">
          <p className="text-xs font-semibold tracking-widest text-[#c0eaf3] uppercase mb-3">
            Archived Applicant Records
          </p>

          <div className="rounded-lg overflow-hidden">
            <table className={components.table}>
              <thead className="bg-[#001f2a] text-xs font-semibold tracking-wider text-[#8fc3d4] uppercase">
                <tr>
                  <th className={components.tableHeaderCell}>Name</th>
                  <th className={components.tableHeaderCell}>Job Applied</th>
                  <th className={components.tableHeaderCell}>Status</th>
                  <th className={components.tableHeaderCell}>Date Archived</th>
                </tr>
              </thead>
            </table>

            {/* Scrollable body — independent from the job postings panel */}
            <div className="max-h-[420px] overflow-y-auto bg-white dark:bg-[#132435]">
              <table className={components.table}>
                <tbody>
                  {ARCHIVED_APPLICANTS.map((app) => (
                    <tr key={app.id} className={components.tableRow}>
                      <td className={`${components.tableCell} font-medium`}>{app.name}</td>
                      <td className={components.tableCellMuted}>{app.jobApplied}</td>
                      <td className={components.tableCell}>
                        <span className={`${components.badge.base} ${STATUS_BADGE[app.status] ?? components.badge.initial}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className={components.tableCellMuted}>{app.dateArchived}</td>
                    </tr>
                  ))}
                  {ARCHIVED_APPLICANTS.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
                        No archived applicant records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </AdminLayout>
  )
}