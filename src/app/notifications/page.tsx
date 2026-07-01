'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type NotificationItem = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      const timer = window.setTimeout(() => {
        void fetchNotifications();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [session, fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-[#00AEEF] hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1B3A5C]">Notifications</h1>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-[#00AEEF] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No notifications yet</p>
              <p className="text-gray-500 text-sm">You&apos;ll receive notifications here when your application status changes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border rounded-lg ${
                    notif.isRead
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notif.isRead && (
                      <div className="w-3 h-3 bg-[#00AEEF] rounded-full mt-1 flex-shrink-0"></div>
                    )}
                    <div className="flex-1">
                      <p className={`${notif.isRead ? 'text-gray-700' : 'text-blue-900 font-medium'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
