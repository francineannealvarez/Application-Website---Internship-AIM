'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllApplications, mockPositions, mockUsers } from '@/lib/mockData';

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-gray-100 text-gray-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  SHORTLISTED: 'bg-blue-100 text-blue-800',
  REQUIREMENTS: 'bg-orange-100 text-orange-800',
  HIRED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function HRApplicantsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [search, setSearch] = useState('');

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
    setApplications(getAllApplications());
    setLoading(false);
  }, [router]);

  // Filter applications based on search and filters
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    if (filterStatus) {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    if (filterPosition) {
      filtered = filtered.filter((app) => app.positionId === filterPosition);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchLower) ||
          app.phone.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [applications, filterStatus, filterPosition, search]);

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
            <Link href="/hr/dashboard" className="text-2xl font-bold text-[#00AEEF]">
              ARVIN
            </Link>
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
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span>📊</span> Dashboard
            </Link>
            <Link
              href="/hr/applicants"
              className="flex items-center gap-3 px-4 py-2 bg-[#00AEEF] text-white rounded-lg"
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
            <h1 className="text-3xl font-bold text-[#1B3A5C] mb-8">All Applicants</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                  >
                    <option value="">All Statuses</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="REQUIREMENTS">Requirements</option>
                    <option value="HIRED">Hired</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                  >
                    <option value="">All Positions</option>
                    {mockPositions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearch('');
                      setFilterStatus('');
                      setFilterPosition('');
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Applicants Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Position</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => {
                    const position = mockPositions.find((p) => p.id === app.positionId);
                    return (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">{app.name || 'Unknown'}</p>
                            <p className="text-gray-600">{app.phone || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{position?.title || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            href={`/hr/applicants/${app.id}`}
                            className="text-[#00AEEF] hover:underline font-semibold"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No applicants found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
