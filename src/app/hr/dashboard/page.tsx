'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllApplications } from '@/lib/mockData';

interface DashboardStats {
  totalApplicants: number;
  underReview: number;
  shortlisted: number;
  hired: number;
}

export default function HRDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplicants: 0,
    underReview: 0,
    shortlisted: 0,
    hired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockUserStr = sessionStorage.getItem('mockUser');
    if (!mockUserStr) {
      router.push('/login');
      return;
    }

    const mockUser = JSON.parse(mockUserStr);
    if (mockUser.role !== 'HR_ADMIN') {
      router.push('/login');
      return;
    }

    setUser(mockUser);

    // Calculate stats
    const applications = getAllApplications();
    setStats({
      totalApplicants: applications.length,
      underReview: applications.filter((a) => a.status === 'UNDER_REVIEW').length,
      shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
      hired: applications.filter((a) => a.status === 'HIRED').length,
    });

    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) return null;

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
            <span className="text-sm text-gray-600">HR Admin</span>
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

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-4">
            <Link
              href="/hr/dashboard"
              className="flex items-center gap-3 px-4 py-2 bg-[#00AEEF] text-white rounded-lg"
            >
              <span>📊</span> Dashboard
            </Link>
            <Link
              href="/hr/applicants"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span>👥</span> All Applicants
            </Link>
            <Link
              href="/hr/positions"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span>💼</span> Manage Positions
            </Link>
            <Link
              href="/hr/requirements"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span>📋</span> Manage Requirements
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold text-[#1B3A5C] mb-8">HR Dashboard</h1>

            {/* Stats Cards */}
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

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/hr/applicants"
                className="bg-gradient-to-br from-[#00AEEF] to-[#0099CC] rounded-lg shadow p-8 text-white hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-bold mb-2">👥 View Applicants</h2>
                <p className="text-white/90">Review and manage all applicant submissions</p>
              </Link>
              <Link
                href="/hr/positions"
                className="bg-gradient-to-br from-[#1B3A5C] to-[#0F1F3C] rounded-lg shadow p-8 text-white hover:shadow-lg transition"
              >
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
