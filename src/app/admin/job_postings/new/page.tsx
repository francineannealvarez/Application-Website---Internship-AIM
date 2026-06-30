/**
 * src/app/admin/job_postings/new/page.tsx
 * ─────────────────────────────────────────────────────────────
 * Placeholder "Add New Job Opening" form.
 * UI only — no submit logic yet since there's no backend.
 * TODO: wire up form submission to insert into the `job_postings`
 * table in Supabase once the backend is ready.
 * ─────────────────────────────────────────────────────────────
 */
 
import AdminLayout from '@/components/admin/AdminLayout'
import { components } from '@/lib/admin-theme'
import Link from 'next/link'
 
// Shared input styling so every field looks consistent.
// Kept local to this file for now — move to admin-theme.ts if other
// forms (e.g. Forms & Documents) need the same input style later.
const inputStyle =
  'w-full border border-[#e2e8ed] dark:border-[#1e3448] bg-white dark:bg-[#132435] text-[#1a2a35] dark:text-[#e2edf3] text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bbda]'
const labelStyle =
  'block text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1.5'
 
export default function NewJobPostingPage() {
  return (
    <AdminLayout>
 
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className={components.pageTitle}>Add New Job Opening</h1>
        <Link href="/admin/job_postings" className={components.btnGhost}>
          ← Back to Job Postings
        </Link>
      </div>
      <hr className={components.pageDivider} />
 
      {/* Form card */}
      <div className="max-w-2xl bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6 mt-6">
        <form className="space-y-5">
 
          <div>
            <label className={labelStyle}>Job Title</label>
            <input type="text" placeholder="e.g. HR Associate" className={inputStyle} />
          </div>
 
          <div>
            <label className={labelStyle}>Department</label>
            <input type="text" placeholder="e.g. Human Resources" className={inputStyle} />
          </div>
 
          <div>
            <label className={labelStyle}>Job Description</label>
            <textarea
              rows={5}
              placeholder="Describe the role, responsibilities, and qualifications..."
              className={inputStyle}
            />
          </div>
 
          <div>
            <label className={labelStyle}>Employment Type</label>
            <select className={inputStyle}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contractual</option>
              <option>Internship</option>
            </select>
          </div>
 
          {/* Form actions */}
          <div className="flex gap-3 pt-2">
            {/* TODO: disabled until backend submission is wired up */}
            <button type="button" className={components.btnPrimary}>
              Post Job Opening
            </button>
            <Link href="/admin/job_postings" className={components.btnNeutral}>
              Cancel
            </Link>
          </div>
 
        </form>
      </div>
 
    </AdminLayout>
  )
}
 