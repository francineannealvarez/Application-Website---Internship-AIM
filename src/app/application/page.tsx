'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserApplication, mockPositions } from '@/lib/mockData';
import { readDemoUser, readDemoApplication, type DemoUser } from '@/lib/demo-session';
import { getDemoResumeFile, getDemoCoverLetterFile } from '@/lib/demo-files';

// Long base64 data: URLs can be unreliable when opened directly in a new tab
// (some browsers show a blank page). Converting to a blob: URL first fixes this.
function dataUrlToBlobUrl(dataUrl: string): string {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*);base64/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}

type DisplayApplication = {
  fullName: string;
  email: string;
  phone: string;
  positionTitle: string;
  submittedAtLabel: string;
  resumeFileName: string;
  coverLetterFileName?: string | null;
  resumeHref?: string | null;
  coverLetterHref?: string | null;
};

export default function ApplicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [application, setApplication] = useState<DisplayApplication | null>(null);
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
        setApplication({
          fullName: data.user?.name || session?.user?.name || 'N/A',
          email: data.user?.email || session?.user?.email || 'N/A',
          phone: data.phoneNumber || 'N/A',
          positionTitle: data.position?.title || 'N/A',
          submittedAtLabel: data.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : 'N/A',
          resumeFileName: data.resumePath || '',
          coverLetterFileName: data.coverLetterPath || null,
          resumeHref: data.resumePath || null,
          coverLetterHref: data.coverLetterPath || null,
        });
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
          // Prefer the applicant's own freshly-submitted data (saved by the Application Form).
          const submitted = readDemoApplication();
          if (submitted) {
            const resumeFileObj = getDemoResumeFile();
            const coverLetterFileObj = getDemoCoverLetterFile();
            setApplication({
              fullName: submitted.fullName,
              email: submitted.email,
              phone: submitted.phone,
              positionTitle: submitted.positionTitle,
              submittedAtLabel: new Date(submitted.submittedAt).toLocaleDateString(),
              resumeFileName: submitted.resumeFileName,
              coverLetterFileName: submitted.coverLetterFileName,
              resumeHref: resumeFileObj?.dataUrl ? dataUrlToBlobUrl(resumeFileObj.dataUrl) : null,
              coverLetterHref: coverLetterFileObj?.dataUrl ? dataUrlToBlobUrl(coverLetterFileObj.dataUrl) : null,
            });
            setLoading(false);
            return;
          }

          // Fallback: sample/mock data for demo browsing.
          const mockApplication = getUserApplication(demoUser.id);
          if (mockApplication) {
            const mockPosition = mockPositions.find((p) => p.id === mockApplication.positionId);
            setApplication({
              fullName: demoUser.name,
              email: demoUser.email,
              phone: mockApplication.phone || 'N/A',
              positionTitle: mockPosition?.title || 'N/A',
              submittedAtLabel: mockApplication.createdAt ? new Date(mockApplication.createdAt).toLocaleDateString() : 'N/A',
              resumeFileName: mockApplication.resumePath,
              coverLetterFileName: mockApplication.coverLetterPath,
              resumeHref: mockApplication.resumePath,
              coverLetterHref: mockApplication.coverLetterPath,
            });
          } else {
            setApplication(null);
          }
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
                  <p className="font-medium text-[#0B2A4A]">{application.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Email</p>
                  <p className="font-medium text-[#0B2A4A]">{application.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Phone</p>
                  <p className="font-medium text-[#0B2A4A]">{application.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: '#E5E9EC' }} />

            <div>
              <h2 className="text-lg font-bold text-[#0B2A4A] mb-4">Application Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Position Applied</p>
                  <p className="font-medium text-[#0B2A4A]">{application.positionTitle || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Date Submitted</p>
                  <p className="font-medium text-[#0B2A4A]">{application.submittedAtLabel || 'N/A'}</p>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: '#E5E9EC' }} />

            <div>
              <h2 className="text-lg font-bold text-[#0B2A4A] mb-4">Documents</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3.5 rounded-xl transition-colors duration-200" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC' }}>
                  <span className="text-sm font-medium text-[#0B2A4A]">Resume: {application.resumeFileName || 'N/A'}</span>
                  {application.resumeHref ? (
                    <a
                      href={application.resumeHref}
                      className="hover:underline text-sm font-medium"
                      style={{ color: '#12B6D6' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: '#9BAAB8' }}>N/A</span>
                  )}
                </div>
                <div className="flex justify-between items-center p-3.5 rounded-xl transition-colors duration-200" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC' }}>
                  <span className="text-sm font-medium text-[#0B2A4A]">Cover Letter: {application.coverLetterFileName || 'N/A'}</span>
                  {application.coverLetterHref ? (
                    <a
                      href={application.coverLetterHref}
                      className="hover:underline text-sm font-medium"
                      style={{ color: '#12B6D6' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-sm font-medium" style={{ color: '#9BAAB8' }}>N/A</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl p-4 mt-6" style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}>
              <span className="mt-0.5" style={{ color: '#12B6D6' }}>Note:</span>
              <p className="text-sm text-[#0B2A4A]">
                You cannot edit your application after submission. If you need to make changes, please contact HR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
