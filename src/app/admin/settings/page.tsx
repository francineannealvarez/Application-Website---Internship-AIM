'use client'
 
import React, { useState } from 'react'
import PageHeader from '@/components/admin/PageHeader'
import AdminLayout from '@/components/admin/AdminLayout'
import AccountSection from '@/components/admin/settings/AccountSection'
import UserManagementSection from '@/components/admin/settings/UserManagementSection'
import NotificationsSection from '@/components/admin/settings/NotificationSection'
import AppearanceSection from '@/components/admin/settings/AppearanceSection'
import AboutSection from '@/components/admin/settings/AboutSection'
 
// TODO: replace with real auth/role check once NextAuth + Supabase roles are wired up.
// For now this is a dev-only toggle so we can preview all access levels in the UI.
type MockRole = 'hr_director' | 'hr_supervisor' | 'hr_specialist' | 'hr_associate'
 
const ROLE_LABELS: Record<MockRole, string> = {
  hr_director: 'HR Director',
  hr_supervisor: 'HR Supervisor',
  hr_specialist: 'HR Specialist',
  hr_associate: 'HR Associate',
}
 
const TABS = ['Account', 'User Management', 'Notifications', 'Appearance', 'About'] as const
type Tab = typeof TABS[number]
 
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Account')
  const [mockRole, setMockRole] = useState<MockRole>('hr_director')
 
  const isDirector = mockRole === 'hr_director'
 
  // Hide "User Management" tab entirely for non-directors — mirrors how
  // this will behave once real role checks are in place.
  const visibleTabs = TABS.filter((tab) => tab !== 'User Management' || isDirector)
 
  return (
    <AdminLayout>
      <PageHeader title="Settings" />
 
      {/* ⚠️ DEV ONLY — remove once real role/session data is available */}
      <div className="mt-3 flex items-center gap-2 text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">
        <span>Preview as:</span>
        <select
          value={mockRole}
          onChange={(e) => setMockRole(e.target.value as MockRole)}
          className="text-xs border border-[#e2e8ed] dark:border-[#1e3448] rounded px-2 py-1 bg-white dark:bg-[#132435] text-[#1a2a35] dark:text-[#e2edf3]"
        >
          {(Object.keys(ROLE_LABELS) as MockRole[]).map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>
 
      {/* ── Folder-style tabs — same pattern as the Applicants Pipeline page ── */}
      <div className="flex items-end gap-1 mt-5 overflow-x-auto">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                isActive
                  ? 'relative z-10 flex items-center gap-2 px-5 py-3 rounded-t-xl bg-white dark:bg-[#132435] border border-b-0 border-[#e2e8ed] dark:border-[#1e3448] text-sm font-semibold text-[#00bbda] whitespace-nowrap shadow-[0_-2px_6px_-2px_rgba(15,31,41,0.06)]'
                  : 'flex items-center gap-2 px-5 py-2.5 mb-[1px] rounded-t-xl bg-[#eef4f6] dark:bg-[#0d2333] text-sm font-medium text-[#7a94a0] dark:text-[#6b8fa3] hover:text-[#00bbda] hover:bg-[#e2eef1] dark:hover:bg-[#112c3f] transition-colors whitespace-nowrap'
              }
            >
              {tab}
            </button>
          )
        })}
      </div>
 
      {/* ── Panel — same white as the active tab, no visible seam between them ── */}
      <div className="-mt-px border border-[#e2e8ed] dark:border-[#1e3448] rounded-b-xl rounded-tr-xl bg-white dark:bg-[#132435] shadow-sm overflow-hidden p-6">
        {activeTab === 'Account' && <AccountSection />}
        {activeTab === 'User Management' && isDirector && <UserManagementSection />}
        {activeTab === 'Notifications' && <NotificationsSection />}
        {activeTab === 'Appearance' && <AppearanceSection />}
        {activeTab === 'About' && <AboutSection />}
      </div>
    </AdminLayout>
  )
}