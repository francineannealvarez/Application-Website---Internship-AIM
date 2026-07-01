'use client'

/**
 * JobFormPanel.tsx
 * ─────────────────────────────────────────────────────────────
 * Slide-in drawer (from the right) for adding a new job opening.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { panel } from '@/lib/admin-theme'

const inputStyle =
  'w-full border border-[#e2e8ed] dark:border-[#1e3448] bg-white dark:bg-[#0d1f2d] text-[#1a2a35] dark:text-[#e2edf3] text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00bbda]'
const labelStyle =
  'block text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1.5'
const helperStyle =
  'text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-1.5'

interface JobFormPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function JobFormPanel({ isOpen, onClose }: JobFormPanelProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      })
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  if (!shouldRender) return null

  return (
    <>
      <div
        className={panel.backdrop(isVisible)}
        onClick={onClose}
      />

      <div
        className={panel.drawer(isVisible)}
        onTransitionEnd={() => {
          if (!isOpen) setShouldRender(false)
        }}
      >
        <div className={panel.header}>
          <h2 className={panel.headerTitle}>+ Add New Job Opening</h2>
          <button onClick={onClose} className={panel.closeBtn} aria-label="Close">
            ✕
          </button>
        </div>

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

            {/* ⬅️ ADDED — Application Deadline (optional). Leaving this blank
                means the job has no deadline and stays "Open" indefinitely,
                since status is computed from this field, not stored separately. */}
            <div>
              <label className={labelStyle}>Application Deadline</label>
              <input type="date" className={inputStyle} />
              <p className={helperStyle}>
                Leave blank if this posting has no deadline (it will stay Open indefinitely).
              </p>
            </div>
          </form>
        </div>

        <div className={panel.footer}>
          <button
            type="submit"
            form="new-job-form"
            className="bg-[#00bbda] hover:bg-[#00a3bf] text-white text-sm font-medium px-5 py-2 rounded transition-colors"
            onClick={(e) => {
              e.preventDefault()
              // TODO: read form values (including deadline) and insert into Supabase
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