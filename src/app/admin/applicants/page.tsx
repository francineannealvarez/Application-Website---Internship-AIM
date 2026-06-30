'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { components } from '@/lib/admin-theme'

// ─── Mock Data ──────────────────────────────────────────────
// TODO: replace with real data from Supabase once applicants table is wired up.
const MOCK_APPLICANTS = [
  { id: 1,  name: 'Maria Santos',     job: 'HR Associate',         dateApplied: '2026-06-02', dateMoved: '2026-06-30', stage: 'Initial Interview' },
  { id: 2,  name: 'Jose Reyes',       job: 'HR Associate',         dateApplied: '2026-06-03', dateMoved: '2026-06-05', stage: 'Applied' },
  { id: 3,  name: 'Ana Dela Cruz',    job: 'HR Associate',         dateApplied: '2026-06-04', dateMoved: '2026-06-09', stage: 'Exam / Assessment' },
  { id: 4,  name: 'Roberto Lim',      job: 'HR Associate',         dateApplied: '2026-06-05', dateMoved: '2026-06-22', stage: 'For Onboarding' },
  { id: 5,  name: 'Carmen Villanueva',job: 'Operations Manager',   dateApplied: '2026-06-06', dateMoved: '2026-06-08', stage: 'Initial Interview' },
  { id: 6,  name: 'Eduardo Torres',   job: 'Operations Manager',   dateApplied: '2026-06-07', dateMoved: '2026-06-12', stage: 'Department Interview' },
  { id: 7,  name: 'Liza Ramos',       job: 'Accounting Clerk',     dateApplied: '2026-06-08', dateMoved: '2026-06-10', stage: 'Initial Interview' },
  { id: 8,  name: 'Paolo Garcia',     job: 'Accounting Clerk',     dateApplied: '2026-06-09', dateMoved: '2026-06-11', stage: 'Exam / Assessment' },
  { id: 9,  name: 'Tina Cruz',        job: 'Accounting Clerk',     dateApplied: '2026-06-10', dateMoved: '2026-06-14', stage: 'Initial Interview' },
  { id: 10, name: 'Mark Aquino',      job: 'IT Support Specialist',dateApplied: '2026-06-11', dateMoved: '2026-06-28', stage: 'For Onboarding' },
] as const

const STAGES = [
  'All',
  'Applied',
  'Initial Interview',
  'Exam / Assessment',
  'Department Interview',
  'For Onboarding',
] as const

type Stage = typeof STAGES[number]

// Map stage names to existing badge styles from admin-theme
const STATUS_BADGE: Record<string, string> = {
  'Applied':              components.badge.applied,  
  'Initial Interview':    components.badge.initial,
  'Exam / Assessment':    components.badge.exam,
  'Department Interview': components.badge.department,
  'For Onboarding':       components.badge.onboarding,
}

