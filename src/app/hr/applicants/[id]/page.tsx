'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ApplicationData {
  id: string;
  userId: string;
  positionId: string;
  status: string;
  submittedAt: string | Date;
  updatedAt: string | Date;
  phoneNumber?: string | null;
  homeAddress?: string | null;
  dateOfBirth?: string | Date | null;
  gender?: string | null;
  message?: string | null;
  resumePath: string;
  coverLetterPath?: string | null;
  portfolioUrl?: string | null;
  rejectionReason?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  position: { id: string; title: string };
  documents: Array<{
    id: string;
    requirement: { name: string };
    isVerified: boolean;
    filePath: string;
  }>;
}

export default function HRApplicantProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const applicantId = params.id as string;

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchApplication = useCallback(async () => {
    try {
      const res = await fetch(`/api/hr/applicants/${applicantId}`);
      if (res.ok) {
        const data = (await res.json()) as ApplicationData;
        setApplication(data);
        setNewStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  }, [applicantId]);

  useEffect(() => {
    if (session?.user?.id && session.user.role === 'HR_ADMIN') {
      const timer = window.setTimeout(() => {
        void fetchApplication();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [session, fetchApplication]);

  const handleStatusUpdate = async () => {
    if (!application) return;

    setUpdatingStatus(true);

    try {
      const res = await fetch(`/api/hr/applicants/${applicantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: newStatus === 'REJECTED' ? rejectionReason : null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setApplication(updated);
        alert('Status updated successfully');
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Applicant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/hr/applicants" className="text-[#00AEEF] hover:underline">
            ← Back to Applicants
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-[#1B3A5C] mb-8">Applicant Profile</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Applicant Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">{application.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{application.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{application.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-900">{application.gender || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{application.homeAddress || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-medium text-gray-900">{application.position.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applied Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(application.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Message</p>
                  <p className="font-medium text-gray-900">{application.message || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">Resume</span>
                  <a
                    href={application.resumePath}
                    className="text-[#00AEEF] hover:underline font-semibold"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </div>
                {application.coverLetterPath && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">Cover Letter</span>
                    <a
                      href={application.coverLetterPath}
                      className="text-[#00AEEF] hover:underline font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>

              {/* Uploaded Requirements */}
              {application.documents.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-4">Uploaded Requirements</h3>
                  <div className="space-y-3">
                    {application.documents.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{doc.requirement.name}</p>
                          <p className={`text-xs ${doc.isVerified ? 'text-green-600' : 'text-gray-500'}`}>
                            {doc.isVerified ? '✓ Verified' : 'Pending Verification'}
                          </p>
                        </div>
                        <a
                          href={doc.filePath}
                          className="text-[#00AEEF] hover:underline font-semibold"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Status Update */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Current Status</p>
              <div className="inline-block px-4 py-2 bg-[#00AEEF] text-white rounded-full font-semibold">
                {application.status}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change Status To
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="REQUIREMENTS">Requirements</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {newStatus === 'REJECTED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason (Optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                    rows={3}
                    placeholder="Explain why the applicant was rejected..."
                  />
                </div>
              )}

              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus || newStatus === application.status}
                className="w-full px-4 py-2 bg-[#00AEEF] text-white font-semibold rounded-lg hover:bg-[#0099CC] disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>

            {application.rejectionReason && application.status === 'REJECTED' && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Rejection Reason:</strong> {application.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
