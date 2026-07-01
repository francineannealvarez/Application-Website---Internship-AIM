'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type RequirementRecord = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};

interface RequirementForm {
  name: string;
  description: string;
}

export default function HRRequirementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requirements, setRequirements] = useState<RequirementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<RequirementForm>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchRequirements = useCallback(async () => {
    try {
      const res = await fetch('/api/hr/requirements');
      if (res.ok) {
        const data = await res.json();
        setRequirements(data);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id && session.user.role === 'HR_ADMIN') {
      const timer = window.setTimeout(() => {
        void fetchRequirements();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [session, fetchRequirements]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/hr/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Requirement created successfully');
        setFormData({ name: '', description: '' });
        setShowForm(false);
        fetchRequirements();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create requirement');
      }
    } catch (error) {
      console.error('Error creating requirement:', error);
      alert('An error occurred');
    }
  };

  const handleToggleActive = async (reqId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/hr/requirements/${reqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        fetchRequirements();
      }
    } catch (error) {
      console.error('Error updating requirement:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/hr/dashboard" className="text-2xl font-bold text-[#00AEEF]">
            ARVIN
          </Link>
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
              className="flex items-center gap-3 px-4 py-2 bg-[#00AEEF] text-white rounded-lg"
            >
              <span>📋</span> Manage Requirements
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-[#1B3A5C]">Manage Requirements</h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-2 bg-[#00AEEF] text-white rounded-lg hover:bg-[#0099CC] font-semibold"
              >
                {showForm ? 'Cancel' : '+ Add Requirement'}
              </button>
            </div>

            {/* Add Requirement Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Requirement</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                      placeholder="e.g. NBI Clearance"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF] resize-none"
                      placeholder="Enter requirement description..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                  >
                    Create Requirement
                  </button>
                </form>
              </div>
            )}

            {/* Requirements Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req) => (
                    <tr key={req.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{req.description}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            req.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {req.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleToggleActive(req.id, req.isActive)}
                          className="text-[#00AEEF] hover:underline font-semibold"
                        >
                          {req.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {requirements.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No requirements yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
