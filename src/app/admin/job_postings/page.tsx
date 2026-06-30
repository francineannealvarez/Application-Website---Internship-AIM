/**
 * src/app/admin/job_postings/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Job Postings — table of all active job openings.
 * Archived jobs are excluded here (they live in /admin/archives).
 * TODO: Replace PLACEHOLDER_JOBS (from admin-theme.ts) with a real
 * Supabase query, and wire up the Archive button to actually update
 * the job's `archived` flag instead of just being a static button.
 * ─────────────────────────────────────────────────────────────
 */
 
import AdminLayout from '@/components/admin/AdminLayout'
import { components, PLACEHOLDER_JOBS } from '@/lib/admin-theme'
import Link from 'next/link'
 
export default function JobPostingsPage() {
  // Only show non-archived jobs in this main table
  const activeJobs = PLACEHOLDER_JOBS.filter((job) => !job.archived)
 
  return (
    <AdminLayout>
 
      {/* Page header with title + Add New Job button */}
      <div className="flex items-center justify-between">
        <h1 className={components.pageTitle}>Job Postings</h1>
        {/* TODO: this currently links to a placeholder form page since there's no backend yet */}
        <Link href="/admin/job_postings/new" className={components.btnPrimary}>
          + Add New Job Opening
        </Link>
      </div>
      <hr className={components.pageDivider} />
 
      {/* Job postings table */}
      <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg overflow-hidden mt-6">
        <table className={components.table}>
          <thead className={components.tableHeader}>
            <tr>
              <th className={components.tableHeaderCell}>Job Title</th>
              <th className={components.tableHeaderCell}>Date Posted</th>
              <th className={components.tableHeaderCell}>No. of Applicants</th>
              <th className={components.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
 
          <tbody className="bg-white dark:bg-[#132435]">
            {activeJobs.map((job) => (
              <tr key={job.id} className={components.tableRow}>
 
                {/* Job title — clickable, links to the Job Detail page */}
                <td className="p-0">
                  <Link href={`/admin/job_postings/${job.id}`} className={`${components.tableCellLink} block`}>
                    {job.title}
                  </Link>
                </td>
 
                <td className={components.tableCellMuted}>{job.datePosted}</td>
                <td className={components.tableCell}>{job.applicantCount}</td>
 
                {/* Actions: View Applicants + Archive */}
                <td className={components.tableCell}>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/job_postings/${job.id}`}
                      className={components.btnOutlineSm}
                    >
                      View Applicants
                    </Link>
                    {/* TODO: wire this up to actually set job.archived = true in Supabase */}
                    <button className={components.btnNeutralSm}>
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {/* Empty state if all jobs are archived */}
      {activeJobs.length === 0 && (
        <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3] text-center py-12">
          No active job postings. Click &quot;+ Add New Job Opening&quot; to create one.
        </p>
      )}
 
    </AdminLayout>
  )
}