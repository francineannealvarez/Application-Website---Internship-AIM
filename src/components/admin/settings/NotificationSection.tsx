'use client'

import React, { useState } from 'react'

export default function NotificationsSection() {
  const [closingSoonAlert, setClosingSoonAlert] = useState(true)
  const [daysBeforeClosing, setDaysBeforeClosing] = useState(3)
  const [newApplicantAlert, setNewApplicantAlert] = useState(true)
  const [emailDigest, setEmailDigest] = useState(false)

  return (
    <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6 max-w-2xl space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-1">
          Notification Preferences
        </h2>
        <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">
          Control what triggers the notification bell.
        </p>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3]">
            Closing-soon job alerts
          </p>
          <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">
            Get notified when a job posting is nearing its closing date.
          </p>
        </div>
        <ToggleSwitch checked={closingSoonAlert} onChange={setClosingSoonAlert} />
      </div>

      {closingSoonAlert && (
        <div className="flex items-center gap-2 pl-1">
          <label className="text-xs text-[#1a2a35] dark:text-[#e2edf3]">Notify</label>
          <select
            value={daysBeforeClosing}
            onChange={(e) => setDaysBeforeClosing(Number(e.target.value))}
            className="text-xs border border-[#e2e8ed] dark:border-[#1e3448] rounded px-2 py-1 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]"
          >
            <option value={1}>1 day</option>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
          </select>
          <span className="text-xs text-[#1a2a35] dark:text-[#e2edf3]">before closing</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 pt-2 border-t border-[#e2e8ed] dark:border-[#1e3448]">
        <div>
          <p className="text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3]">
            New applicant alerts
          </p>
          <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">
            Get notified when someone applies to a job posting.
          </p>
        </div>
        <ToggleSwitch checked={newApplicantAlert} onChange={setNewApplicantAlert} />
      </div>

      <div className="flex items-start justify-between gap-4 pt-2 border-t border-[#e2e8ed] dark:border-[#1e3448]">
        <div>
          <p className="text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3]">
            Daily email digest
          </p>
          <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">
            Receive a daily summary email instead of real-time alerts.
          </p>
        </div>
        <ToggleSwitch checked={emailDigest} onChange={setEmailDigest} />
      </div>

      <button className="px-4 py-2 text-sm font-medium rounded bg-[#00bbda] text-white hover:bg-[#00a5c0] transition-colors">
        Save Preferences
      </button>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-[#00bbda]' : 'bg-[#e2e8ed] dark:bg-[#1e3448]'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}