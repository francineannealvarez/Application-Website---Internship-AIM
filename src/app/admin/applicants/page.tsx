'use client'

import React, { useState, useMemo } from 'react'
import PageHeader from '@/components/admin/PageHeader'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { components } from '@/lib/admin-theme'

// ─── Mock Data ──────────────────────────────────────────────
// TODO: replace with real data from Supabase once applicants table is wired up.
// ⬅️ ADDED: `status` field — 'active' or 'rejected'. `stage` is kept as-is
// even for rejected applicants, so HR can still see WHERE in the pipeline
// they were rejected (e.g. rejected during "Initial Interview").
const MOCK_APPLICANTS = [
  { id: 1,  name: 'Maria Santos',     job: 'HR Associate',         dateApplied: '2026-06-02', dateMoved: '2026-06-30', stage: 'Initial Interview',    status: 'active' as const },
  { id: 2,  name: 'Jose Reyes',       job: 'HR Associate',         dateApplied: '2026-06-03', dateMoved: '2026-06-05', stage: 'Applied',               status: 'active' as const },
  { id: 3,  name: 'Ana Dela Cruz',    job: 'HR Associate',         dateApplied: '2026-06-04', dateMoved: '2026-06-09', stage: 'Exam / Assessment',     status: 'active' as const },
  { id: 4,  name: 'Roberto Lim',      job: 'HR Associate',         dateApplied: '2026-06-05', dateMoved: '2026-06-22', stage: 'For Onboarding',        status: 'active' as const },
  { id: 5,  name: 'Carmen Villanueva',job: 'Operations Manager',   dateApplied: '2026-06-06', dateMoved: '2026-06-08', stage: 'Initial Interview',    status: 'active' as const },
  { id: 6,  name: 'Eduardo Torres',   job: 'Operations Manager',   dateApplied: '2026-06-07', dateMoved: '2026-06-12', stage: 'Department Interview', status: 'active' as const },
  { id: 7,  name: 'Liza Ramos',       job: 'Accounting Clerk',     dateApplied: '2026-06-08', dateMoved: '2026-06-10', stage: 'Initial Interview',    status: 'active' as const },
  { id: 8,  name: 'Paolo Garcia',     job: 'Accounting Clerk',     dateApplied: '2026-06-09', dateMoved: '2026-06-11', stage: 'Exam / Assessment',     status: 'active' as const },
  { id: 9,  name: 'Tina Cruz',        job: 'Accounting Clerk',     dateApplied: '2026-06-10', dateMoved: '2026-06-14', stage: 'Initial Interview',    status: 'active' as const },
  { id: 10, name: 'Mark Aquino',      job: 'IT Support Specialist',dateApplied: '2026-06-11', dateMoved: '2026-06-28', stage: 'For Onboarding',        status: 'active' as const },
  // ⬅️ ADDED — sample rejected applicants, for testing the Rejected tab
  { id: 11, name: 'Bianca Reyes',     job: 'HR Associate',         dateApplied: '2026-06-01', dateMoved: '2026-06-06', stage: 'Initial Interview',    status: 'rejected' as const },
  { id: 12, name: 'Ramon Flores',     job: 'Accounting Clerk',     dateApplied: '2026-06-08', dateMoved: '2026-06-13', stage: 'Exam / Assessment',     status: 'rejected' as const },
] as const

// ⬅️ CHANGED: 'Rejected' added at the end. This is a status filter, not a
// pipeline stage — selecting it switches the view to rejected applicants
// only, and is handled separately from the stage-matching logic below.
const TABS = [
  'All',
  'Applied',
  'Initial Interview',
  'Exam / Assessment',
  'Department Interview',
  'For Onboarding',
  'Rejected',
] as const

type Tab = typeof TABS[number]

// Map stage names to existing badge styles from admin-theme
const STATUS_BADGE: Record<string, string> = {
  'Applied':              components.badge.applied,  
  'Initial Interview':    components.badge.initial,
  'Exam / Assessment':    components.badge.exam,
  'Department Interview': components.badge.department,
  'For Onboarding':       components.badge.onboarding,
}

