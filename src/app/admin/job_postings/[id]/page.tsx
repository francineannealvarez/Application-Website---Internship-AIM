/**
 * src/app/admin/job_postings/[id]/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Job Detail page — shows one job posting's info plus the list of
 * applicants who applied for it specifically.
 * TODO: Replace PLACEHOLDER_APPLICANTS_FOR_JOB with a real Supabase
 * query filtered by job_posting_id, sorted oldest-applied-first.
 * ─────────────────────────────────────────────────────────────
 */
 
import AdminLayout from '@/components/admin/AdminLayout'
import { components, PLACEHOLDER_JOBS } from '@/lib/admin-theme'
import Link from 'next/link'
import { notFound } from 'next/navigation'
 
// ─── Placeholder applicant data, keyed by job id ────────────────
// TODO: replace with a Supabase query: applications where job_posting_id = id,
// joined with applicant profile info, ordered by date_applied ascending
// (oldest first, per the HR's request).
const PLACEHOLDER_APPLICANTS_FOR_JOB: Record<string, Array<{
  id: string
  name: string
  dateApplied: string
  stage: string
}>> = {
  '1': [
    { id: 'a1', name: 'Paulo Dybala',     dateApplied: '2026-06-02', stage: 'Initial Interview' },
    { id: 'a2', name: 'Maria Clara',      dateApplied: '2026-06-03', stage: 'Applied' },
    { id: 'a3', name: 'Jose Santos',      dateApplied: '2026-06-04', stage: 'Department Interview' },
    { id: 'a4', name: 'Anna Reyes',       dateApplied: '2026-06-05', stage: 'Applied' },
  ],
  '2': [
    { id: 'a5', name: 'Angel Di Maria',   dateApplied: '2026-06-06', stage: 'Department Interview' },
    { id: 'a6', name: 'Carlos Bautista',  dateApplied: '2026-06-07', stage: 'Applied' },
  ],
  '3': [
    { id: 'a7', name: 'Rodrigo De Paul',  dateApplied: '2026-06-11', stage: 'Initial Interview' },
    { id: 'a8', name: 'Liza Mendoza',     dateApplied: '2026-06-12', stage: 'Applied' },
    { id: 'a9', name: 'Mark Villanueva',  dateApplied: '2026-06-13', stage: 'Applied' },
  ],
  '4': [
    { id: 'a10', name: 'Lautaro Martinez',dateApplied: '2026-05-21', stage: 'Initial Interview' },
  ],
}
 
// Maps a stage name to a badge style already defined in admin-theme.ts
function getStageBadgeClass(stage: string) {
  switch (stage) {
    case 'Initial Interview':      return components.badge.initial
    case 'Exam / Assessment':      return components.badge.exam
    case 'Department Interview':   return components.badge.department
    case 'For Onboarding':         return components.badge.onboarding
    default:                       return components.badge.applied
  }
}
 
export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = PLACEHOLDER_JOBS.find((j) => j.id === params.id)
 
  // If someone navigates to a job id that doesn't exist, show Next.js's built-in 404
  if (!job) {
    notFound()
  }
 
  const applicants = PLACEHOLDER_APPLICANTS_FOR_JOB[params.id] ?? []
 
  return (
    <AdminLayout>
 
      {/* Back link + page header */}
      <Link href="/admin/job_postings" className={components.btnGhost}>
        ← Back to Job Postings
      </Link>
 
      <div className="flex items-center justify-between mt-2">
        <h1 className={components.pageTitle}>{job.title}</h1>
      </div>
      <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
        Posted on {job.datePosted}
      </p>
      <hr className={components.pageDivider} />
 
      {/* Job description */}
      <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-5 mt-4">
        <p className={components.sectionLabel}>Job Description</p>
        <p className="text-sm text-[#1a2a35] dark:text-[#e2edf3]">{job.description}</p>
      </div>
 
      {/* Applicants table for this job */}
      <section className="mt-8">
        <p className={components.sectionLabel}>
          Applicants ({applicants.length})
        </p>
 
        <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg overflow-hidden">
          <table className={components.table}>
            <thead className={components.tableHeader}>
              <tr>
                <th className={components.tableHeaderCell}>Name</th>
                <th className={components.tableHeaderCell}>Date Applied</th>
                <th className={components.tableHeaderCell}>Current Stage</th>
                <th className={components.tableHeaderCell}>Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#132435]">
              {/* Sorted oldest-first since data above is already in that order;
                  once real data comes from Supabase, sort by dateApplied ascending there. */}
              {applicants.map((applicant) => (
                <tr key={applicant.id} className={components.tableRow}>
                  <td className={components.tableCell}>{applicant.name}</td>
                  <td className={components.tableCellMuted}>{applicant.dateApplied}</td>
                  <td className={components.tableCell}>
                    <span className={`${components.badge.base} ${getStageBadgeClass(applicant.stage)}`}>
                      {applicant.stage}
                    </span>
                  </td>
                  <td className={components.tableCell}>
                    {/* TODO: link to /admin/applicants/[applicantId] once that page exists */}
                    <Link href="/admin/applicants" className={components.btnOutlineSm}>
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
 
        {applicants.length === 0 && (
          <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3] text-center py-12">
            No applicants yet for this job posting.
          </p>
        )}
      </section>
 
    </AdminLayout>
  )
}
 