'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileText, Shield, CreditCard, ClipboardCheck, Calendar, MapPin, Upload, AlertCircle, Building2, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { readDemoUser, type DemoUser } from '@/lib/demo-session';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type DocumentRecord = {
  id: string;
  type: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  fileName?: string | null;
  submittedAt?: string | Date | null;
  uploadedAt?: string | Date | null;
};

type RequirementItem = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  due: string;
  location: string;
  note: string;
  isImportant?: boolean;
  badge: string;
};

function getRequirementItems(): RequirementItem[] {
  return [
    {
      title: 'NBI Clearance',
      subtitle: 'Must be issued within the last 3 months',
      icon: Shield,
      due: 'August 5, 2025',
      location: 'HR Office, Ground Floor, Arvin HQ',
      note: 'Submit the original copy and one photocopy.',
      badge: 'Required',
    },
    {
      title: 'Medical Certificate',
      subtitle: 'From an accredited government physician',
      icon: ClipboardCheck,
      due: 'August 5, 2025',
      location: 'HR Office, Ground Floor, Arvin HQ',
      note: 'Must indicate you are fit for work.',
      badge: 'Required',
    },
    {
      title: 'Valid Government ID',
      subtitle: 'At least 2 valid IDs required',
      icon: CreditCard,
      due: 'August 5, 2025',
      location: 'HR Office, Ground Floor, Arvin HQ',
      note: 'Acceptable IDs: Passport, Driver’s License, UMID, etc.',
      badge: 'Required',
    },
    {
      title: 'SSS / GSIS Number',
      subtitle: 'Photocopy of E-1 form or ID card',
      icon: FileText,
      due: 'August 5, 2025',
      location: 'HR Office, Ground Floor, Arvin HQ',
      note: 'If unavailable, bring the application receipt.',
      badge: 'Required',
    },
    {
      title: 'TIN',
      subtitle: 'Photocopy of BIR Form 1902 or TIN card',
      icon: FileText,
      due: 'August 5, 2025',
      location: 'HR Office, Ground Floor, Arvin HQ',
      note: 'Required for payroll processing.',
      badge: 'Required',
    },
  ];
}

function getDocumentStatus(documents: DocumentRecord[], title: string): 'SUBMITTED' | 'PENDING' {
  const match = documents.find(doc => doc.type.toLowerCase().includes(title.toLowerCase().split(' ')[0]));
  return match?.status === 'SUBMITTED' || match?.status === 'APPROVED' ? 'SUBMITTED' : 'PENDING';
}

function DocumentCard({ item, status }: { item: RequirementItem; status: 'SUBMITTED' | 'PENDING'; }) {
  const Icon = item.icon;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-blue-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900 leading-tight">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
            </div>
            <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0', status === 'SUBMITTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
              {status === 'SUBMITTED' ? 'Submitted' : 'Pending'}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4 text-blue-500 mt-0.5" /><span>{item.due}</span></div>
            <div className="flex items-start gap-2 text-sm text-gray-600 sm:col-span-2"><MapPin className="w-4 h-4 text-blue-500 mt-0.5" /><span>{item.location}</span></div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /><span>{item.note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequirementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoUser] = useState<DemoUser | null>(() => (typeof window !== 'undefined' ? readDemoUser() : null));

  useEffect(() => {
    if (status === 'unauthenticated' && !demoUser) router.push('/login');
  }, [status, demoUser, router]);

  useEffect(() => {
    const load = async () => {
      try {
        if (demoUser?.id) {
          setDocuments([]);
          return;
        }

        const documentsRes = await fetch('/api/documents');
        if (documentsRes.ok) setDocuments(await documentsRes.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (session || demoUser) load();
  }, [session, demoUser, status]);

  if (status === 'loading' || loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (!session && !demoUser) return null;

  const requirementItems = getRequirementItems();
  const submittedCount = requirementItems.filter(item => getDocumentStatus(documents, item.title) === 'SUBMITTED').length;
  const firstName = session?.user?.name?.split(' ')[0] || demoUser?.name?.split(' ')[0] || 'Applicant';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1fc_0%,_#f0f5fb_55%)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="text-xs text-gray-500">{submittedCount} of {requirementItems.length} documents submitted</div>
        </div>

        <div className="bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1E88E5] rounded-3xl px-6 sm:px-8 py-8 text-white shadow-xl shadow-blue-900/10 overflow-hidden relative animate-fade-slide-up">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)', backgroundSize: '22px 22px' }} />
          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-3"><User className="w-3.5 h-3.5" /> Welcome, {firstName}</div>
              <h1 className="text-2xl sm:text-3xl font-bold">Document Requirements</h1>
              <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-2xl">Please prepare and submit the following documents to complete your hiring process. You may upload copies through your dashboard or submit them in person at the HR office.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3 min-w-[150px]"><div className="text-[11px] uppercase tracking-[0.18em] text-blue-100/80">Submitted</div><div className="text-2xl font-bold mt-1">{submittedCount}</div></div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-3 min-w-[150px]"><div className="text-[11px] uppercase tracking-[0.18em] text-blue-100/80">Total Required</div><div className="text-2xl font-bold mt-1">{requirementItems.length}</div></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 mt-6">
          <div className="space-y-4">
            {requirementItems.map((item, idx) => <DocumentCard key={idx} item={item} status={getDocumentStatus(documents, item.title)} />)}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fade-slide-up delay-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3"><Building2 className="w-4 h-4 text-blue-600" /> Submission Details</div>
              <div className="space-y-3 text-sm text-gray-600">
                <div><div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Deadline</div><div className="font-medium text-gray-900">August 5, 2025</div></div>
                <div><div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Location</div><div className="font-medium text-gray-900">HR Office, Ground Floor, Arvin HQ, BGC Taguig</div></div>
                <div><div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Office Hours</div><div className="font-medium text-gray-900">9:00 AM - 5:00 PM, Monday to Friday</div></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fade-slide-up delay-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3"><Upload className="w-4 h-4 text-blue-600" /> Upload Status</div>
              <div className="space-y-3">
                {requirementItems.map((item, idx) => {
                  const status = getDocumentStatus(documents, item.title);
                  return (
                    <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-gray-600 truncate">{item.title}</span>
                      <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0', status === 'SUBMITTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                        {status === 'SUBMITTED' ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 animate-fade-slide-up delay-3">
              <div className="text-sm font-semibold text-blue-900 mb-2">Need help?</div>
              <p className="text-sm text-blue-800 leading-relaxed">If you are unsure about any requirement, contact HR before the deadline so your application is not delayed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}