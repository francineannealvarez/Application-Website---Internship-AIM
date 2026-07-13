'use client'

import { useState, useRef, useEffect } from 'react'
import { notif, PLACEHOLDER_NOTIFICATIONS, PLACEHOLDER_JOBS, getClosingSoonNotifications } from '@/lib/admin-theme'

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.65V5a2 2 0 10-4 0v.35A6 6 0 006 11v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // ⬅️ CHANGED: merge dynamic "closing soon, 0 applicants" notifications
  // (computed live from PLACEHOLDER_JOBS) with the static placeholder ones.
  // TODO: once backend exists, this whole list should come from a real
  // `notifications` table/query instead of being computed client-side.
  const dynamicNotifications = getClosingSoonNotifications(PLACEHOLDER_JOBS)
  const allNotifications = [...dynamicNotifications, ...PLACEHOLDER_NOTIFICATIONS]

  const unreadCount = allNotifications.filter((n) => n.unread).length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={notif.wrapper} ref={wrapperRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={notif.bellBtn}
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && <span className={notif.dot} />}
      </button>

      {isOpen && (
        <div className={notif.dropdown}>
          <div className={notif.dropdownHeader}>
            Notifications {unreadCount > 0 && `(${unreadCount} new)`}
          </div>

          <div className={notif.list}>
            {allNotifications.length === 0 ? (
              <p className={notif.emptyState}>No new notifications</p>
            ) : (
              allNotifications.map((n) => (
                <div key={n.id} className={n.unread ? notif.itemUnread : notif.item}>
                  <p className={notif.itemText}>{n.message}</p>
                  <p className={notif.itemTime}>{n.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}