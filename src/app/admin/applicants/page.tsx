'use client'

import React, { useState, useMemo } from 'react'
import PageHeader from '@/components/admin/PageHeader'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { components } from '@/lib/admin-theme'

// ─── Mock Data ──────────────────────────────────────────────
// TODO: replace with real data from Supabase once applicants table is wired up.
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
  { id: 11, name: 'Bianca Reyes',     job: 'HR Associate',         dateApplied: '2026-06-01', dateMoved: '2026-06-06', stage: 'Initial Interview',    status: 'rejected' as const },
  { id: 12, name: 'Ramon Flores',     job: 'Accounting Clerk',     dateApplied: '2026-06-08', dateMoved: '2026-06-13', stage: 'Exam / Assessment',     status: 'rejected' as const },
] as const

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

const STATUS_BADGE: Record<string, string> = {
  'Applied':              components.badge.applied,  
  'Initial Interview':    components.badge.initial,
  'Exam / Assessment':    components.badge.exam,
  'Department Interview': components.badge.department,
  'For Onboarding':       components.badge.onboarding,
}

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

function SearchIcon() {
  return (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8fa3b0] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
    </svg>
  )
}

export default function ApplicantsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [jobFilter, setJobFilter] = useState<string>('All Job Postings')
  const [search, setSearch] = useState('') // ✅ FIX: single source of truth for search

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  function toggleGroup(job: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(job)) next.delete(job)
      else next.add(job)
      return next
    })
  }

  const jobTitles = useMemo(
    () => Array.from(new Set(MOCK_APPLICANTS.map((a) => a.job))),
    []
  )

  const activeApplicants = useMemo(
    () => MOCK_APPLICANTS.filter((a) => a.status === 'active'),
    []
  )

  const rejectedApplicants = useMemo(
    () => MOCK_APPLICANTS.filter((a) => a.status === 'rejected'),
    []
  )

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: activeApplicants.length }
    for (const tab of TABS.slice(1, -1)) {
      counts[tab] = activeApplicants.filter((a) => a.stage === tab).length
    }
    counts['Rejected'] = rejectedApplicants.length
    return counts
  }, [activeApplicants, rejectedApplicants])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()

    const basePool = activeTab === 'Rejected' ? rejectedApplicants : activeApplicants

    return basePool.filter((a) => {
      const matchesStage = activeTab === 'All' || activeTab === 'Rejected' || a.stage === activeTab
      const matchesJob = jobFilter === 'All Job Postings' || a.job === jobFilter
      // ✅ FIX: search na lang sa name, hindi na kasama yung job title
      const matchesSearch = q === '' || a.name.toLowerCase().includes(q)
      return matchesStage && matchesJob && matchesSearch
    })
  }, [activeTab, jobFilter, search, activeApplicants, rejectedApplicants])

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
    return groups.sort((a, b) => a.job.localeCompare(b.job))
  }, [filtered])

  const isRejectedView = activeTab === 'Rejected'

  return (
    <AdminLayout>
      <PageHeader title="Applicants Pipeline" />

      {/* ── Tabs: pipeline stages + Rejected ── */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
      {TABS.map((tab) => {
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
                  : `px-4 py-2 rounded-full text-sm font-medium bg-[#f4f7f9] dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] whitespace-nowrap transition-colors ${
                      isRejectedTab
                        ? 'ml-3 text-[#e05252] hover:border-[#e05252]'
                        : 'text-[#1a2a35] dark:text-[#e2edf3] hover:border-[#00bbda] hover:text-[#00bbda]'
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

        {/* ✅ flex-1 para kunin niya yung natitirang space — mahaba ulit tulad ng dati */}
        <div className="relative flex-1">
          <SearchIcon />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or job posting..."
            className={`${components.searchInput} pl-9 w-full`}
          />
        </div>
      </div>

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
            // ✅ FIX: lahat ng group collapsible na, kahit 1 lang applicant
            const isCollapsed = collapsedGroups.has(group.job)

            return (
              <section key={group.job}>
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
                              {isRejectedView ? a.stage : a.dateMoved}
                            </td>
                            <td className={components.tableCell}>
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