'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { components, pageHeader, refreshBtn } from '@/lib/admin-theme'
import NotificationBell from './NotificationBell'

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

interface PageHeaderProps {
  title: string
}

export default function PageHeader({ title }: PageHeaderProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <>
      <div className={pageHeader.row}>
        <h1 className={components.pageTitle}>{title}</h1>

        <div className={pageHeader.actionsGroup}>
          <NotificationBell />
          <button
            onClick={handleRefresh}
            className={refreshBtn.base}
            aria-label="Refresh page"
          >
            <RefreshIcon className={isRefreshing ? refreshBtn.spinning : ''} />
          </button>
        </div>
      </div>

      <hr className={components.pageDivider} />
    </>
  )
}