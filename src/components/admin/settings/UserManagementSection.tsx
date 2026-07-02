'use client'

import React, { useState } from 'react'
import { components } from '@/lib/admin-theme'

// TODO: replace with real accounts data from Supabase (users/profiles table).
type Account = {
  id: number
  name: string
  email: string
  contact: string
  role: string
  status: 'active' | 'deactivated'
}

const MOCK_ACCOUNTS: Account[] = [
  { id: 1, name: 'Cian Dela Cruz',  email: 'cian.delacruz@arvin.com',  contact: '0917 123 4567', role: 'HR Director', status: 'active' },
  { id: 2, name: 'Ella Marasigan',  email: 'ella.marasigan@arvin.com', contact: '0917 234 5678', role: 'HR Staff',    status: 'active' },
  { id: 3, name: 'Noel Bautista',   email: 'noel.bautista@arvin.com',  contact: '0917 345 6789', role: 'HR Staff',    status: 'active' },
]

export default function UserManagementSection() {
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS)
  const [showAddForm, setShowAddForm] = useState(false)

  function toggleAccess(id: number) {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === 'active' ? 'deactivated' : 'active' } : a
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3]">
            HR Accounts
          </h2>
          <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">
            Manage who has access to this system.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="px-4 py-2 text-sm font-medium rounded bg-[#00bbda] text-white hover:bg-[#00a5c0] transition-colors"
        >
          + Add HR Account
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-4">
            New HR Account
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="name@arvin.com"
                className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
                Contact Number
              </label>
              <input
                type="text"
                placeholder="0917 000 0000"
                className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
                Role
              </label>
              <select className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3]">
                <option>HR Staff</option>
                <option>HR Director</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5">
            <button className="px-4 py-2 text-sm font-medium rounded bg-[#00bbda] text-white hover:bg-[#00a5c0] transition-colors">
              Create Account
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-medium rounded border border-[#e2e8ed] dark:border-[#1e3448] text-[#1a2a35] dark:text-[#e2edf3] hover:border-[#00bbda] hover:text-[#00bbda] transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-3">
            Note: account creation is finalized via Supabase — this form will be wired up during backend integration.
          </p>
        </div>
      )}

      <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg overflow-hidden">
        <table className={components.table}>
          <thead className={components.tableHeader}>
            <tr>
              <th className={components.tableHeaderCell}>Name</th>
              <th className={components.tableHeaderCell}>Email</th>
              <th className={components.tableHeaderCell}>Contact</th>
              <th className={components.tableHeaderCell}>Role</th>
              <th className={components.tableHeaderCell}>Status</th>
              <th className={components.tableHeaderCell}>Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#132435]">
            {accounts.map((a) => (
              <tr key={a.id} className={components.tableRow}>
                <td className={components.tableCell}>{a.name}</td>
                <td className={components.tableCellMuted}>{a.email}</td>
                <td className={components.tableCellMuted}>{a.contact}</td>
                <td className={components.tableCellMuted}>{a.role}</td>
                <td className={components.tableCell}>
                  <span
                    className={`${components.badge.base} ${
                      a.status === 'active' ? components.badge.onboarding : components.badge.rejected
                    }`}
                  >
                    {a.status === 'active' ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className={components.tableCell}>
                  <button
                    onClick={() => toggleAccess(a.id)}
                    className={a.status === 'active' ? 'text-[#e05252] hover:underline' : 'text-[#00bbda] hover:underline'}
                  >
                    {a.status === 'active' ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}