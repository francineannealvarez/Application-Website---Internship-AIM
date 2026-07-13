'use client'

/**
 * src/app/admin/job_postings/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Job Postings — table of all active job openings.
 *
 * Features:
 * - Status badge (Open/Closed) — computed from `deadline`, not stored.
 * - Live search/filter by job title (case-insensitive substring).
 * - Sortable columns: Date Posted, No. of Applicants. Open jobs are
 *   ALWAYS shown above Closed jobs regardless of sort direction.
 * - Deadline column ("No deadline" if null).
 * - Pale-red row highlight for jobs closing within 7 days with 0 applicants.
 * - Bulk select + bulk archive (UI-only for now).
 *
 * TODO: Replace PLACEHOLDER_JOBS (from admin-theme.ts) with a real
 * Supabase/Prisma query, and wire up the Archive / Bulk Archive buttons.
 * ─────────────────────────────────────────────────────────────
 */

import { useMemo, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import PageHeader from '@/components/admin/PageHeader'
import JobFormPanel from '@/components/admin/JobFormPanel'
import {
  components,
  PLACEHOLDER_JOBS,
  getJobStatus,
  getDaysUntilDeadline,
  isClosingSoonWithNoApplicants,
  type PlaceholderJob,
} from '@/lib/admin-theme'
import Link from 'next/link'

type SortKey = 'datePosted' | 'applicantCount'
type SortDirection = 'asc' | 'desc'

function SearchIcon() {
  return (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8fa3b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
    </svg>
  )
}

function SortArrow({ direction }: { direction: SortDirection }) {
  return <span className="text-[10px]">{direction === 'asc' ? '▲' : '▼'}</span>
}

export default function JobPostingsPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // ── Filter (not-archived + search by title, case-insensitive) ──
  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return PLACEHOLDER_JOBS.filter((job) => !job.archived).filter((job) =>
      query === '' ? true : job.title.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // ── Sort helper: applied separately within each status group ──
  function sortGroup(jobs: PlaceholderJob[]): PlaceholderJob[] {
    if (!sortKey) return jobs
    return [...jobs].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'datePosted') {
        cmp = new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime()
      } else if (sortKey === 'applicantCount') {
        cmp = a.applicantCount - b.applicantCount
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }

  // ── Open jobs always on top, Closed jobs always below ──
  const displayedJobs = useMemo(() => {
    const open = filteredJobs.filter((job) => getJobStatus(job.deadline) === 'open')
    const closed = filteredJobs.filter((job) => getJobStatus(job.deadline) === 'closed')
    return [...sortGroup(open), ...sortGroup(closed)]
  }, [filteredJobs, sortKey, sortDirection])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('desc') // default: recent-first / highest-first
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === displayedJobs.length ? new Set() : new Set(displayedJobs.map((job) => job.id))
    )
  }

  function handleBulkArchive() {
    // TODO: replace with real Supabase update:
    //   UPDATE job_postings SET archived = true WHERE id IN [...selectedIds]
    alert(`Archiving ${selectedIds.size} job posting(s)... (placeholder — wire this to Supabase)`)
    setSelectedIds(new Set())
    setIsSelectMode(false)
  }

  function exitSelectMode() {
    setIsSelectMode(false)
    setSelectedIds(new Set())
  }

  return (
    <AdminLayout>

      {/* Shared top nav row — title + notif bell + refresh + divider */}
      <PageHeader title="Job Postings" />

      {/* Search bar (left) + Add New / Select Multiple actions (right) */}
      <div className="flex items-center justify-between gap-4 mt-4">

        <div className="relative w-full max-w-xs">
          <SearchIcon />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job title..."
            className={components.searchInput}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSelectMode ? (
            <>
              <span className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3] mr-1">
                {selectedIds.size} selected
              </span>
              <button onClick={toggleSelectAll} className={components.btnNeutral}>
                {selectedIds.size === displayedJobs.length && displayedJobs.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleBulkArchive}
                disabled={selectedIds.size === 0}
                className={`${components.btnDanger} ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Archive Selected
              </button>
              <button onClick={exitSelectMode} className={components.btnGhost}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsSelectMode(true)} className={components.btnNeutral}>
                Select Multiple
              </button>
              <button onClick={() => setIsPanelOpen(true)} className={components.btnPrimary}>
                + Add New Job Opening
              </button>
            </>
          )}
        </div>
      </div>

      {/* Job postings table */}
      <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg overflow-hidden mt-4">
        <table className={components.table}>
          <thead className={components.tableHeader}>
            <tr>
              {isSelectMode && <th className={`${components.tableHeaderCell} w-10`}></th>}
              <th className={components.tableHeaderCell}>Job Title</th>
              <th className={components.tableHeaderCell}>Status</th>
              <th className={components.tableHeaderCell}>
                <button onClick={() => handleSort('datePosted')} className={components.sortableHeader}>
                  Date Posted
                  {sortKey === 'datePosted' && <SortArrow direction={sortDirection} />}
                </button>
              </th>
              <th className={components.tableHeaderCell}>Deadline</th>
              <th className={components.tableHeaderCell}>
                <button onClick={() => handleSort('applicantCount')} className={components.sortableHeader}>
                  No. of Applicants
                  {sortKey === 'applicantCount' && <SortArrow direction={sortDirection} />}
                </button>
              </th>
              <th className={components.tableHeaderCell}>Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-[#132435]">
            {displayedJobs.map((job) => {
              const status = getJobStatus(job.deadline)
              const daysLeft = getDaysUntilDeadline(job.deadline)
              const isWarning = isClosingSoonWithNoApplicants(job)
              const rowClass = isWarning ? components.tableRowWarning : components.tableRow

              return (
                <tr key={job.id} className={rowClass}>

                  {isSelectMode && (
                    <td className={components.tableCell}>
                      <input
                        type="checkbox"
                        className={components.checkbox}
                        checked={selectedIds.has(job.id)}
                        onChange={() => toggleSelect(job.id)}
                        aria-label={`Select ${job.title}`}
                      />
                    </td>
                  )}

                  <td className="p-0">
                    <Link href={`/admin/job_postings/${job.id}`} className={`${components.tableCellLink} block`}>
                      {job.title}
                    </Link>
                  </td>

                  <td className={components.tableCell}>
                    <span className={`${components.badge.base} ${status === 'open' ? components.badge.open : components.badge.closed}`}>
                      {status === 'open' ? 'Open' : 'Closed'}
                    </span>
                  </td>

                  <td className={components.tableCellMuted}>{job.datePosted}</td>

                  <td className={components.tableCellMuted}>
                    {job.deadline ?? 'No deadline'}
                    {isWarning && daysLeft !== null && (
                      <span className="ml-2 text-[#e05252] font-medium">
                        ({daysLeft === 0 ? 'today' : `${daysLeft}d left`})
                      </span>
                    )}
                  </td>

                  <td className={components.tableCell}>{job.applicantCount}</td>

                  <td className={components.tableCell}>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/job_postings/${job.id}`}
                        className={components.btnOutlineSm}
                      >
                        View Applicants
                      </Link>
                      <button className={components.btnNeutralSm}>
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Empty states */}
      {displayedJobs.length === 0 && searchQuery.trim() !== '' && (
        <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3] text-center py-12">
          No job postings match &quot;{searchQuery}&quot;.
        </p>
      )}
      {displayedJobs.length === 0 && searchQuery.trim() === '' && (
        <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3] text-center py-12">
          No active job postings. Click &quot;+ Add New Job Opening&quot; to create one.
        </p>
      )}

      {/* Slide-in panel for adding a new job */}
      <JobFormPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

    </AdminLayout>
  )
}