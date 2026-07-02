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
    return <div className="flex items-center justify-center h-screen" style={{ color: '#6B7A8D' }}>Loading...</div>;
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#E5E9EC] shadow-sm p-8 text-center animate-fade-slide-up">
            <p className="mb-4" style={{ color: '#6B7A8D' }}>You don&apos;t have an application yet.</p>
            <Link
              href="/apply"
              className="inline-block px-6 py-2.5 text-white font-semibold rounded-lg hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              style={{ backgroundColor: '#0B2A4A' }}
            >
              Start Your Application
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FA] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="hover:underline mb-4 inline-flex items-center gap-1 group text-sm font-medium" style={{ color: '#12B6D6' }}>
          <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-[#E5E9EC] shadow-sm overflow-hidden mt-2 animate-fade-slide-up">
          <div className="px-8 py-6 text-white" style={{ backgroundColor: '#0B2A4A' }}>
            <h1 className="text-2xl font-bold">Your Application</h1>
          </div>

          <div className="p-8 sm:p-10 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#0B2A4A] mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Full Name</p>
                  <p className="font-medium text-[#0B2A4A]">{application.user?.name || session?.user?.name || demoUser?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Email</p>
                  <p className="font-medium text-[#0B2A4A]">{application.user?.email || session?.user?.email || demoUser?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Phone</p>
                  <p className="font-medium text-[#0B2A4A]">{application.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Home Address</p>
                  <p className="font-medium text-[#0B2A4A]">{application.homeAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Date of Birth</p>
                  <p className="font-medium text-[#0B2A4A]">
                    {application.dateOfBirth
                      ? new Date(application.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Gender</p>
                  <p className="font-medium text-[#0B2A4A]">{application.gender || 'N/A'}</p>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: '#E5E9EC' }} />

            <div>
              <h2 className="text-lg font-bold text-[#0B2A4A] mb-4">Application Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Position Applied</p>
                  <p className="font-medium text-[#0B2A4A]">{application.position?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Employment Type</p>
                  <p className="font-medium text-[#0B2A4A]">{application.position?.employmentType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Preferred Start Date</p>
                  <p className="font-medium text-[#0B2A4A]">
                    {application.preferredStartDate
                      ? new Date(application.preferredStartDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: '#E5E9EC' }} />

            <div>
              <h2 className="text-lg font-bold text-[#0B2A4A] mb-4">Message</h2>
              <div className="rounded-xl p-4" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC' }}>
                <p className="text-sm text-[#0B2A4A]">{application.message || 'No message provided'}</p>
              </div>
            </div>

            <hr style={{ borderColor: '#E5E9EC' }} />

            <div>
              <h2 className="text-lg font-bold text-[#0B2A4A] mb-4">Documents</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3.5 rounded-xl transition-colors duration-200" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC' }}>
                  <span className="text-sm font-medium text-[#0B2A4A]">📄 Resume</span>
                  <a
                    href={application.resumePath}
                    className="hover:underline text-sm font-medium"
                    style={{ color: '#12B6D6' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </div>
                {application.coverLetterPath && (
                  <div className="flex justify-between items-center p-3.5 rounded-xl transition-colors duration-200" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC' }}>
                    <span className="text-sm font-medium text-[#0B2A4A]">📄 Cover Letter</span>
                    <a
                      href={application.coverLetterPath}
                      className="hover:underline text-sm font-medium"
                      style={{ color: '#12B6D6' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </div>
                )}
                {application.portfolioUrl && (
                  <div className="flex justify-between items-center p-3.5 rounded-xl transition-colors duration-200" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC' }}>
                    <span className="text-sm font-medium text-[#0B2A4A]">🔗 Portfolio URL</span>
                    <a
                      href={application.portfolioUrl}
                      className="hover:underline text-sm font-medium"
                      style={{ color: '#12B6D6' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl p-4 mt-6" style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}>
              <span className="mt-0.5" style={{ color: '#12B6D6' }}>ℹ️</span>
              <p className="text-sm text-[#0B2A4A]">
                <strong>Note:</strong> You cannot edit your application after submission. If you need to make changes, please contact HR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