// ⬅️ ADDED — small chevron icon used on the collapsible group header.
// Rotates via CSS transition when expanded/collapsed.
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[#8fa3b0] transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function ApplicantsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [jobFilter, setJobFilter] = useState<string>('All Job Postings')
  const [search, setSearch] = useState('')

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  function toggleGroup(job: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(job)) next.delete(job)
      else next.add(job)
      return next
    })
  }

  // Unique job titles, for the dropdown filter
  const jobTitles = useMemo(
    () => Array.from(new Set(MOCK_APPLICANTS.map((a) => a.job))),
    []
  )

  // ⬅️ CHANGED — active-only applicants (excludes rejected). This is the
  // pool used for "All" and every pipeline-stage tab/count.
  const activeApplicants = useMemo(
    () => MOCK_APPLICANTS.filter((a) => a.status === 'active'),
    []
  )

  // ⬅️ CHANGED — rejected-only applicants. Separate pool, only shown
  // when the "Rejected" tab is active.
  const rejectedApplicants = useMemo(
    () => MOCK_APPLICANTS.filter((a) => a.status === 'rejected'),
    []
  )

  // Tab counts — "All" and stage tabs count active applicants only;
  // "Rejected" counts the rejected pool. Based on full dataset (not the
  // currently filtered list) so numbers stay stable while filtering/searching.
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: activeApplicants.length }
    for (const tab of TABS.slice(1, -1)) {
      counts[tab] = activeApplicants.filter((a) => a.stage === tab).length
    }
    counts['Rejected'] = rejectedApplicants.length
    return counts
  }, [activeApplicants, rejectedApplicants])

  // Apply tab + job dropdown + search (case-insensitive, matches name or job)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    // ⬅️ CHANGED — pick the base pool depending on the active tab:
    // "Rejected" pulls from rejectedApplicants; everything else pulls
    // from activeApplicants only, so rejected applicants never leak
    // into "All" or any pipeline-stage tab.
    const basePool = activeTab === 'Rejected' ? rejectedApplicants : activeApplicants

    return basePool.filter((a) => {
      const matchesStage = activeTab === 'All' || activeTab === 'Rejected' || a.stage === activeTab
      const matchesJob = jobFilter === 'All Job Postings' || a.job === jobFilter
      const matchesSearch =
        q === '' ||
        a.name.toLowerCase().includes(q) ||
        a.job.toLowerCase().includes(q)
      return matchesStage && matchesJob && matchesSearch
    })
  }, [activeTab, jobFilter, search, activeApplicants, rejectedApplicants])

  // Group filtered results by job title, in first-seen order
  const grouped = useMemo(() => {
    const groups: { job: string; applicants: typeof filtered }[] = []
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

  const isRejectedView = activeTab === 'Rejected'

  return (
    <AdminLayout>
      <PageHeader title="Applicants Pipeline" />

      {/* ── Tabs: pipeline stages + Rejected ── */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
      {TABS.map((tab) => {
          // ⬅️ ADDED — visually separate "Rejected" from the pipeline tabs
          // with a small left margin + divider, since it's a different
          // kind of filter (status, not stage).
          const isRejectedTab = tab === 'Rejected'
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                isActive
                  ? `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      isRejectedTab ? 'bg-[#e05252] text-white' : 'bg-[#00bbda] text-white'
                    } ${isRejectedTab ? 'ml-3' : ''}`
                  : `px-4 py-2 rounded-full text-sm font-medium bg-[#f4f7f9] dark:bg-[#132435] text-[#1a2a35] dark:text-[#e2edf3] border border-[#e2e8ed] dark:border-[#1e3448] whitespace-nowrap transition-colors ${
                      isRejectedTab
                        ? 'ml-3 hover:border-[#e05252] hover:text-[#e05252]'
                        : 'hover:border-[#00bbda] hover:text-[#00bbda]'
                    }`
              }
            >
              {tab} [{tabCounts[tab]}]
            </button>
          )
      })}
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

      {/* ⬅️ ADDED — small context banner when viewing the Rejected tab,
          so it's clear this is a separate, read-only-ish record list. */}
      {isRejectedView && (
        <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-3">
          Showing rejected applicants only. These are excluded from &quot;All&quot; and the pipeline stage tabs.
        </p>
      )}

      {/* ── Grouped applicant tables ── */}
      <div className="mt-6 space-y-8">
        {grouped.length === 0 ? (
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-10 text-center">
            <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
              {isRejectedView
                ? 'No rejected applicants match your search or filter.'
                : 'No applicants match your search or filter.'}
            </p>
          </div>
        ) : (
          grouped.map((group) => {
            const isCollapsible = group.applicants.length > 1
            const isCollapsed = isCollapsible && collapsedGroups.has(group.job)

            return (
              <section key={group.job}>
                {isCollapsible ? (
                  <button
                    onClick={() => toggleGroup(group.job)}
                    className="flex items-center gap-2 mb-2 group/header"
                    aria-expanded={!isCollapsed}
                  >
                    <ChevronIcon expanded={!isCollapsed} />
                    <h2 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] group-hover/header:text-[#00bbda] transition-colors">
                      {group.job} ({group.applicants.length})
                    </h2>
                  </button>
                ) : (
                  <h2 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-2 pl-6">
                    {group.job} ({group.applicants.length})
                  </h2>
                )}

                {!isCollapsed && (
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
                            <th className={components.tableHeaderCell}>
                              {/* ⬅️ CHANGED — label reflects context: last active stage vs. date moved */}
                              {isRejectedView ? 'Rejected At Stage' : 'Date Moved to Stage'}
                            </th>
                            <th className={components.tableHeaderCell}>Status</th>
                            <th className={components.tableHeaderCell}>Action</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#132435]">
                        {group.applicants.map((a) => (
                            <tr key={a.id} className={components.tableRow}>
                            <td className={`${components.tableCell} truncate`}>{a.name}</td>
                            <td className={components.tableCellMuted}>{a.dateApplied}</td>
                            <td className={components.tableCellMuted}>
                              {/* ⬅️ CHANGED — rejected view shows the stage name instead of a date,
                                  since that's the more useful info here (where they got rejected) */}
                              {isRejectedView ? a.stage : a.dateMoved}
                            </td>
                            <td className={components.tableCell}>
                                {/* ⬅️ CHANGED — rejected rows always show the red "Rejected" badge,
                                    regardless of what stage they were on */}
                                <span className={`${components.badge.base} ${isRejectedView ? components.badge.rejected : (STATUS_BADGE[a.stage] ?? components.badge.initial)}`}>
                                {isRejectedView ? 'Rejected' : a.stage}
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
                )}
              </section>
            )
          })
        )}
      </div>
    </AdminLayout>
  )
}