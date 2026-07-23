'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ApplicationWithRelations = {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  status?: string;
  stage?: string;
  date_applied?: string | Date;
  updated_at?: string | Date;
  job_postings?: { title?: string; employment_type?: string | null } | null;
  resume_file_name?: string | null;
  resume_file_size_label?: string | null;
  cover_letter_file_name?: string | null;
  cover_letter_file_size_label?: string | null;
};

type DocType = 'resume' | 'cover-letter';

export default function ApplicationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingDoc, setOpeningDoc] = useState<DocType | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`/api/applications?email=${encodeURIComponent(session.user.email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setApplication(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  async function handleViewDocument(type: DocType) {
    if (!application?.id || !session?.user?.email) return;
    setDocError(null);
    setOpeningDoc(type);
    try {
      const res = await fetch(
        `/api/applications/${application.id}/document?type=${type}&email=${encodeURIComponent(
          session.user.email
        )}`
      );
      if (!res.ok) throw new Error('Failed to get file link');
      const data = await res.json();
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      setDocError('Hindi ma-open ang file. Subukan ulit.');
    } finally {
      setOpeningDoc(null);
    }
  }

  if (status === 'loading' || loading) {
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

  const documents: { type: DocType; label: string; name?: string | null; sizeLabel?: string | null }[] = [
    {
      type: 'resume',
      label: 'Resume',
      name: application.resume_file_name,
      sizeLabel: application.resume_file_size_label,
    },
    {
      type: 'cover-letter',
      label: 'Cover Letter',
      name: application.cover_letter_file_name,
      sizeLabel: application.cover_letter_file_size_label,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1fc_0%,_#f8fafc_55%)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-[#00AEEF] hover:underline mb-4 inline-flex items-center gap-1 group">
          <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden mt-2 animate-fade-slide-up">
         <div className="bg-[#1B3A5C] px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">Your Application</h1>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Full Name</p>
                  <p className="font-medium text-gray-900">{application.full_name || session?.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="font-medium text-gray-900">{application.email || session?.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="font-medium text-gray-900">{application.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Position Applied</p>
                  <p className="font-medium text-gray-900">{application.job_postings?.title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Employment Type</p>
                  <p className="font-medium text-gray-900">{application.job_postings?.employment_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Date Applied</p>
                  <p className="font-medium text-gray-900">
                    {application.date_applied ? new Date(application.date_applied).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Status</p>
                  <p className="font-medium text-gray-900">{application.stage || application.status || 'N/A'}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-2">
                {documents.map((doc) => {
                  const hasFile = !!doc.name;
                  const isLoading = openingDoc === doc.type;
                  return (
                    <div
                      key={doc.type}
                      className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <svg
                          className="w-5 h-5 text-gray-400 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {doc.label}: {doc.name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">{doc.sizeLabel || 'N/A'}</p>
                        </div>
                      </div>
                      {hasFile ? (
                        <button
                          onClick={() => handleViewDocument(doc.type)}
                          disabled={isLoading}
                          className="shrink-0 text-sm font-medium text-[#00AEEF] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Opening...' : 'View'}
                        </button>
                      ) : (
                        <span className="shrink-0 text-sm text-gray-400">N/A</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {docError && <p className="text-sm text-red-600 mt-2">{docError}</p>}
            </div>

            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
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