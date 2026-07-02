'use client'

import React, { useState, useEffect } from 'react'
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
  const [showAddModal, setShowAddModal] = useState(false)

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
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm font-medium rounded bg-[#00bbda] text-white hover:bg-[#00a5c0] transition-colors"
        >
          + Add HR Account
        </button>
      </div>

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

      <AddHrAccountModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  )
}

// ─── Add HR Account Modal ──────────────────────────────────────
function AddHrAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Mounted separately from `open` so we can play the closing transition
  // before actually removing it from the DOM.
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      // next tick, so the enter transition actually plays instead of snapping in
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      const timeout = setTimeout(() => setMounted(false), 200)
      return () => clearTimeout(timeout)
    }
  }, [open])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — blurred + dimmed, not a flat opaque overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[#0f1f29]/40 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-lg bg-white dark:bg-[#132435] rounded-2xl shadow-xl overflow-hidden transition-all duration-200 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* Soft pale-primary header strip instead of flat white top */}
        <div className="px-6 py-5 bg-[#e6f9fc] dark:bg-[#0d2b38] border-b border-[#d3f1f6] dark:border-[#1e3448]">
          <h3 className="text-base font-semibold text-[#0f1f29] dark:text-[#e2edf3]">
            New HR Account
          </h3>
          <p className="text-xs text-[#5a7a85] dark:text-[#6b8fa3] mt-0.5">
            Grant a new team member access to this system.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3] focus:outline-none focus:ring-2 focus:ring-[#00bbda]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="name@arvin.com"
                className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3] focus:outline-none focus:ring-2 focus:ring-[#00bbda]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
                Contact Number
              </label>
              <input
                type="text"
                placeholder="0917 000 0000"
                className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3] focus:outline-none focus:ring-2 focus:ring-[#00bbda]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1a2a35] dark:text-[#e2edf3] mb-1">
                Role
              </label>
              <select className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg px-3 py-2 bg-white dark:bg-[#0f1f29] text-[#1a2a35] dark:text-[#e2edf3] focus:outline-none focus:ring-2 focus:ring-[#00bbda]">
                <option>HR Director</option>
                <option>HR Associate</option>
                <option>HR Specialist</option>
                <option>HR Supervisor</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-4">
            Note: account creation is finalized via Supabase — this form will be wired up during backend integration.
          </p>
        </div>

        <div className="flex items-center gap-2 px-6 py-4 bg-[#f9fbfc] dark:bg-[#0f1f29] border-t border-[#e2e8ed] dark:border-[#1e3448]">
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#00bbda] text-white hover:bg-[#00a5c0] transition-colors">
            Create Account
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[#e2e8ed] dark:border-[#1e3448] text-[#1a2a35] dark:text-[#e2edf3] hover:border-[#00bbda] hover:text-[#00bbda] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}