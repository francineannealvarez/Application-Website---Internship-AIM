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
// For now this is a dev-only toggle so we can preview both access levels in the UI.
type MockRole = 'hr_director' | 'hr_staff'

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
          <option value="hr_director">HR Director</option>
          <option value="hr_staff">HR Staff</option>
        </select>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                isActive
                  ? 'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-[#00bbda] text-white'
                  : 'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors bg-[#f4f7f9] dark:bg-[#132435] text-[#1a2a35] dark:text-[#e2edf3] border border-[#e2e8ed] dark:border-[#1e3448] hover:border-[#00bbda] hover:text-[#00bbda]'
              }
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* ── Active section ── */}
      <div className="mt-6">
        {activeTab === 'Account' && <AccountSection />}
        {activeTab === 'User Management' && isDirector && <UserManagementSection />}
        {activeTab === 'Notifications' && <NotificationsSection />}
        {activeTab === 'Appearance' && <AppearanceSection />}
        {activeTab === 'About' && <AboutSection />}
      </div>
    </AdminLayout>
  )
}