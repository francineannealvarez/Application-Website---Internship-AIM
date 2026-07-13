'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Check,
  XCircle,
} from 'lucide-react';
import { readDemoUser, clearDemoUser, type DemoUser } from '@/lib/demo-session';
import HiringProcessFlow from '@/components/dashboard/HiringProcessFlow';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type ApplicationRecord = {
  id: string;
  status: string;
  submitted_at?: string;
  updated_at?: string;
  position_title?: string;
  rejection_reason?: string | null;
};

const STAGE_LABELS = ['Submitted', 'Under Review', 'Result'];
const STAGE_ICONS = [FileText, Clock, Sparkles] as const;

function statusToStage(status: string): number {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'SUBMITTED':
      return 0;
    case 'UNDER_REVIEW':
      return 1;
    case 'SHORTLISTED':
    case 'REQUIREMENTS':
      return 2;
    case 'HIRED':
    case 'REJECTED':
      return 3;
    default:
      return 0;
  }
}

function getStepState(stepIdx: number, stage: number): 'completed' | 'active' | 'pending' {
  if (stepIdx === 0) return stage >= 1 ? 'completed' : 'active';
  if (stepIdx === 1) {
    if (stage >= 2) return 'completed';
    if (stage === 1) return 'active';
    return 'pending';
  }
  if (stage === 3) return 'completed';
  if (stage === 2) return 'active';
  return 'pending';
}

const STATUS_BANNER: Record<string, { cls: string; icon: React.ReactNode; text: string }> = {
  SUBMITTED: {
    cls: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
    text: 'Application received! We will start reviewing it soon.',
  },
  UNDER_REVIEW: {
    cls: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
    text: 'Our HR team is currently reviewing your application. This typically takes 3–5 business days.',
  },
  SHORTLISTED: {
    cls: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    text: 'Great news! You have been shortlisted. Check the Requirements page for next steps.',
  },
  REQUIREMENTS: {
    cls: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    text: 'Please upload your required documents before the deadline.',
  },
  HIRED: {
    cls: 'bg-green-50 border-green-200 text-green-900',
    icon: <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />,
    text: 'Congratulations! Welcome to the Arvin family!',
  },
  REJECTED: {
    cls: 'bg-red-50 border-red-200 text-red-900',
    icon: <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
    text: 'Thank you for applying. We will keep your profile on file for future openings.',
  },
};

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  SUBMITTED: { cls: 'bg-green-100 text-green-700', label: 'Submitted' },
  UNDER_REVIEW: { cls: 'bg-yellow-100 text-yellow-700', label: 'Under Review' },
  SHORTLISTED: { cls: 'bg-blue-100 text-blue-700', label: 'Shortlisted' },
  REQUIREMENTS: { cls: 'bg-purple-100 text-purple-700', label: 'Requirements' },
  HIRED: { cls: 'bg-green-100 text-green-700', label: 'Hired' },
  REJECTED: { cls: 'bg-red-100 text-red-700', label: 'Rejected' },
};

function ApplicationStatusCard({
  application,
}: {
  application: ApplicationRecord;
}) {
  const statusKey = (application.status || 'SUBMITTED').toUpperCase();
  const stage = statusToStage(statusKey);
  const bannerConfig = STATUS_BANNER[statusKey] ?? STATUS_BANNER.SUBMITTED;
  const badge = STATUS_BADGE[statusKey] ?? STATUS_BADGE.SUBMITTED;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-shadow duration-300 animate-fade-slide-up delay-2">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Application Status</h3>
            <span
              className={cn(
                'flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
                badge.cls
              )}
            >
              <Check className="w-3 h-3" /> {badge.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Track your application progress</p>
        </div>
        <Link
          href="/application"
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all font-medium flex items-center gap-1.5 shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-gray-500" /> View Application
        </Link>
      </div>

      <div className="p-6">
        <div className="flex items-center mb-8">
          {STAGE_LABELS.map((label, idx) => {
            const Icon = STAGE_ICONS[idx];
            const stepState = getStepState(idx, stage);
            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      stepState === 'completed' &&
                        'bg-green-500 border-green-500 text-white',
                      stepState === 'active' &&
                        'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 animate-pulse-ring',
                      stepState === 'pending' &&
                        'bg-white border-gray-200 text-gray-300'
                    )}
                  >
                    {stepState === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium text-center w-20 leading-tight transition-colors duration-300',
                      stepState === 'completed' && 'text-green-600',
                      stepState === 'active' && 'text-blue-700',
                      stepState === 'pending' && 'text-gray-400'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-3 mb-6 rounded-full transition-colors duration-500',
                      (idx === 0 && stage >= 1) || (idx === 1 && stage >= 2)
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border p-4 text-sm transition-all duration-300 animate-fade-in',
            bannerConfig.cls
          )}
        >
          {bannerConfig.icon}
          <span>{bannerConfig.text}</span>
        </div>

        {application.rejection_reason && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-red-800 font-semibold text-sm mb-1">Rejection Reason</p>
            <p className="text-red-700 text-sm">{application.rejection_reason}</p>
          </div>
        )}

        {(statusKey === 'SHORTLISTED' || statusKey === 'REQUIREMENTS') && (
          <div className="mt-4">
            <Link
              href="/requirements"
              className="block w-full py-3 text-center bg-gradient-to-r from-[#1565C0] to-[#1E88E5] text-white font-semibold rounded-xl hover:from-[#0D47A1] hover:to-[#1565C0] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-sm shadow-md"
            >
              Go to Requirements
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicantDashboard() {
  const router = useRouter();
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = readDemoUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role === 'HR_ADMIN') {
      router.push('/hr/dashboard');
      return;
    }
    setDemoUser(user);
  }, [router]);

  useEffect(() => {
    if (!demoUser?.email) return;

    fetch(`/api/applications?email=${encodeURIComponent(demoUser.email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setApplication(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [demoUser]);

  const handleLogout = () => {
    clearDemoUser();
    router.push('/login');
  };

  if (!demoUser || loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  const name = demoUser.name || 'Applicant';
  const firstName = name.split(' ')[0];
  const currentStage = application ? statusToStage(application.status) : 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1fc_0%,_#f0f5fb_55%)]">
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-[0.2em] bg-gradient-to-r from-[#0D47A1] to-[#1E88E5] bg-clip-text text-transparent">
              ARVIN
            </span>
            <span className="hidden sm:block text-[11px] text-gray-400 border-l border-gray-200 pl-2.5 ml-0.5 leading-tight">
              International
              <br />
              Marketing Inc.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ring-2 ring-blue-50">
                <User className="w-4 h-4 text-blue-700" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div className="relative bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1E88E5] rounded-2xl px-7 py-8 text-white shadow-lg shadow-blue-900/10 overflow-hidden animate-fade-slide-up">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />
          <h1 className="relative text-2xl sm:text-3xl font-bold mb-1.5">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="relative text-blue-100 text-sm sm:text-base">
            Here&apos;s the current status of your application at Arvin International.
          </p>
        </div>

        {!application ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-slide-up delay-1">
            <p className="text-gray-600 mb-4">
              You haven&apos;t submitted an application yet.
            </p>
            <Link
              href="/apply"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-[#1565C0] to-[#1E88E5] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-sm"
            >
              Start Your Application
            </Link>
          </div>
        ) : true ? (
          <HiringProcessFlow applicantName={name} />
        ) : (
          <ApplicationStatusCard application={application} />
        )}
      </div>
    </div>
  );
}