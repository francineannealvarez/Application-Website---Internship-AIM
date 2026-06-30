'use client'

import React from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { components } from '@/lib/admin-theme'

// TODO: fetch real employee data from Supabase using params.id once backend is wired up.
export default function EmployeeProfilePage() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className={components.pageTitle}>Employee Profile</h1>
        <Link href="/admin/employees" className={components.btnGhost}>
          ← Back to Employees
        </Link>
      </div>
      <hr className={components.pageDivider} />

      <div className="mt-6 bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-10 text-center">
        <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
          Employee profile details will appear here.
        </p>
      </div>
    </AdminLayout>
  )
}