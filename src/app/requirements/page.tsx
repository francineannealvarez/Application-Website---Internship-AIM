'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  mockUsers,
  getUserApplication,
  getApplicationDocuments,
  mockRequirements,
  getApplicationById,
} from '@/lib/mockData';

export default function RequirementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockUserStr = sessionStorage.getItem('mockUser');
    if (!mockUserStr) {
      router.push('/login');
      return;
    }

    const mockUser = JSON.parse(mockUserStr);
    if (mockUser.role !== 'APPLICANT') {
      router.push('/login');
      return;
    }

    setUser(mockUser);

    const app = getUserApplication(mockUser.id);
    if (!app) {
      router.push('/dashboard');
      return;
    }

    setApplication(app);
    const docs = getApplicationDocuments(app.id);
    setDocuments(docs);
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || !application) return null;

  const isUnlocked = ['SHORTLISTED', 'REQUIREMENTS', 'HIRED'].includes(
    application.status
  );

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
            <Link href="/dashboard" className="text-2xl font-bold text-[#00AEEF]">
              ARVIN
            </Link>
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-[#00AEEF] font-semibold hover:underline mb-4 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Required Documents</h1>
          <p className="text-gray-600">
            Upload the following documents to complete your application
          </p>
        </div>

        {!isUnlocked && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-yellow-800">
              🔒 Documents will be available once you're shortlisted. Current status:{' '}
              <strong>{application.status}</strong>
            </p>
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {mockRequirements.map((req) => {
            const doc = documents.find((d) => d.requirementId === req.id);
            const isUploaded = doc && doc.filePath;
            const isVerified = isUploaded && doc.isVerified;

            return (
              <div
                key={req.id}
                className={`rounded-lg border-2 p-6 ${
                  isUnlocked
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-300 bg-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{req.name}</h3>
                    <p className="text-sm text-gray-600">{req.description}</p>
                  </div>
                  <div className="text-2xl">
                    {!isUploaded ? '❌' : isVerified ? '✅' : '⏳'}
                  </div>
                </div>

                {isUploaded && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      📄 Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                    {isVerified && (
                      <p className="text-sm text-green-700 font-semibold">✓ Verified</p>
                    )}
                    {!isVerified && (
                      <p className="text-sm text-orange-700">Under review...</p>
                    )}
                  </div>
                )}

                {isUnlocked && (
                  <button
                    disabled={!isUnlocked}
                    className={`w-full py-2 rounded-lg font-semibold transition ${
                      isUnlocked
                        ? 'bg-[#00AEEF] text-white hover:bg-[#0099CC]'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isUploaded ? 'Replace File' : 'Upload File'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Status Summary */}
        {isUnlocked && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Uploaded:</span>
                <span className="font-semibold">
                  {documents.filter((d) => d.filePath).length}/
                  {mockRequirements.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Verified:</span>
                <span className="font-semibold">
                  {documents.filter((d) => d.isVerified).length}/
                  {mockRequirements.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-[#00AEEF] h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      (documents.filter((d) => d.filePath).length /
                        mockRequirements.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
