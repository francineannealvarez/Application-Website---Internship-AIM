'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserApplication } from '@/lib/mockData';
import { readDemoUser, type DemoUser } from '@/lib/demo-session';

type ApplicationWithRelations = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
  position?: {
    id: string;
    title: string;
    employmentType?: string | null;
  };
  phoneNumber?: string | null;
  homeAddress?: string | null;
  dateOfBirth?: string | Date | null;
  gender?: string | null;
  preferredStartDate?: string | Date | null;
  message?: string | null;
  resumePath: string;
  coverLetterPath?: string | null;
  portfolioUrl?: string | null;
  rejectionReason?: string | null;
  submittedAt?: string | Date;
  updatedAt?: string | Date;
};

export default function ApplicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUser] = useState<DemoUser | null>(() => (typeof window !== 'undefined' ? readDemoUser() : null));

  useEffect(() => {
    if (status === 'unauthenticated' && !demoUser) {
      router.push('/login');
    }
  }, [status, demoUser, router]);

  const fetchApplication = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplication(data);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = session?.user?.id || demoUser?.id;

    if (userId) {
      const timer = window.setTimeout(() => {
        if (demoUser?.id) {
          const mockApplication = getUserApplication(demoUser.id);
          setApplication(mockApplication ? (mockApplication as ApplicationWithRelations) : null);
          setLoading(false);
          return;
        }

        void fetchApplication();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [session, demoUser, status]);

  if (loading || status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1fc_0%,_#f8fafc_55%)] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-slide-up">
            <p className="text-gray-600 mb-4">You don&apos;t have an application yet.</p>
            <Link
              href="/apply"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#00AEEF] to-[#0099CC] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              Start Your Application
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1fc_0%,_#f8fafc_55%)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-[#00AEEF] hover:underline mb-4 inline-flex items-center gap-1 group">
          <span className="transition-transform group-hover:-translate-x-0.5">←</span> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden mt-2 animate-fade-slide-up">
          <div className="bg-gradient-to-r from-[#00AEEF] to-[#1B3A5C] px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">Your Application</h1>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Full Name</p>
                  <p className="font-medium text-gray-900">{application.user?.name || session?.user?.name || demoUser?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="font-medium text-gray-900">{application.user?.email || session?.user?.email || demoUser?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="font-medium text-gray-900">{application.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Home Address</p>
                  <p className="font-medium text-gray-900">{application.homeAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {application.dateOfBirth
                      ? new Date(application.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Gender</p>
                  <p className="font-medium text-gray-900">{application.gender || 'N/A'}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Position Applied</p>
                  <p className="font-medium text-gray-900">{application.position?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Employment Type</p>
                  <p className="font-medium text-gray-900">{application.position?.employmentType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Preferred Start Date</p>
                  <p className="font-medium text-gray-900">
                    {application.preferredStartDate
                      ? new Date(application.preferredStartDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Message</h2>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-900 text-sm">{application.message || 'No message provided'}</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3.5 bg-gray-50 hover:bg-blue-50/40 rounded-xl border border-gray-100 transition-colors duration-200">
                  <span className="text-gray-900 text-sm font-medium">📄 Resume</span>
                  <a
                    href={application.resumePath}
                    className="text-[#00AEEF] hover:underline text-sm font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </div>
                {application.coverLetterPath && (
                  <div className="flex justify-between items-center p-3.5 bg-gray-50 hover:bg-blue-50/40 rounded-xl border border-gray-100 transition-colors duration-200">
                    <span className="text-gray-900 text-sm font-medium">📄 Cover Letter</span>
                    <a
                      href={application.coverLetterPath}
                      className="text-[#00AEEF] hover:underline text-sm font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </div>
                )}
                {application.portfolioUrl && (
                  <div className="flex justify-between items-center p-3.5 bg-gray-50 hover:bg-blue-50/40 rounded-xl border border-gray-100 transition-colors duration-200">
                    <span className="text-gray-900 text-sm font-medium">🔗 Portfolio URL</span>
                    <a
                      href={application.portfolioUrl}
                      className="text-[#00AEEF] hover:underline text-sm font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
              <span className="text-blue-500 mt-0.5">ℹ️</span>
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You cannot edit your application after submission. If you need to make changes, please contact HR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}