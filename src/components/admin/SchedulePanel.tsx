'use client'
 
/**
 * SchedulePanel.tsx
 * ─────────────────────────────────────────────────────────────
 * Compact dashboard widget showing today's scheduled interviews,
 * grouped into two tabs: Initial Interview and Department Interview.
 *
 * This is a SMALL fixed-width card (~340px), not a second sidebar —
 * it sits to the right of the main dashboard content.
 *
 * TODO: Replace PLACEHOLDER_INTERVIEWS with real data once the
 * Applicants table + interview scheduling exists in Supabase.
 * The date strip is currently visual-only — clicking a date doesn't
 * filter the list yet since there's no real per-date data to filter.
 * ─────────────────────────────────────────────────────────────
 */
 
import { useState } from 'react'
import Link from 'next/link'
import { schedule } from '@/lib/admin-theme'
 
// ─── Placeholder Data ─────────────────────────────────────────
// TODO: fetch from Supabase — interviews scheduled for the selected date,
// joined with applicant name + job title.
type InterviewTab = 'Initial Interview' | 'Department Interview'
 
const PLACEHOLDER_INTERVIEWS: Record<InterviewTab, Array<{
  id: number
  time: string
  name: string
  jobTitle: string
  initials: string
}>> = {
  'Initial Interview': [
    { id: 1, time: '09:00 AM', name: 'Paulo Dybala',     jobTitle: 'HR Associate',         initials: 'PD' },
    { id: 2, time: '10:30 AM', name: 'Rodrigo De Paul',  jobTitle: 'Accounting Clerk',     initials: 'RD' },
    { id: 3, time: '01:00 PM', name: 'Lautaro Martinez', jobTitle: 'IT Support Specialist',initials: 'LM' },
  ],
  'Department Interview': [
    { id: 4, time: '11:00 AM', name: 'Angel Di Maria',   jobTitle: 'Operations Manager',   initials: 'AD' },
  ],
}
 
// ─── Helpers ──────────────────────────────────────────────────
// Builds a small 5-day strip centered on "today" for visual date browsing.
function getDateStrip(centerDate: Date) {
  const days = []
  for (let offset = -2; offset <= 2; offset++) {
    const d = new Date(centerDate)
    d.setDate(centerDate.getDate() + offset)
    days.push(d)
  }
  return days
}
 
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
 
// ─── Component ────────────────────────────────────────────────
export default function SchedulePanel() {
  // Centered on today by default — HR sees who needs interviewing right now.
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<InterviewTab>('Initial Interview')
 
  const dateStrip = getDateStrip(selectedDate)
  const currentList = PLACEHOLDER_INTERVIEWS[activeTab]
 
  // Shift the visible date strip by one day in either direction
  const shiftDate = (days: number) => {
    const next = new Date(selectedDate)
    next.setDate(selectedDate.getDate() + days)
    setSelectedDate(next)
  }
 
  return (
    <aside className={schedule.panelWrapper}>
 
      {/* Header */}
      <div className={schedule.panelHeader}>
        <h2 className={schedule.panelTitle}>Schedule</h2>
        {/* TODO: point this to the Applicants Pipeline filtered by today's date */}
        <Link href="/admin/applicants" className={schedule.seeAllLink}>
          See All
        </Link>
      </div>
 
      {/* Month label + nav */}
      <div className={schedule.monthNavRow}>
        <button className={schedule.monthNavBtn} onClick={() => shiftDate(-30)} aria-label="Previous month">
          ←
        </button>
        <span className={schedule.monthLabel}>
          {MONTH_LABELS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </span>
        <button className={schedule.monthNavBtn} onClick={() => shiftDate(30)} aria-label="Next month">
          →
        </button>
      </div>
 
      {/* Date strip */}
      <div className={schedule.dateStripRow}>
        <button className={schedule.dateStripArrow} onClick={() => shiftDate(-1)} aria-label="Previous day">
          ←
        </button>
 
        {dateStrip.map((d) => {
          const isSelected = d.toDateString() === selectedDate.toDateString()
          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelectedDate(d)}
              className={isSelected ? schedule.dateButtonActive : schedule.dateButton}
            >
              <span className={schedule.dateNum}>{String(d.getDate()).padStart(2, '0')}</span>
              <span className={schedule.dateDay}>{DAY_LABELS[d.getDay()]}</span>
            </button>
          )
        })}
 
        <button className={schedule.dateStripArrow} onClick={() => shiftDate(1)} aria-label="Next day">
          →
        </button>
      </div>
 
      {/* Tabs — Initial Interview / Department Interview */}
      <div className={schedule.tabRow}>
        {(['Initial Interview', 'Department Interview'] as InterviewTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? schedule.tabActive : schedule.tab}
          >
            {tab}
            <span className={schedule.tabCount}>
              {PLACEHOLDER_INTERVIEWS[tab].length}
            </span>
          </button>
        ))}
      </div>
 
      {/* Interview list for the active tab */}
      {currentList.length === 0 ? (
        <p className={schedule.emptyState}>No interviews scheduled for this day.</p>
      ) : (
        <div>
          {currentList.map((item) => (
            <div key={item.id}>
              <p className={schedule.timeLabel}>{item.time}</p>
              <div className={schedule.interviewCard}>
                <div className="flex items-start gap-2.5">
                  {/* Avatar with initials — swap for real photo later */}
                  <div className={schedule.applicantAvatar}>{item.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className={schedule.applicantName}>{item.name}</p>
                    <p className={schedule.applicantRole}>{item.jobTitle}</p>
                  </div>
                </div>
                {/* Links to the applicant's profile instead of a "meeting" since there's no video-call integration */}
                <Link href="/admin/applicants" className={schedule.goToProfileBtn}>
                  Go to Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}