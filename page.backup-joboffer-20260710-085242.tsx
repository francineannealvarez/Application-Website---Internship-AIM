'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Clock, Sparkles, CheckCircle2,
  MessageSquare, PenLine, Users, ClipboardCheck, ListChecks,
  Calendar, MapPin, Link2, AlertCircle,
  ChevronDown, Shield, CreditCard, Hash,
  LogOut, Building2, User, Check, Banknote
} from 'lucide-react';

import { getUserApplication, mockPositions } from '@/lib/mockData';
import { clearDemoUser, readDemoUser, readDemoApplication, type DemoUser } from '@/lib/demo-session';
import PersonalDataSheetContent from '@/components/dashboard/PersonalDataSheetContent';
import AssessmentContent from '@/components/dashboard/AssessmentContent';
import BackgroundCheckContent from '@/components/dashboard/BackgroundCheckContent';
import OnboardingContent from '@/components/dashboard/OnboardingContent';
import SRAContent from '@/components/dashboard/SRAContent';
import JobOfferContent from '@/components/dashboard/JobOfferContent';
import StepGate from '@/components/dashboard/StepGate';
import { readStepSchedule, type StepSchedule } from '@/lib/schedule-store';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type DocStatus = 'Submitted' | 'Pending';

const STAGE_LABELS = ['Submitted', 'Under Review', 'Result'];
const STAGE_ICONS = [FileText, Clock, Sparkles] as const;

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

const STATUS_BANNER: Record<number, { cls: string; icon: React.ReactNode; text: string }> = {
  0: { cls: 'text-[#0B2A4A]', icon: <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />, text: 'Application received! We will start reviewing it soon.' },
  1: { cls: 'text-[#0B2A4A]', icon: <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />, text: 'Our HR team is currently reviewing your application. This typically takes 3-5 business days.' },
  2: { cls: 'text-amber-900', icon: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />, text: 'The hiring committee is currently deliberating. Expect a response within 5 business days.' },
  3: { cls: 'text-green-900', icon: <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />, text: 'Congratulations! You passed the initial screening and are eligible for the next step.' }
};

const STATUS_BANNER_STYLE: Record<number, React.CSSProperties> = {
  0: { backgroundColor: '#EEF9FB' },
  1: { backgroundColor: '#EEF9FB' },
  2: {},
  3: {}
};

