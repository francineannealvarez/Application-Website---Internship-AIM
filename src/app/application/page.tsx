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
  applicant_pds?: { resume_url?: string } | null;
};

export default function ApplicationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1fc_0%,_#f8fafc_55%)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-[#00AEEF] hover:underline mb-4 inline-flex items-center gap-1 group">
          <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span> Back to Dashboard
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

            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
              <span className="text-blue-500 mt-0.5">&#8505;&#65039;</span>
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