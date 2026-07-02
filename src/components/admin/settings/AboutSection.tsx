'use client'

import React from 'react'

export default function AboutSection() {
  return (
    <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6 max-w-2xl space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-1">
          About This System
        </h2>
        <p className="text-sm text-[#1a2a35] dark:text-[#e2edf3]">
          Recruitment Management System (RMS) — Arvin International Marketing Inc.
        </p>
        <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-1">
          Version 0.1.0 (Development)
        </p>
      </div>

      <div className="pt-4 border-t border-[#e2e8ed] dark:border-[#1e3448]">
        <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-2">
          How to Use
        </h3>
        <ul className="text-sm text-[#1a2a35] dark:text-[#e2edf3] space-y-1.5 list-disc list-inside">
          <li>Use <strong>Job Postings</strong> to create and manage open positions.</li>
          <li>Track candidates through each stage in <strong>Applicants</strong>.</li>
          <li>Rejected applicants are archived separately and won&apos;t appear in the main pipeline.</li>
          <li>HR Directors can manage account access under <strong>Settings → User Management</strong>.</li>
        </ul>
      </div>

      <div className="pt-4 border-t border-[#e2e8ed] dark:border-[#1e3448]">
        <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-1">
          Need Help?
        </h3>
        <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">
          Contact your system administrator for technical support.
        </p>
      </div>
    </div>
  )
}