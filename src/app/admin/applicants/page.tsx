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
] as const
 
type Tab = typeof TABS[number]
 
const STATUS_BADGE: Record<string, string> = {
  'Applied':              components.badge.applied,  
  'Initial Interview':    components.badge.initial,
  'Exam / Assessment':    components.badge.exam,
  'Department Interview': components.badge.department,
  'For Onboarding':       components.badge.onboarding,
}
 
// ─── Tab icons — same visual language as the Archive page ──────
function AllIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
function AppliedIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h1M7 4h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2z" />
    </svg>
  )
}
function InterviewIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}
function ExamIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 012-2z" />
    </svg>
  )
}
function DepartmentIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4a4 4 0 11-4-4 4 4 0 014 4zm7 4a4 4 0 10-4-4" />
    </svg>
  )
}
function OnboardingIcon({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
 
const TAB_ICONS: Record<Tab, (props: { className: string }) => React.ReactElement> = {
  'All': AllIcon,
  'Applied': AppliedIcon,
  'Initial Interview': InterviewIcon,
  'Exam / Assessment': ExamIcon,
  'Department Interview': DepartmentIcon,
  'For Onboarding': OnboardingIcon,
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
 
// Local override: same label style as components.tableHeader, but white
// background instead of gray — keeps the "one continuous sheet of paper"
// feel from the active folder tab all the way down to the table rows.
const theadClass = 'bg-white dark:bg-[#132435] text-xs font-semibold tracking-wider text-[#8fa3b0] uppercase border-b border-[#e2e8ed] dark:border-[#1e3448]'
 
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
 
  const jobTitles = useMemo(
    () => Array.from(new Set(MOCK_APPLICANTS.map((a) => a.job))),
    []
  )
 
  const activeApplicants = useMemo(
    () => MOCK_APPLICANTS.filter((a) => a.status === 'active'),
    []
  )
 
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: activeApplicants.length }
    for (const tab of TABS.slice(1)) {
      counts[tab] = activeApplicants.filter((a) => a.stage === tab).length
    }
    return counts
  }, [activeApplicants])
 
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
 
    return activeApplicants.filter((a) => {
      const matchesStage = activeTab === 'All' || a.stage === activeTab
      const matchesJob = jobFilter === 'All Job Postings' || a.job === jobFilter
      const matchesSearch = q === '' || a.name.toLowerCase().includes(q)
      return matchesStage && matchesJob && matchesSearch
    })
  }, [activeTab, jobFilter, search, activeApplicants])
 
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
 
  return (
    <AdminLayout>
      <PageHeader title="Applicants Pipeline" />
 
      {/* ── Filter row: job posting dropdown + search — now sits ABOVE the tabs ── */}
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
 
      {/* ── Folder-style tabs — same pattern as Archive page.
          Horizontally scrollable since there are several tabs total. ── */}
      <div className="flex items-end gap-1 mt-5 overflow-x-auto">
        {TABS.map((tab) => {
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
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00bbda]' : 'text-[#7a94a0] dark:text-[#6b8fa3]'}`} />
              {tab}
              <span className={isActive ? 'text-[#00bbda]/70' : 'text-[#7a94a0]/70 dark:text-[#6b8fa3]/70'}>
                [{tabCounts[tab]}]
              </span>
            </button>
          )
        })}
      </div>
 
      {/* ── Panel — same white as the active tab, no visible seam between them ── */}
      <div className="-mt-px border border-[#e2e8ed] dark:border-[#1e3448] rounded-b-xl rounded-tr-xl bg-white dark:bg-[#132435] shadow-sm overflow-hidden p-6">
 
        {/* ── Grouped applicant tables ── */}
        <div className="space-y-8">
          {grouped.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
                No applicants match your search or filter.
              </p>
            </div>
          ) : (
            grouped.map((group) => {
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
                  )}
                </section>
              )
            })
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
 