'use client'

import React from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { components } from '@/lib/admin-theme'

// ─── Mock Data ──────────────────────────────────────────────
// TODO: replace with real data from Supabase once employees table is wired up.
const MOCK_EMPLOYEES = [
  {
    id: '1',
    name: 'Rodrigo De Paul',
    position: 'Accounting Clerk',
    department: 'Finance',
    startDate: 'Jun 28, 2026',
    status: 'Probationary',
    initials: 'RD',
  },
]

export default function EmployeesPage() {
  return (
    <AdminLayout>
      <h1 className={components.pageTitle}>Employees (Probationary)</h1>
      <hr className={components.pageDivider} />

      <div className="mt-6">
        {MOCK_EMPLOYEES.length === 0 ? (
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-10 text-center">
            <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
              No probationary employees currently on record.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg overflow-hidden">
            <table className={components.table}>
              <thead className={components.tableHeader}>
                <tr>
                  <th className={components.tableHeaderCell}>Employee</th>
                  <th className={components.tableHeaderCell}>Position</th>
                  <th className={components.tableHeaderCell}>Department</th>
                  <th className={components.tableHeaderCell}>Start Date</th>
                  <th className={components.tableHeaderCell}>Status</th>
                  <th className={components.tableHeaderCell}></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_EMPLOYEES.map((emp) => (
                  <tr key={emp.id} className={components.tableRow}>
                    <td className={components.tableCell}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00bbda] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {emp.initials}
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className={components.tableCell}>{emp.position}</td>
                    <td className={components.tableCellMuted}>{emp.department}</td>
                    <td className={components.tableCellMuted}>{emp.startDate}</td>
                    <td className={components.tableCell}>
                      <span className={`${components.badge.base} ${components.badge.onboarding}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className={components.tableCell}>
                      <Link
                        href={`/admin/employees/${emp.id}`}
                        className={components.btnOutline}
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}