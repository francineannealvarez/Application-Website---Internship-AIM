'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockUsers, getUserApplication, getUserNotifications, mockPositions } from '@/lib/mockData';

const statusSteps = [
  { status: 'SUBMITTED', label: 'Submitted', icon: '✅' },
  { status: 'UNDER_REVIEW', label: 'Under Review', icon: '🔵' },
  { status: 'SHORTLISTED', label: 'Shortlisted', icon: '⭕' },
  { status: 'REQUIREMENTS', label: 'Requirements', icon: '⭕' },
  { status: 'HIRED', label: 'Final Decision', icon: '⭕' },
];

const statusMessages: Record<string, string> = {
  SUBMITTED: '✅ Application received! We\'ll start reviewing it soon.',
  UNDER_REVIEW: '🔍 Our HR team is currently reviewing your application. Sit tight!',
  SHORTLISTED: '🎉 Great news! You\'ve been shortlisted. Check the Requirements tab now.',
  REQUIREMENTS: '📂 Please upload your required documents before the deadline.',
  HIRED: '🎊 Congratulations! Welcome to the Arvin family!',
  REJECTED: '❌ Thank you for applying. We\'ll keep your profile on file for future openings.',
};

export default function ApplicantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [position, setPosition] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for mock user or redirect
    const mockUserStr = sessionStorage.getItem('mockUser');
    if (!mockUserStr) {
      router.push('/login');
      return;
    }

    const mockUser = JSON.parse(mockUserStr);
    
    // Only allow applicants
    if (mockUser.role !== 'APPLICANT') {
      router.push('/login');
      return;
    }

    setUser(mockUser);
    
    // Load mock data
    const app = getUserApplication(mockUser.id);
    if (app) {
      setApplication(app);
      const pos = mockPositions.find(p => p.id === app.positionId);
      setPosition(pos);
    }
    
    const notifs = getUserNotifications(mockUser.id).slice(0, 3);
    setNotifications(notifs);
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) return null;

  const currentStepIndex = application
    ? statusSteps.findIndex((step) => step.status === application.status)
    : -1;

  const handleLogout = () => {
    sessionStorage.removeItem('mockUser');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-[#00AEEF]">ARVIN</div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#00AEEF] to-[#1B3A5C] text-white rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-white/90">Here's the current status of your application at Arvin International.</p>
        </div>

        {!application ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't submitted an application yet.</p>
            <Link
              href="/apply"
              className="inline-block px-6 py-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#0099CC]"
            >
              Start Your Application
            </Link>
          </div>
        ) : (
          <>
            {/* Status Stepper */}
            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Application Status</h2>
              
              <div className="flex items-center justify-between mb-8 relative">
                {statusSteps.map((step, index) => (
                  <div key={step.status} className="flex flex-col items-center flex-1 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2 ${
                        index <= currentStepIndex
                          ? 'bg-[#00AEEF] text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index < currentStepIndex ? '✓' : step.icon}
                    </div>
                    <span
                      className={`text-sm font-medium text-center ${
                        index <= currentStepIndex
                          ? 'text-[#00AEEF]'
                          : 'text-gray-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
                {/* Progress line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 z-0">
                  <div
                    className="h-full bg-[#00AEEF] transition-all"
                    style={{ width: `${currentStepIndex >= 0 ? ((currentStepIndex) / (statusSteps.length - 1)) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">{statusMessages[application.status]}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Application Summary */}
              <div className="md:col-span-2 bg-white rounded-lg shadow p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Application Summary</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-600">Position Applied:</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {position?.title || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {position?.department || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Employment Type:</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {position?.employmentType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Submitted:</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Status Update:</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(application.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {application.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-semibold mb-2">Rejection Reason:</p>
                      <p className="text-red-700">{application.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-lg shadow p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Notifications</h3>
                <div className="space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`pb-3 border-b border-gray-200 last:border-b-0 ${!notif.isRead ? 'bg-blue-50 p-2 rounded' : ''}`}
                      >
                        <p className="text-sm text-gray-700">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">No notifications yet</p>
                  )}
                  <Link
                    href="/notifications"
                    className="text-[#00AEEF] font-semibold text-sm hover:underline mt-4 block"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            </div>

            {/* Action Links */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <Link
                href="/application"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
              >
                <p className="text-lg font-semibold text-[#00AEEF]">📋 View Application</p>
              </Link>
              <Link
                href="/requirements"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
              >
                <p className="text-lg font-semibold text-[#00AEEF]">📁 Requirements</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