function ApplicationStatusCard({ stage, onContinue, setApplicationStage }: { stage: number; onContinue: () => void; setApplicationStage: (n: number) => void; }) {
  const bannerConfig = STATUS_BANNER[stage] ?? { cls: '', icon: null, text: '' };
  const bannerStyle = STATUS_BANNER_STYLE[stage] ?? {};
  const bannerExtraCls = stage === 2 ? 'bg-amber-50 border border-amber-200' : stage === 3 ? 'bg-green-50 border border-green-200' : '';
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-[#E5E9EC] overflow-hidden transition-shadow duration-300 animate-fade-slide-up delay-2">
      <div className="px-6 py-4 border-b border-[#E5E9EC] flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#0B2A4A]">Application Status</h3>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              <Check className="w-3 h-3" /> Submitted
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>Track your application progress</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/application" className="text-xs px-3 py-1.5 rounded-lg border text-[#0B2A4A] hover:bg-[#F7F9FA] active:scale-95 transition-all font-medium flex items-center gap-1.5" style={{ borderColor: '#E5E9EC' }}>
            <FileText className="w-3.5 h-3.5" style={{ color: '#6B7A8D' }} /> View Application
          </Link>
          {stage < 3 && (
            <button onClick={() => setApplicationStage(Math.min(stage + 1, 3))} className="text-xs px-3 py-1.5 rounded-lg border border-dashed text-[#9BAAB8] hover:bg-[#F7F9FA] active:scale-95 transition-all font-medium" style={{ borderColor: '#D1DAE3' }}>
              Simulate Next Stage &rarr;
            </button>
          )}
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex items-center mb-8 max-w-xl mx-auto">
          {STAGE_LABELS.map((label, idx) => {
            const Icon = STAGE_ICONS[idx];
            const stepState = getStepState(idx, stage);
            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className={cn('w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300', stepState === 'pending' && 'bg-white text-[#D1DAE3]')}
                    style={
                      stepState === 'completed' ? { backgroundColor: '#12B6D6', borderColor: '#12B6D6', color: '#fff' }
                      : stepState === 'active' ? { backgroundColor: '#0B2A4A', borderColor: '#0B2A4A', color: '#fff', boxShadow: '0 0 0 5px rgba(11,42,74,0.12)' }
                      : { borderColor: '#E5E9EC' }
                    }>
                    {stepState === 'completed' ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={cn('text-xs font-medium text-center w-20 leading-tight transition-colors duration-300')}
                    style={{ color: stepState === 'completed' ? '#12B6D6' : stepState === 'active' ? '#0B2A4A' : '#9BAAB8' }}>{label}</span>
                </div>
                {idx < 2 && <div className="flex-1 h-0.5 mx-3 mb-6 rounded-full transition-colors duration-500" style={{ backgroundColor: (idx === 0 && stage >= 1) || (idx === 1 && stage >= 2) ? '#12B6D6' : '#E5E9EC' }} />}
              </React.Fragment>
            );
          })}
        </div>
        <div className={cn('flex items-start gap-3 rounded-xl p-4 text-sm transition-all duration-300 animate-fade-in', bannerConfig.cls, bannerExtraCls)} style={bannerStyle}>
          {bannerConfig.icon}<span>{bannerConfig.text}</span>
        </div>
        {stage === 3 && (
          <div className="mt-4 animate-fade-slide-up">
            <button onClick={onContinue} className="w-full py-3 text-white font-semibold rounded-lg hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-sm shadow-sm" style={{ backgroundColor: '#0B2A4A' }}>
              Continue to Hiring Process
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type StepKey = 'initial' | 'pds' | 'sri' | 'assessment' | 'background' | 'department' | 'joboffer' | 'requirements' | 'onboarding';

function buildHiringSteps(includeSri: boolean): { key: StepKey; label: string; sublabel: string; Icon: React.ElementType }[] {
  const steps: { key: StepKey; label: string; sublabel: string; Icon: React.ElementType }[] = [
    { key: 'initial', label: 'Initial Interview', sublabel: 'HR Screening', Icon: MessageSquare },
    { key: 'pds', label: 'Personal Data Sheet', sublabel: 'Complete your PDS', Icon: FileText },
  ];
  if (includeSri) {
    steps.push({ key: 'sri', label: 'SRA (Verbal Test)', sublabel: 'Clerk & Checker applicants only', Icon: ListChecks });
  }
  steps.push(
    { key: 'assessment', label: 'Assessment', sublabel: 'Aptitude & Personality', Icon: PenLine },
    { key: 'department', label: 'Final Interview', sublabel: 'With Department Head', Icon: Users },
    { key: 'background', label: 'Character & Background Check', sublabel: 'Authorization Form', Icon: Shield },
    { key: 'joboffer', label: 'Job Offer', sublabel: 'Offer Details', Icon: Banknote },
    { key: 'requirements', label: 'Requirements', sublabel: 'Document Submission', Icon: ClipboardCheck },
    { key: 'onboarding', label: 'Onboarding', sublabel: 'Welcome to Arvin!', Icon: Sparkles },
  );
  return steps;
}

const STEP_DETAILS = [
  { date: 'July 20, 2026', time: '10:00 AM', venue: null, platform: null, instructions: 'Please wait for a text message from HR regarding your Initial Interview schedule. Make sure your Viber is ready and reachable, as HR will call you there.' },
  { date: 'July 29, 2025', time: '2:00 PM', venue: 'Arvin International Marketing Inc. - 18th Floor, Y Tower Building, Corner Coral Way St., Macapagal Ave., Brgy. 76, Pasay City', platform: null, instructions: 'This is a technical interview with your prospective department head. Review your application thoroughly and be prepared to discuss your relevant experience in detail.' },
];

// ---- Requirements data ----

const REQUIREMENTS_MAIN = [
  { label: 'Medical Certificate', note: 'From an accredited government physician', Icon: ClipboardCheck },
  { label: 'SSS ID / E-1 Form', note: 'Photocopy of SSS ID or E-1 form', Icon: Hash },
  { label: 'PhilHealth ID / MDR', note: 'Photocopy of PhilHealth ID or MDR', Icon: Shield },
  { label: 'Pag-IBIG ID / MDF', note: 'Photocopy of Pag-IBIG ID or Members Data Form', Icon: CreditCard },
  { label: 'TIN No.', note: 'Photocopy of BIR Form 1902 or TIN card', Icon: FileText },
  { label: 'Birth Certificate', note: 'PSA-issued copy', Icon: FileText },
  { label: "Marriage Certificate", note: 'If applicable - PSA-issued copy', Icon: FileText },
  { label: "Children's Birth Certificate(s)", note: 'If applicable - PSA-issued copy', Icon: FileText },
  { label: 'School Diploma', note: 'Photocopy of diploma', Icon: FileText },
  { label: 'Transcript of Records', note: 'Photocopy from your school registrar', Icon: FileText },
  { label: "Driver's License", note: 'For driver applicants only', Icon: CreditCard },
  { label: 'Training & Seminar Certificates', note: 'If applicable', Icon: ClipboardCheck },
  { label: 'NBI Clearance', note: 'Original copy, issued within the last 3 months', Icon: Shield },
  { label: 'Police Clearance', note: 'Original copy', Icon: Shield },
  { label: 'Barangay Clearance', note: 'Original copy', Icon: Shield },
  { label: 'ID Pictures (1x1 & 2x2)', note: 'White background', Icon: CreditCard },
];

const REQUIREMENTS_PREV_EMPLOYER = [
  { label: 'BIR Form 2316', note: 'From your previous employer', Icon: FileText },
  { label: 'Certificate of Employment', note: 'From your previous employer', Icon: FileText },
  { label: 'Latest Pay Slip', note: 'At least 1 month, from your previous employer', Icon: FileText },
  {
    label: 'SSS / Pag-IBIG Loan Status Form',
    note: 'If with an existing SSS/Pag-IBIG loan: submit an updated Statement of Account (photocopy) with your payment arrangement. If without a loan: submit the printed online status confirming you have no existing loan.',
    Icon: Hash
  },
];

const REQUIREMENTS_BDO = [
  { label: '1x1 ID Picture', note: 'White background', Icon: CreditCard },
  { label: 'Photocopy of 2 Different Government-Issued IDs', note: 'Or an original Police Clearance', Icon: Shield },
];

const REQUIREMENTS_PREV_EMPLOYER_START = REQUIREMENTS_MAIN.length;
const REQUIREMENTS_BDO_START = REQUIREMENTS_MAIN.length + REQUIREMENTS_PREV_EMPLOYER.length;
const REQUIREMENTS_TOTAL = REQUIREMENTS_MAIN.length + REQUIREMENTS_PREV_EMPLOYER.length + REQUIREMENTS_BDO.length;

const GUIDES: { id: string; title: string; steps: string[]; note?: string; link?: { label: string; href: string }; extraList?: { heading: string; items: string[] } }[] = [
  {
    id: 'pagibig',
    title: 'How to Apply for the Pag-IBIG Members Data Form (MDF)',
    steps: [
      'Go to the official Pag-IBIG website (pagibigfund.gov.ph) and click the Member Services link.',
      'Click the Online Membership Registration menu.',
      "Select Register as New Member and click Continue if you don't have a previous Pag-IBIG number. If you already have an existing ID number, select Update Registration Information using your Pag-IBIG Membership ID (MID) number instead, then click Continue.",
      'A code will be displayed in image form - type it correctly in the provided textbox, then click Proceed.',
      'The MDR form will now be displayed. Fully accomplish the form, then click Submit.',
      'You will be notified with a "Successful Registration Page" notice.',
      'Click Print MDF.',
      'Secure your copy of the printed MDF and take note of the RTN, located at the upper-left corner of your MDF.',
    ]
  },
  {
    id: 'philhealth',
    title: 'How to Apply for a PhilHealth MDR / PhilHealth ID',
    steps: [
      'Proceed to your nearest PhilHealth office.',
      'Fill up the PhilHealth Member Registration Form (PMRF).',
      'Provide the following attachments upon submission of the form (whichever is applicable).',
      'Claim your PhilHealth MDR/ID upon submission of the form.',
    ],
    extraList: {
      heading: 'Attachments (whichever is applicable)',
      items: [
        'Birth Certificate',
        'Marriage Certificate (if applicable)',
        "Children's Birth Certificate (if applicable)",
        "For those with parents above 60 years old: Birth Certificate of parent, Senior Citizen's ID, or Voter's ID",
      ]
    },
    link: { label: 'Download the PMRF Form', href: 'http://www.philhealth.gov.ph/forms/membership/prmf.pdf' }
  },
  {
    id: 'bir',
    title: 'How to Change Your BIR Revenue District Office (RDO) - BIR Form 1905',
    steps: [
      'Proceed to the BIR office where your TIN is currently registered.',
      'Fill up BIR Form 1905 (Application for Registration Update).',
      'Under Section 4E, indicate transfer to the New RDO: 064.',
      'File and submit the form to the BIR office.',
      'Submit a photocopy of the received/stamped Form 1905 to HR.',
    ]
  },
  {
    id: 'sss',
    title: 'SSS: Register Your Account & Check Your Loan Status',
    note: 'Before starting, please make sure you have on hand: your SSS number, your email account, and the SSS number of your previous employer.',
    steps: [
      'Part 1 - Register for My.SSS Account',
      'Go to the official SSS website (sss.gov.ph) and click Register Now in the My.SSS section.',
      'Select Member as the type of user and click Submit.',
      'Supply the necessary information, enter the code shown in the box, then click Submit.',
      'SSS will send you an email - open it to proceed with the registration.',
      'Open your email account and check the email from SSS (noreply@sss.gov.ph).',
      'Open the email and click the link to proceed. You will be directed back to the SSS website.',
      'Fill in the necessary information for online Member User ID registration.',
      'Select Employed under the Current Membership Registration Status.',
      "Encode the SSS number of your previous employer.",
      'Click "I Accept" on the Terms and Conditions, then click Submit.',
      'Click OK when prompted with a message from the webpage.',
      'SSS will send another email - open it again to check your registration status.',
      'Part 2 - Check Your Loan Status',
      'Go back to sss.gov.ph.',
      'Supply your User ID and Password at the Member Log In section, then click Submit.',
      'Once logged in, click Online Inquiry.',
      'A pop-up window will display your Employee Static Information.',
      'Click the Loan Status tab - a pop-up window will show your Loan Status Information.',
      'Print the Loan Status Page.',
    ]
  },
];

function StepDetailContent({ stepIdx, isCurrent }: { stepIdx: number; isCurrent: boolean }) {
  const detail = STEP_DETAILS[stepIdx];
  const stepKey = stepIdx === 0 ? 'initial-interview' : 'department-interview';
  const [schedule] = useState<StepSchedule | null>(() => (typeof window !== 'undefined' ? readStepSchedule(stepKey) : null));
  if (!detail) return null;
  const displayDate = schedule?.date ?? detail.date;
  const displayTime = schedule?.time ?? detail.time;
  return (
    <div className="space-y-3 pt-3">
      <div className="flex items-center gap-2.5 text-sm text-[#0B2A4A]">
        <Calendar className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
        {displayDate ? (
          <span><span className="font-semibold">{displayDate}</span><span style={{ color: '#6B7A8D' }}> at {displayTime}</span></span>
        ) : (
          <span style={{ color: '#6B7A8D' }}>Schedule to be announced by HR</span>
        )}
      </div>
      {detail.venue ? (
        <div className="flex items-start gap-2.5 text-sm text-[#0B2A4A]">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
          <span>
            <span className="inline-block mr-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF9FB', color: '#12B6D6' }}>Face-to-Face</span>
            {detail.venue}
          </span>
        </div>
      ) : detail.platform ? (
        <div className="flex items-start gap-2.5 text-sm">
          <Link2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
          <span>
            <span className="inline-block mr-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF9FB', color: '#12B6D6' }}>Online</span>
            <a href={detail.platform} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: '#12B6D6' }}>{detail.platform}</a>
          </span>
        </div>
      ) : null}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-sm text-amber-800">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><span>{detail.instructions}</span>
      </div>
      {isCurrent && (
        <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: '#F7F9FA', color: '#6B7A8D' }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: '#9BAAB8' }} /><span>Awaiting HR confirmation. HR will mark this step as complete once finished.</span>
        </div>
      )}
    </div>
  );
}

