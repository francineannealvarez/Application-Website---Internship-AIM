'use client'
 
/**
 * JobFormPanel.tsx
 * ─────────────────────────────────────────────────────────────
 * Slide-in drawer (from the right) for adding a new job opening.
 * Replaces the old /admin/job_postings/new full page — this opens
 * inline over the Job Postings list instead, triggered by the
 * "+ Add New Job Opening" button.
 *
 * The header here uses the SAME solid blue as the trigger button so
 * it visually reads as one continuous shape, not a separate popup.
 *
 * TODO: wire up form submission to insert into the `job_postings`
 * table once the backend is ready. Currently UI-only.
 * ─────────────────────────────────────────────────────────────
 */
 
import { panel } from '@/lib/admin-theme'
 
const inputStyle =
  'w-full border border-[#e2e8ed] dark:border-[#1e3448] bg-white dark:bg-[#0d1f2d] text-[#1a2a35] dark:text-[#e2edf3] text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bbda]'
const labelStyle =
  'block text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1.5'
 
interface JobFormPanelProps {
  isOpen: boolean
  onClose: () => void
}
 
export default function JobFormPanel({ isOpen, onClose }: JobFormPanelProps) {
  // Don't render anything at all when closed — keeps the DOM clean
  // and avoids the panel intercepting clicks while hidden.
  if (!isOpen) return null
 
  return (
    <>
      {/* Backdrop — clicking it closes the panel */}
      <div className={panel.backdrop} onClick={onClose} />
 
      {/* Sliding drawer */}
      <div className={panel.drawer}>
 
        {/* Header — same blue as the "+ Add New Job Opening" button,
            so it reads as a continuation of that button rather than
            a disconnected modal. */}
        <div className={panel.header}>
          <h2 className={panel.headerTitle}>+ Add New Job Opening</h2>
          <button onClick={onClose} className={panel.closeBtn} aria-label="Close">
            ✕
          </button>
        </div>
 
        {/* Form body */}
        <div className={panel.body}>
          <form className="space-y-5" id="new-job-form">
 
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
                rows={6}
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
 
          </form>
        </div>
 
        {/* Footer actions — sticky at the bottom of the panel */}
        <div className={panel.footer}>
          {/* TODO: disabled until backend submission is wired up */}
          <button
            type="submit"
            form="new-job-form"
            className="bg-[#00bbda] hover:bg-[#00a3bf] text-white text-sm font-medium px-5 py-2 rounded transition-colors"
            onClick={(e) => {
              // Prevent actual form submission for now since there's no backend yet
              e.preventDefault()
            }}
          >
            Post Job Opening
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#cbd5dd] dark:border-[#2a4256] text-[#1a2a35] dark:text-[#e2edf3] hover:bg-[#f4f7f9] dark:hover:bg-[#1e3448] text-sm font-medium px-5 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
 
      </div>
    </>
  )
}