export default function ApplicantsPage() {
  const [activeStage, setActiveStage] = useState<Stage>('All')
  const [jobFilter, setJobFilter] = useState<string>('All Job Postings')
  const [search, setSearch] = useState('')

  // Unique job titles, for the dropdown filter
  const jobTitles = useMemo(
    () => Array.from(new Set(MOCK_APPLICANTS.map((a) => a.job))),
    []
  )

  // Stage counts for tab labels — based on full dataset, not filtered list,
  // so the numbers stay stable while the person is filtering/searching.
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { All: MOCK_APPLICANTS.length }
    for (const stage of STAGES.slice(1)) {
      counts[stage] = MOCK_APPLICANTS.filter((a) => a.stage === stage).length
    }
    return counts
  }, [])

  // Apply stage tab + job dropdown + search (case-insensitive, matches name or job)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MOCK_APPLICANTS.filter((a) => {
      const matchesStage = activeStage === 'All' || a.stage === activeStage
      const matchesJob = jobFilter === 'All Job Postings' || a.job === jobFilter
      const matchesSearch =
        q === '' ||
        a.name.toLowerCase().includes(q) ||
        a.job.toLowerCase().includes(q)
      return matchesStage && matchesJob && matchesSearch
    })
  }, [activeStage, jobFilter, search])

  // Group filtered results by job title, in first-seen order
  const grouped = useMemo(() => {
    const groups: { job: string; applicants: typeof MOCK_APPLICANTS[number][] }[] = []
    for (const applicant of filtered) {
      let group = groups.find((g) => g.job === applicant.job)
      if (!group) {
        group = { job: applicant.job, applicants: [] }
        groups.push(group)
      }
      group.applicants.push(applicant)
    }
    return groups
  }, [filtered])

  return (
    <AdminLayout>
      <h1 className={components.pageTitle}>Applicants Pipeline</h1>
      <hr className={components.pageDivider} />

      {/* ── Stage tabs ── */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
      {STAGES.map((stage) => (
          <button
          key={stage}
          onClick={() => setActiveStage(stage)}
          className={
              activeStage === stage
              ? 'px-4 py-2 rounded-full text-sm font-medium bg-[#00bbda] text-white whitespace-nowrap transition-colors'
              : 'px-4 py-2 rounded-full text-sm font-medium bg-[#f4f7f9] dark:bg-[#132435] text-[#1a2a35] dark:text-[#e2edf3] border border-[#e2e8ed] dark:border-[#1e3448] hover:border-[#00bbda] hover:text-[#00bbda] whitespace-nowrap transition-colors'
          }
          >
          {stage} [{stageCounts[stage]}]
          </button>
      ))}
      </div>

      {/* ── Filter row: job posting dropdown + search ── */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:items-center sm:justify-between">
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#132435] text-[#1a2a35] dark:text-[#e2edf3] w-full sm:w-56"
        >
          <option>All Job Postings</option>
          {jobTitles.map((job) => (
            <option key={job}>{job}</option>
          ))}
        </select>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or job posting..."
          className="text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#132435] text-[#1a2a35] dark:text-[#e2edf3] w-full sm:w-72 placeholder:text-[#8fa3b0]"
        />
      </div>

      {/* ── Grouped applicant tables ── */}
      <div className="mt-6 space-y-8">
        {grouped.length === 0 ? (
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-10 text-center">
            <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
              No applicants match your search or filter.
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <section key={group.job}>
              <h2 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-2">
                {group.job} ({group.applicants.length})
              </h2>

              <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg overflow-hidden">
                <table className={`${components.table} table-fixed`}>
                    <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[18%]" />
                    <col className="w-[22%]" />
                    <col className="w-[20%]" />
                    <col className="w-[18%]" />
                    </colgroup>
                    <thead className={components.tableHeader}>
                    <tr>
                        <th className={components.tableHeaderCell}>Name</th>
                        <th className={components.tableHeaderCell}>Date Applied</th>
                        <th className={components.tableHeaderCell}>Date Moved to Stage</th>
                        <th className={components.tableHeaderCell}>Status</th>
                        <th className={components.tableHeaderCell}>Action</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#132435]">
                    {group.applicants.map((a) => (
                        <tr key={a.id} className={components.tableRow}>
                        <td className={`${components.tableCell} truncate`}>{a.name}</td>
                        <td className={components.tableCellMuted}>{a.dateApplied}</td>
                        <td className={components.tableCellMuted}>{a.dateMoved}</td>
                        <td className={components.tableCell}>
                            <span className={`${components.badge.base} ${STATUS_BADGE[a.stage] ?? components.badge.initial}`}>
                            {a.stage}
                            </span>
                        </td>
                        <td className={components.tableCell}>
                            <Link href={`/admin/applicants/${a.id}`} className="text-[#00bbda] hover:underline">
                            View Profile
                            </Link>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </section>
          ))
        )}
      </div>
    </AdminLayout>
  )
}