function ReqCollapsible({ title, subtitle, defaultOpen = false, children }: { title: string; subtitle?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/[0.02] transition-colors">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: '#0B2A4A' }}>{title}</div>
          {subtitle && <div className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>{subtitle}</div>}
        </div>
        <ChevronDown className={cn('w-4 h-4 shrink-0 transition-transform duration-200', open && 'rotate-180')} style={{ color: '#9BAAB8' }} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t animate-fade-slide-up">
          {children}
        </div>
      )}
    </div>
  );
}

function GuideAccordion({ guide }: { guide: (typeof GUIDES)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/[0.02] transition-colors">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #EEF9FB 0%, #D6F4FA 100%)' }}>
          <Link2 className="w-4 h-4" style={{ color: '#12B6D6' }} />
        </div>
        <div className="flex-1 min-w-0 text-sm font-semibold" style={{ color: '#0B2A4A' }}>{guide.title}</div>
        <ChevronDown className={cn('w-4 h-4 shrink-0 transition-transform duration-200', open && 'rotate-180')} style={{ color: '#9BAAB8' }} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t space-y-3 animate-fade-slide-up">
          {guide.note && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /><span>{guide.note}</span>
            </div>
          )}
          <ol className="space-y-2">
            {guide.steps.map((step, i) => {
              const isSubheading = step.startsWith('Part ');
              if (isSubheading) {
                return (
                  <li key={i} className="text-xs font-bold uppercase tracking-wide pt-2" style={{ color: '#12B6D6' }}>{step}</li>
                );
              }
              return (
                <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: '#0B2A4A' }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: '#EEF9FB', color: '#12B6D6' }}>{i + 1}</span>
                  <span style={{ color: '#6B7A8D' }}>{step}</span>
                </li>
              );
            })}
          </ol>
          {guide.extraList && (
            <div className="rounded-xl p-3.5" style={{ backgroundColor: '#F7F9FA' }}>
              <div className="text-xs font-semibold mb-1.5" style={{ color: '#0B2A4A' }}>{guide.extraList.heading}</div>
              <ul className="space-y-1 list-disc list-inside">
                {guide.extraList.items.map((item, i) => (
                  <li key={i} className="text-xs" style={{ color: '#6B7A8D' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {guide.link && (
            <a href={guide.link.href} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline" style={{ color: '#12B6D6' }}>
              <Link2 className="w-3.5 h-3.5" /> {guide.link.label}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

type StoredReqFile = { name: string; type: string; dataUrl: string };

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

function RequirementRow({ label, note, Icon, status, file, onUpload }: {
  label: string; note: string; Icon: React.ElementType; status: DocStatus;
  file: StoredReqFile | null; onUpload: (file: File) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isSubmitted = status === 'Submitted' && file;

  return (
    <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E5E9EC] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #EEF9FB 0%, #D6F4FA 100%)' }}><Icon className="w-4 h-4" style={{ color: '#12B6D6' }} /></div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#0B2A4A]">{label}</div>
        <div className="text-xs mt-0.5 truncate" style={{ color: '#6B7A8D' }}>{isSubmitted ? file!.name : note}</div>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
      {isSubmitted ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <a href={dataUrlToBlobUrl(file!.dataUrl)} target="_blank" rel="noreferrer"
            className="text-xs font-semibold px-2.5 py-1 rounded-full hover:underline" style={{ color: '#12B6D6' }}>
            View
          </a>
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 shrink-0">
            <Check className="w-3 h-3" /> Submitted
          </span>
          <button type="button" onClick={() => inputRef.current?.click()}
            className="text-xs font-medium px-2 py-1 rounded-full hover:bg-black/5 shrink-0" style={{ color: '#9BAAB8' }}>
            Replace
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-[#EEF9FB] hover:text-[#12B6D6] transition-colors shrink-0">
          <Clock className="w-3 h-3" /> Upload
        </button>
      )}
    </div>
  );
}

function RequirementsContent({ docStatuses, docFiles, onDocUpload, isCurrent }: {
  docStatuses: DocStatus[]; docFiles: (StoredReqFile | null)[]; onDocUpload: (idx: number, file: File) => void; isCurrent: boolean;
}) {
  return (
    <div className="pt-3 space-y-4">
      <div>
        <h4 className="font-semibold text-[#0B2A4A] text-sm">Document Requirements</h4>
        <p className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>Please prepare and submit the following before your scheduled deadline. Upload a clear photo or PDF scan of each document.</p>
      </div>

      <div className="space-y-2">
        {REQUIREMENTS_MAIN.map(({ label, note, Icon }, idx) => (
          <RequirementRow key={idx} label={label} note={note} Icon={Icon}
            status={docStatuses[idx]} file={docFiles[idx]} onUpload={(file) => onDocUpload(idx, file)} />
        ))}
      </div>

      <ReqCollapsible title="Additional Requirements - If You Previously Worked Elsewhere" subtitle="Only applicable if you have prior employment">
        <div className="space-y-2">
          {REQUIREMENTS_PREV_EMPLOYER.map((r, idx) => {
            const globalIdx = REQUIREMENTS_PREV_EMPLOYER_START + idx;
            return (
              <RequirementRow key={idx} label={r.label} note={r.note} Icon={r.Icon}
                status={docStatuses[globalIdx]} file={docFiles[globalIdx]} onUpload={(file) => onDocUpload(globalIdx, file)} />
            );
          })}
        </div>
      </ReqCollapsible>

      <ReqCollapsible title="Additional Requirements - BDO Payroll Account Application" subtitle="Only applicable when opening a BDO account">
        <div className="space-y-2">
          {REQUIREMENTS_BDO.map((r, idx) => {
            const globalIdx = REQUIREMENTS_BDO_START + idx;
            return (
              <RequirementRow key={idx} label={r.label} note={r.note} Icon={r.Icon}
                status={docStatuses[globalIdx]} file={docFiles[globalIdx]} onUpload={(file) => onDocUpload(globalIdx, file)} />
            );
          })}
        </div>
      </ReqCollapsible>

      <div>
        <h4 className="font-semibold text-sm mb-2" style={{ color: '#0B2A4A' }}>Need Help Applying or Updating These IDs?</h4>
        <div className="space-y-2">
          {GUIDES.map((guide) => <GuideAccordion key={guide.id} guide={guide} />)}
        </div>
      </div>

      <div className="rounded-xl px-5 py-5 space-y-4" style={{ backgroundColor: '#EEF9FB' }}>
        <div className="flex items-start gap-3"><Calendar className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} /><div><div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#12B6D6' }}>Submission Deadline</div><div className="text-sm font-bold text-[#0B2A4A] mt-0.5">August 5, 2025</div></div></div>
        <div className="flex items-start gap-3"><MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} /><div><div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#12B6D6' }}>Submission Venue</div><div className="text-sm font-bold text-[#0B2A4A] mt-0.5">Arvin International Marketing Inc. — 18th Floor, Y Tower Building, Corner Coral Way St., Macapagal Ave., Brgy. 76, Pasay City</div></div></div>
        <div className="flex items-start gap-3"><Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} /><div><div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#12B6D6' }}>Office Hours</div><div className="text-sm font-bold text-[#0B2A4A] mt-0.5">8:00 AM - 6:00 PM, Monday to Friday</div></div></div>
      </div>

      {isCurrent && (
        <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: '#F7F9FA', color: '#6B7A8D' }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: '#9BAAB8' }} /><span>HR will mark each document as submitted and complete this step once all requirements are received.</span>
        </div>
      )}
    </div>
  );
}

function HiringProcessCard({ steps, completedSteps, docStatuses, docFiles, onDocUpload, onSimulateHrComplete, applicantName, onWithdraw }: { steps: ReturnType<typeof buildHiringSteps>; completedSteps: number; docStatuses: DocStatus[]; docFiles: (StoredReqFile | null)[]; onDocUpload: (idx: number, file: File) => void; onSimulateHrComplete: () => void;  applicantName: string; onWithdraw: (reason: string) => void; }) {
  const totalSteps = steps.length;
  const [expandedStep, setExpandedStep] = useState<number | null>(completedSteps < totalSteps ? completedSteps : null);
  const handleRowClick = (idx: number) => { if (idx > completedSteps) return; setExpandedStep(prev => prev === idx ? null : idx); };
  const circleState = (idx: number): 'completed' | 'active' | 'locked' => { if (idx < completedSteps) return 'completed'; if (idx === completedSteps) return 'active'; return 'locked'; };
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-[#E5E9EC] overflow-hidden transition-shadow duration-300 animate-fade-slide-up delay-2">
      <div className="h-1.5" style={{ backgroundColor: '#0B2A4A' }} />
      <div className="px-6 py-4 border-b border-[#E5E9EC] flex items-center justify-between gap-2 flex-wrap">
        <div><h3 className="font-bold text-[#0B2A4A] tracking-widest text-sm">HIRING PROCESS</h3><p className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>Click on each stage to view details</p></div>
        <div className="flex items-center gap-2 shrink-0">
          {completedSteps < totalSteps && <button onClick={onSimulateHrComplete} className="text-xs px-3 py-1.5 rounded-lg border border-dashed text-[#9BAAB8] hover:bg-[#F7F9FA] active:scale-95 transition-all font-medium">Simulate HR Update &rarr;</button>}
          <span className="text-xs font-bold px-3 py-1 text-white rounded-full shadow-sm" style={{ backgroundColor: '#0B2A4A' }}>Active</span>
        </div>
      </div>
      <div className="flex items-start px-6 sm:px-10 pt-6 pb-4 w-full overflow-x-auto">
        {steps.map(({ Icon }, idx) => {
          const state = circleState(idx);
          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all', state === 'locked' && 'bg-white text-[#D1DAE3]')}
                  style={
                    state === 'completed' ? { backgroundColor: '#12B6D6', borderColor: '#12B6D6', color: '#fff' }
                    : state === 'active' ? { backgroundColor: '#0B2A4A', borderColor: '#0B2A4A', color: '#fff', boxShadow: '0 0 0 4px rgba(11,42,74,0.12)' }
                    : { borderColor: '#E5E9EC' }
                  }>
                  {state === 'completed' ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight max-w-[64px]" style={{ color: state === 'completed' ? '#12B6D6' : state === 'active' ? '#0B2A4A' : '#D1DAE3' }}>{steps[idx].label}</span>
              </div>
              {idx < totalSteps - 1 && <div className="flex-1 h-0.5 min-w-[16px] mx-1.5 mt-5 rounded-full transition-colors duration-500" style={{ backgroundColor: idx < completedSteps ? '#12B6D6' : '#E5E9EC' }} />}
            </React.Fragment>
          );
        })}
      </div>
      <div className="px-4 sm:px-6 pb-5 space-y-2">
        {(() => {
          const idx = completedSteps < totalSteps ? completedSteps : totalSteps - 1;
          const step = steps[idx];
          const isCompleted = idx < completedSteps;
          const isCurrent = idx === completedSteps && completedSteps < totalSteps;
          return (
            <div key={step.key} className={cn('rounded-xl border transition-all duration-200', isCompleted && 'border-green-100 bg-green-50/30')}
              style={isCurrent ? { borderColor: '#B8EAF3', backgroundColor: '#EEF9FB' } : {}}>
              <div className="w-full flex items-center gap-3 px-4 py-3.5 text-left rounded-xl">
                <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', isCompleted && 'bg-green-500')} style={isCurrent ? { backgroundColor: '#12B6D6' } : {}} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#0B2A4A]">{step.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>{step.sublabel}</div>
                </div>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full shrink-0', isCompleted && 'bg-green-100 text-green-700')}
                  style={isCurrent ? { backgroundColor: '#0B2A4A', color: '#fff' } : {}}>{isCompleted ? 'Done' : isCurrent ? 'Current' : 'Pending'}</span>
              </div>
              <div className="px-4 pb-4 border-t border-[#E5E9EC]/80 animate-fade-slide-up">
                {step.key === 'initial' ? (
                  <StepGate stepLabel="Initial Interview" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {() => <StepDetailContent stepIdx={0} isCurrent={isCurrent} />}
                  </StepGate>
                ) : step.key === 'pds' ? (
                  <PersonalDataSheetContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : step.key === 'sri' ? (
                  <StepGate stepLabel="SRA (Verbal Test)" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {(markSubmitted) => <SRAContent isCurrent={isCurrent} onSubmit={markSubmitted} />}
                  </StepGate>
                ) : step.key === 'assessment' ? (
                  <AssessmentContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : step.key === 'background' ? (
                  <StepGate stepLabel="Character & Background Check" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {(markSubmitted) => <BackgroundCheckContent isCurrent={isCurrent} onSubmit={markSubmitted} />}
                  </StepGate>
                ) : step.key === 'department' ? (
                  <StepGate stepLabel="Final Interview" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {() => <StepDetailContent stepIdx={1} isCurrent={isCurrent} />}
                  </StepGate>
                ) : step.key === 'joboffer' ? (
                  <StepGate stepLabel="Job Offer" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {() => <JobOfferContent isCurrent={isCurrent} applicantName={applicantName} />}
                  </StepGate>
                ) : step.key === 'requirements' ? (
                  <StepGate stepLabel="Requirements Submission" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {() => <RequirementsContent docStatuses={docStatuses} docFiles={docFiles} onDocUpload={onDocUpload} isCurrent={isCurrent} />}
                  </StepGate>
                ) : (
                  <OnboardingContent isCurrent={isCurrent} />
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function ProceedModal({ open, onCancel, onConfirm, includeSri }: { open: boolean; onCancel: () => void; onConfirm: () => void; includeSri: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(11,42,74,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-scale-in">
        <h2 className="text-lg font-bold text-[#0B2A4A] mb-2 text-center">Proceed with your application?</h2>
        <p className="text-sm mb-6 leading-relaxed text-justify" style={{ color: '#6B7A8D' }}>Do you want to proceed with your application to the next stage? You will move on to the <strong className="text-[#0B2A4A]">Initial Interview</strong>, <strong className="text-[#0B2A4A]">Personal Data Sheet</strong>{includeSri && <>, <strong className="text-[#0B2A4A]">SRA (Verbal Test)</strong></>}, <strong className="text-[#0B2A4A]">Assessment</strong>, <strong className="text-[#0B2A4A]">Final Interview</strong>, <strong className="text-[#0B2A4A]">Character & Background Check</strong>, and <strong className="text-[#0B2A4A]">Requirements</strong> submission.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border text-[#0B2A4A] font-semibold rounded-lg hover:bg-[#F7F9FA] transition-colors text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-white font-semibold rounded-lg hover:opacity-90 transition-all text-sm shadow-sm" style={{ backgroundColor: '#0B2A4A' }}>Yes, Continue</button>
        </div>
      </div>
    </div>
  );
}

function CongratsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(11,42,74,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-7 text-center animate-scale-in">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse-ring" />
          <div className="relative w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"><Sparkles className="w-8 h-8 text-green-600" /></div>
        </div>
        <h2 className="text-xl font-bold text-[#0B2A4A] mb-2">Congratulations!</h2>
        <p className="text-sm mb-5 leading-relaxed" style={{ color: '#6B7A8D' }}>You have successfully completed every step of the hiring process. Welcome to the Arvin family!</p>
        <div className="rounded-xl p-4 mb-6 text-left space-y-2" style={{ backgroundColor: '#EEF9FB' }}>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#0B2A4A]"><Building2 className="w-4 h-4" style={{ color: '#12B6D6' }} />About Arvin International Marketing Inc.</div>
          <p className="text-xs leading-relaxed text-justify text-[#0B2A4A]/80">Arvin International Marketing Inc. is a Philippine-based company committed to delivering quality products and services while fostering growth, integrity, and excellence among its people. Our HR team will be in touch shortly with details on your onboarding, start date, and the documents you need to complete employment.</p>
        </div>
        <button onClick={onClose} className="w-full py-2.5 text-white font-semibold rounded-lg hover:opacity-90 transition-all text-sm shadow-sm" style={{ backgroundColor: '#0B2A4A' }}>OK</button>
      </div>
    </div>
  );
}

export default function ApplicantDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [demoUser] = useState<DemoUser | null>(() => (typeof window !== 'undefined' ? readDemoUser() : null));
  const application = (session?.user?.id ?? demoUser?.id) ? getUserApplication((session?.user?.id ?? demoUser?.id) as string) : undefined;
  const [demoApplication] = useState(() => (typeof window !== 'undefined' ? readDemoApplication() : null));

  const positionTitle =
    demoApplication?.positionTitle ||
    mockPositions.find((p) => p.id === application?.positionId)?.title ||
    '';
  const includeSri = positionTitle === 'Clerk' || positionTitle === 'Checker';
  const steps = buildHiringSteps(includeSri);

  const [applicationStage, setApplicationStage] = useState(0);
  const [showHiringProcess, setShowHiringProcess] = useState(false);
  const [hiringCompletedSteps, setHiringCompletedSteps] = useState(0);
  const [docStatuses, setDocStatuses] = useState<DocStatus[]>(Array(REQUIREMENTS_TOTAL).fill('Pending'));
  const [docFiles, setDocFiles] = useState<(StoredReqFile | null)[]>(Array(REQUIREMENTS_TOTAL).fill(null));
  const [modalOpen, setModalOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');

  const handleWithdraw = (reason: string) => {
    setWithdrawReason(reason);
    setWithdrawn(true);
  };

  useEffect(() => {
    if (status === 'unauthenticated' && !demoUser) {
      router.push('/');
    }
  }, [status, demoUser, router]);

  const handleDocUpload = (idx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setDocFiles((prev) => prev.map((f, i) => (i === idx ? { name: file.name, type: file.type, dataUrl } : f)));
      setDocStatuses((prev) => prev.map((s, i) => (i === idx ? 'Submitted' : s)));
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateHrComplete = () => {
    setHiringCompletedSteps(prev => {
      const next = Math.min(prev + 1, steps.length);
      if (next === steps.length) {
        setDocStatuses(Array(REQUIREMENTS_TOTAL).fill('Submitted'));
        setCongratsOpen(true);
      }
      return next;
    });
  };

  if (status === 'loading') return <div className="flex items-center justify-center h-screen" style={{ color: '#6B7A8D' }}>Loading...</div>;
  if (!session && !demoUser) return null;

  const name = session?.user?.name || demoUser?.name || 'Applicant';
  const firstName = name.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#E5E9EC] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Arvin International logo" className="h-9 w-9 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight" style={{ color: '#0B2A4A' }}>Arvin International Marketing Inc.</span>
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#12B6D6' }}>Applicant Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center ring-2" style={{ background: 'linear-gradient(135deg, #EEF9FB 0%, #D6F4FA 100%)', boxShadow: '0 0 0 2px #F7F9FA' }}><User className="w-4 h-4" style={{ color: '#12B6D6' }} /></div>
              <span className="hidden sm:block text-sm font-medium text-[#0B2A4A]">{name}</span>
            </div>
            <button onClick={async () => { clearDemoUser(); if (session) { await signOut({ redirect: false }); } router.push('/'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        <div className="relative rounded-2xl px-7 py-8 sm:py-10 text-white shadow-sm overflow-hidden animate-fade-slide-up" style={{ backgroundColor: '#0B2A4A' }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)', backgroundSize: '22px 22px' }} />
          <h1 className="relative text-2xl sm:text-3xl font-bold mb-1.5">Welcome back, {firstName}!</h1>
          <p className="relative text-sm sm:text-base" style={{ color: '#B8EAF3' }}>{"Here's the current status of your application at Arvin International."}</p>
        </div>

        {!application ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E9EC] p-8 text-center animate-fade-slide-up delay-1">
            <p className="mb-4" style={{ color: '#6B7A8D' }}>{"You haven't submitted an application yet."}</p>
            <Link href="/apply" className="inline-block px-6 py-2.5 text-white font-semibold rounded-lg hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-sm shadow-sm" style={{ backgroundColor: '#0B2A4A' }}>Start Your Application</Link>
          </div>
        ) : withdrawn ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E9EC] p-8 text-center animate-fade-slide-up delay-1 space-y-3">
            <p className="text-lg font-bold" style={{ color: '#0B2A4A' }}>Your application has been withdrawn.</p>
            <p className="text-sm" style={{ color: '#6B7A8D' }}>Reason provided: {withdrawReason}</p>
            <p className="text-sm" style={{ color: '#6B7A8D' }}>Thank you for your time and interest in Arvin International Marketing Inc. We hope to see your application again in the future.</p>
          </div>
        ) : showHiringProcess ? (
          <HiringProcessCard key={hiringCompletedSteps} steps={steps} completedSteps={hiringCompletedSteps} docStatuses={docStatuses} docFiles={docFiles} onDocUpload={handleDocUpload} onSimulateHrComplete={handleSimulateHrComplete} applicantName={name} onWithdraw={handleWithdraw} />
        ) : (
          <ApplicationStatusCard stage={applicationStage} onContinue={() => setModalOpen(true)} setApplicationStage={setApplicationStage} />
        )}
      </div>

      <ProceedModal open={modalOpen} onCancel={() => setModalOpen(false)} onConfirm={() => { setModalOpen(false); setShowHiringProcess(true); }} includeSri={includeSri} />
      <CongratsModal open={congratsOpen} onClose={() => setCongratsOpen(false)} />
    </div>
  );
}
