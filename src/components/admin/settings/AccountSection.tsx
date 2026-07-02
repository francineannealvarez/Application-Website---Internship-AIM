'use client'

import React, { useState } from 'react'

// TODO: replace with real logged-in user data from Supabase/NextAuth session
const MOCK_CURRENT_USER = {
  name: 'Cian Dela Cruz',
  email: 'cian.delacruz@arvin.com',
  contact: '0917 123 4567',
  role: 'HR Director',
}

export default function AccountSection() {
  const [name, setName] = useState(MOCK_CURRENT_USER.name)
  const [contact, setContact] = useState(MOCK_CURRENT_USER.contact)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── Profile Info ── */}
      <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
        <h2 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-1">
          Profile Information
        </h2>
        <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mb-4">
          Update your personal details.
        </p>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-[#f4f7f9] dark:bg-[#0f1f29] border border-[#e2e8ed] dark:border-[#1e3448] flex items-center justify-center text-lg font-semibold text-[#00bbda]">
            {MOCK_CURRENT_USER.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <button className="text-xs font-medium text-[#00bbda] hover:underline">
            Change Photo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
              Email
            </label>
            <input
              type="email"
              value={MOCK_CURRENT_USER.email}
              disabled
              className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-[#f4f7f9] dark:bg-[#0f1f29]/60 text-[#8fa3b0] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
              Contact Number
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
              Role
            </label>
            <input
              type="text"
              value={MOCK_CURRENT_USER.role}
              disabled
              className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-[#f4f7f9] dark:bg-[#0f1f29]/60 text-[#8fa3b0] cursor-not-allowed"
            />
          </div>
        </div>

        <button className="mt-5 px-4 py-2 text-sm font-medium rounded bg-[#00bbda] text-white hover:bg-[#00a5c0] transition-colors">
          Save Changes
        </button>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
        <h2 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-1">
          Change Password
        </h2>
        <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mb-4">
          Choose a strong password you don&apos;t use elsewhere.
        </p>

        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]"
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-[#e05252] mt-1">Passwords do not match.</p>
            )}
          </div>
        </div>

        <button
          disabled={!passwordsMatch}
          className="mt-5 px-4 py-2 text-sm font-medium rounded bg-[#00bbda] text-white hover:bg-[#00a5c0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Update Password
        </button>
      </div>
    </div>
  )
}