'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllApplications, mockPositions } from '@/lib/mockData';
import { clearDemoUser, readDemoUser, type DemoUser } from '@/lib/demo-session';

type HRApplication = {
  id: string;
  status: string;
  submittedAt?: string | Date;
  createdAt?: string | Date;
  user?: { id?: string; name?: string | null; email?: string | null };
  position?: { id?: string; title?: string | null };
  phoneNumber?: string | null;
  phone?: string | null;
};

function getApplicationsFromApi(sessionTokenReady: boolean) {
  return fetch('/api/hr/applicants').then(async (res) => {
    if (!res.ok) throw new Error('Failed to load HR applicants');
    return (await res.json()) as HRApplication[];
  });
}

function getPositionTitle(app: HRApplication) {
  return app.position?.title || mockPositions.find((p) => p.id === (app as { positionId?: string }).positionId)?.title || 'N/A';
}

export default function HRDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [demoUser] = useState<DemoUser | null>(() => (typeof window !== 'undefined' ? readDemoUser() : null));
  const [applications, setApplications] = useState<HRApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const isRealHrSession = Boolean(session?.user?.id && session.user.role === 'HR_ADMIN');
  const isDemoHrSession = Boolean(demoUser?.role === 'HR_ADMIN' && !isRealHrSession);

  useEffect(() => {
    if (status === 'unauthenticated' && !demoUser) {
      router.push('/login');
    }
  }, [status, demoUser, router]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (isRealHrSession) {
          const data = await getApplicationsFromApi(true);
          if (active) setApplications(data);
        } else if (isDemoHrSession) {
          if (active) setApplications(getAllApplications() as HRApplication[]);
        }
      } catch (error) {
        console.error('Error loading HR dashboard data:', error);
        if (isDemoHrSession) {
          if (active) setApplications(getAllApplications() as HRApplication[]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (isRealHrSession || isDemoHrSession) {
      void load();
    } else if (status !== 'loading') {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [isRealHrSession, isDemoHrSession, status]);

  const stats = useMemo(() => {
    return {
      totalApplicants: applications.length,
      underReview: applications.filter((a) => a.status === 'UNDER_REVIEW').length,
      shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
      hired: applications.filter((a) => a.status === 'HIRED').length,
    };
  }, [applications]);

  const recentApplications = useMemo(
    () => [...applications].sort((a, b) => {
      const left = new Date(a.submittedAt ?? a.createdAt ?? 0).getTime();
      const right = new Date(b.submittedAt ?? b.createdAt ?? 0).getTime();
      return right - left;
    }).slice(0, 5),
    [applications]
  );

  if (loading || status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const displayName = session?.user?.name || demoUser?.name || 'HR Admin';

  const handleLogout = () => {
    clearDemoUser();
    void signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-[#00AEEF]">ARVIN</div>
            <span className="text-sm text-gray-600">HR Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{displayName}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-4">
            <Link href="/hr/dashboard" className="flex items-center gap-3 px-4 py-2 bg-[#00AEEF] text-white rounded-lg">
              <span>📊</span> Dashboard
            </Link>
            <Link href="/hr/applicants" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span>👥</span> All Applicants
            </Link>
            <Link href="/hr/positions" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span>💼</span> Manage Positions
            </Link>
            <Link href="/hr/requirements" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <span>📋</span> Manage Requirements
            </Link>
          </nav>
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold text-[#1B3A5C] mb-2">HR Dashboard</h1>
            <p className="text-sm text-gray-600 mb-8">
              {isRealHrSession ? 'Live applicant data from the database.' : 'Demo data is active. Log in with the seeded HR account to see live submissions.'}
            </p>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Total Applicants</p>
                <p className="text-3xl font-bold text-[#00AEEF]">{stats.totalApplicants}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Under Review</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.underReview}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Shortlisted</p>
                <p className="text-3xl font-bold text-blue-500">{stats.shortlisted}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Hired</p>
                <p className="text-3xl font-bold text-green-500">{stats.hired}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Applications</h2>
                <Link href="/hr/applicants" className="text-sm text-[#00AEEF] hover:underline">View all</Link>
              </div>
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Applicant</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Position</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-gray-900">{app.user?.name || 'Unknown'}</p>
                        <p className="text-gray-600">{app.user?.email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getPositionTitle(app)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(app.submittedAt ?? app.createdAt ?? Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.status}</td>
                    </tr>
                  ))}
                  {recentApplications.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-600">No applicants found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Link href="/hr/applicants" className="bg-gradient-to-br from-[#00AEEF] to-[#0099CC] rounded-lg shadow p-8 text-white hover:shadow-lg transition">
                <h2 className="text-2xl font-bold mb-2">👥 View Applicants</h2>
                <p className="text-white/90">Review and manage all applicant submissions</p>
              </Link>
              <Link href="/hr/positions" className="bg-gradient-to-br from-[#1B3A5C] to-[#0F1F3C] rounded-lg shadow p-8 text-white hover:shadow-lg transition">
                <h2 className="text-2xl font-bold mb-2">💼 Manage Positions</h2>
                <p className="text-white/90">Add, edit, and manage open positions</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}