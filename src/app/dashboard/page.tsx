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

import PersonalDataSheetContent from '@/components/dashboard/PersonalDataSheetContent';
import AssessmentContent from '@/components/dashboard/AssessmentContent';
import BackgroundCheckContent from '@/components/dashboard/BackgroundCheckContent';
import OnboardingContent from '@/components/dashboard/OnboardingContent';
import SRAContent from '@/components/dashboard/SRAContent';
import JobOfferContent from '@/components/dashboard/JobOfferContent';
import StepGate from '@/components/dashboard/StepGate';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type DocStatus = 'Submitted' | 'Pending';

type InterviewSchedule = {
  date?: string;
  time?: string;
  method?: string;
  note?: string;
  venue?: string;
} | null;

type RealApplicationRecord = {
  id: string;
  status: string;
  stage: string;
  full_name?: string;
  email?: string;
  date_applied?: string | Date;
  date_hired?: string | Date | null;
  job_postings?: { title?: string; department?: string; employment_type?: string } | null;
  initial_interview_schedule?: InterviewSchedule;
  final_interview_schedule?: InterviewSchedule;
  interview_status?: string | null;
  employment_verification_status?: string | null;
};

/**
 * `interview_status` DB values: NULL, 'Passed', 'Failed', 'Discontinued'.
 * Note: this column has no "in review" value - while it's NULL, the
 * applicant is just waiting on HR with no verdict yet.
 */
function normalizeInterviewStatus(raw?: string | null): 'passed' | 'failed' | 'discontinued' | null {
  if (raw === 'Passed') return 'passed';
  if (raw === 'Failed') return 'failed';
  if (raw === 'Discontinued') return 'discontinued';
  return null;
}

/**
 * `employment_verification_status` DB values: NULL, 'On Progress', 'Passed', 'Failed'.
 */
function normalizeEvStatus(raw?: string | null): 'reviewing' | 'passed' | 'failed' | null {
  if (raw === 'On Progress') return 'reviewing';
  if (raw === 'Passed') return 'passed';
  if (raw === 'Failed') return 'failed';
  return null;
}

/**
 * `Final Interview` has no dedicated status column - HR simply advances
 * the overall `stage` once it's done. We derive a StepGate-compatible
 * status by comparing where `stage` currently sits against this
 * checkpoint in the DB's enforced stage order, folding in `status`
 * (failed/withdrawn) for a verdict while the applicant is parked here.
 */
const DB_STAGE_ORDER = [
  'Applied',
  'Prescreen',
  'Shortlisted',
  'Initial Interview',
  'Assessment',
  'Final Interview',
  'Employment Verification',
  'Job Offer',
  'On Boarding',
];

function normalizeFinalInterviewStatus(
  stage: string,
  appStatus: string
): 'passed' | 'failed' | 'discontinued' | null {
  const checkpointIdx = DB_STAGE_ORDER.indexOf('Final Interview');
  const currentIdx = DB_STAGE_ORDER.indexOf(stage);
  if (currentIdx === -1) return null;
  if (currentIdx > checkpointIdx) return 'passed';
  if (currentIdx === checkpointIdx) {
    if (appStatus === 'failed') return 'failed';
    if (appStatus === 'withdrawn') return 'discontinued';
  }
  return null;
}

const STAGE_LABELS = ['Submitted', 'Under Review', 'Result'];
const STAGE_ICONS = [FileText, Clock, Sparkles] as const;

/**
 * Maps the real DB columns (`status`, `stage`) to the 3-step Application
 * Status card (Submitted / Under Review / Result).
 *
 * DB `stage` values (enforced by a check constraint):
 *   Applied, Prescreen, Shortlisted, Initial Interview, Assessment,
 *   Final Interview, Employment Verification, Job Offer, On Boarding
 *
 * DB `status` values (enforced by a check constraint):
 *   active, failed, withdrawn
 *
 * - Applied                -> Submitted (0)
 * - Prescreen               -> Under Review (1)
 * - Shortlisted              -> Under Review (2)
 * - anything past Shortlisted -> Result (3)
 * - status is failed/withdrawn -> Result (3), flagged as rejected
 */
function computeApplicationProgress(
  status: string,
  stage: string
): { stage: number; rejected: boolean } {
  const rejected = status === 'failed' || status === 'withdrawn';
  if (rejected) return { stage: 3, rejected: true };

  switch (stage) {
    case 'Applied':
      return { stage: 0, rejected: false };
    case 'Prescreen':
      return { stage: 1, rejected: false };
    case 'Shortlisted':
      return { stage: 2, rejected: false };
    default:
      // Initial Interview, Assessment, Final Interview,
      // Employment Verification, Job Offer, On Boarding
      return { stage: 3, rejected: false };
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

const REJECTED_BANNER = {
  cls: 'text-red-900',
  icon: <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
  text: 'Unfortunately, your application did not move forward this time. Thank you for your interest in Arvin International.',
};

const REJECTED_BANNER_STYLE: React.CSSProperties = { backgroundColor: '#FEF2F2' };

function ApplicationStatusCard({
  stage,
  rejected,
  onContinue,
}: {
  stage: number;
  rejected: boolean;
  onContinue: () => void;
}) {
  const bannerConfig = rejected ? REJECTED_BANNER : (STATUS_BANNER[stage] ?? { cls: '', icon: null, text: '' });
  const bannerStyle = rejected ? REJECTED_BANNER_STYLE : (STATUS_BANNER_STYLE[stage] ?? {});
  const bannerExtraCls = rejected
    ? 'bg-red-50 border border-red-200'
    : stage === 2
    ? 'bg-amber-50 border border-amber-200'
    : stage === 3
    ? 'bg-green-50 border border-green-200'
    : '';

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-[#E5E9EC] overflow-hidden transition-shadow duration-300 animate-fade-slide-up delay-2">
      <div className="px-6 py-4 border-b border-[#E5E9EC] flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#0B2A4A]">Application Status</h3>
            {rejected ? (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Not Selected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                <Check className="w-3 h-3" /> Submitted
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>Track your application progress</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/application" className="text-xs px-3 py-1.5 rounded-lg border text-[#0B2A4A] hover:bg-[#F7F9FA] active:scale-95 transition-all font-medium flex items-center gap-1.5" style={{ borderColor: '#E5E9EC' }}>
            <FileText className="w-3.5 h-3.5" style={{ color: '#6B7A8D' }} /> View Application
          </Link>
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
        {stage === 3 && !rejected && (
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

/**
 * Maps the real DB `stage` column to a position in the 9-step Hiring
 * Process card. `stage` only tracks these HR-driven checkpoints:
 *   Initial Interview, Assessment, Final Interview,
 *   Employment Verification, Job Offer, On Boarding
 *
 * The applicant-submitted steps in between (Personal Data Sheet, SRA,
 * Requirements) don't have their own `stage` value - once the DB stage
 * moves past them, they're treated as done. If `date_hired` is set, the
 * whole process is complete (past Onboarding).
 */
const STAGE_TO_STEP_KEY: Partial<Record<string, StepKey>> = {
  'Initial Interview': 'initial',
  'Assessment': 'assessment',
  'Final Interview': 'department',
  'Employment Verification': 'background',
  'Job Offer': 'joboffer',
  'On Boarding': 'onboarding',
};

function computeHiringStepIndex(
  stage: string,
  dateHired: string | Date | null | undefined,
  steps: { key: StepKey }[]
): number {
  if (dateHired) return steps.length;
  const key = STAGE_TO_STEP_KEY[stage];
  if (!key) return 0;
  const idx = steps.findIndex((s) => s.key === key);
  return idx === -1 ? 0 : idx;
}

const STEP_DETAILS = [
  { date: 'July 20, 2026', time: '10:00 AM', venue: null, platform: null, instructions: 'Please wait for a message from HR regarding your Initial Interview schedule. Depending on your assigned interviewer, this may be conducted via Microsoft Teams, face-to-face, or a Viber call - make sure your Viber, email, and phone are all reachable so HR can reach you through whichever mode is assigned.' },
  { date: 'July 29, 2025', time: '2:00 PM', venue: 'Arvin International Marketing Inc. - 18th Floor, Y Tower Building, Corner Coral Way St., Macapagal Ave., Brgy. 76, Pasay City', platform: null, instructions: 'This is a technical interview with your prospective department head. Review your application thoroughly and be prepared to discuss your relevant experience in detail.' },
];

const REQUIREMENTS_MAIN = [
  { key: 'medical_certificate', label: 'Medical Certificate', note: 'From an accredited government physician', Icon: ClipboardCheck },
  { key: 'sss_id', label: 'SSS ID / E-1 Form', note: 'Photocopy of SSS ID or E-1 form', Icon: Hash },
  { key: 'philhealth_id', label: 'PhilHealth ID / MDR', note: 'Photocopy of PhilHealth ID or MDR', Icon: Shield },
  { key: 'pagibig_id', label: 'Pag-IBIG ID / MDF', note: 'Photocopy of Pag-IBIG ID or Members Data Form', Icon: CreditCard },
  { key: 'tin', label: 'TIN No.', note: 'Photocopy of BIR Form 1902 or TIN card', Icon: FileText },
  { key: 'birth_certificate', label: 'Birth Certificate', note: 'PSA-issued copy', Icon: FileText },
  { key: 'marriage_certificate', label: "Marriage Certificate", note: 'If applicable - PSA-issued copy', Icon: FileText },
  { key: 'children_birth_certificates', label: "Children's Birth Certificate(s)", note: 'If applicable - PSA-issued copy', Icon: FileText },
  { key: 'school_diploma', label: 'School Diploma', note: 'Photocopy of diploma', Icon: FileText },
  { key: 'transcript_of_records', label: 'Transcript of Records', note: 'Photocopy from your school registrar', Icon: FileText },
  { key: 'drivers_license', label: "Driver's License", note: 'For driver applicants only', Icon: CreditCard },
  { key: 'training_certificates', label: 'Training & Seminar Certificates', note: 'If applicable', Icon: ClipboardCheck },
  { key: 'nbi_clearance', label: 'NBI Clearance', note: 'Original copy, issued within the last 3 months', Icon: Shield },
  { key: 'police_clearance', label: 'Police Clearance', note: 'Original copy', Icon: Shield },
  { key: 'barangay_clearance', label: 'Barangay Clearance', note: 'Original copy', Icon: Shield },
  { key: 'id_pictures', label: 'ID Pictures (1x1 & 2x2)', note: 'White background', Icon: CreditCard },
];

const REQUIREMENTS_PREV_EMPLOYER = [
  { key: 'bir_2316', label: 'BIR Form 2316', note: 'From your previous employer', Icon: FileText },
  { key: 'certificate_of_employment', label: 'Certificate of Employment', note: 'From your previous employer', Icon: FileText },
  { key: 'latest_pay_slip', label: 'Latest Pay Slip', note: 'At least 1 month, from your previous employer', Icon: FileText },
  {
    key: 'sss_pagibig_loan_status',
    label: 'SSS / Pag-IBIG Loan Status Form',
    note: 'If with an existing SSS/Pag-IBIG loan: submit an updated Statement of Account (photocopy) with your payment arrangement. If without a loan: submit the printed online status confirming you have no existing loan.',
    Icon: Hash
  },
];

const REQUIREMENTS_BDO = [
  { key: 'bdo_id_picture', label: '1x1 ID Picture', note: 'White background', Icon: CreditCard },
  { key: 'bdo_gov_ids', label: 'Photocopy of 2 Different Government-Issued IDs', note: 'Or an original Police Clearance', Icon: Shield },
];

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

function formatScheduleDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatScheduleTime(timeStr?: string): string | null {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

function StepDetailContent({
  stepIdx,
  isCurrent,
  schedule,
}: {
  stepIdx: number;
  isCurrent: boolean;
  schedule?: InterviewSchedule;
}) {
  const detail = STEP_DETAILS[stepIdx];
  if (!detail) return null;

  const displayDate = formatScheduleDate(schedule?.date);
  const displayTime = formatScheduleTime(schedule?.time);
  const method = schedule?.method || null;
  const venue = schedule?.venue || null;
  const note = schedule?.note || null;
  const isFaceToFace = method?.toLowerCase().includes('face');

  return (
    <div className="space-y-3 pt-3">
      <div className="flex items-center gap-2.5 text-sm text-[#0B2A4A]">
        <Calendar className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
        {displayDate ? (
          <span><span className="font-semibold">{displayDate}</span>{displayTime && <span style={{ color: '#6B7A8D' }}> at {displayTime}</span>}</span>
        ) : (
          <span style={{ color: '#6B7A8D' }}>Schedule to be announced by HR</span>
        )}
      </div>
      {method && (
        isFaceToFace ? (
          <div className="flex items-start gap-2.5 text-sm text-[#0B2A4A]">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
            <span>
              <span className="inline-block mr-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF9FB', color: '#12B6D6' }}>{method}</span>
              {venue || 'Venue to be confirmed by HR'}
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 text-sm">
            <Link2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
            <span>
              <span className="inline-block mr-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF9FB', color: '#12B6D6' }}>{method}</span>
              {venue || 'HR will reach out via this method'}
            </span>
          </div>
        )
      )}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-sm text-amber-800">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><span>{note || detail.instructions}</span>
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

type ReqRecord = { status: DocStatus; fileName: string | null; filePath: string | null };

function RequirementRow({ label, note, Icon, record, uploading, onUpload }: {
  label: string; note: string; Icon: React.ElementType; record: ReqRecord | undefined;
  uploading: boolean; onUpload: (file: File) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isSubmitted = record?.status === 'Submitted' && Boolean(record.fileName);

  return (
    <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E5E9EC] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #EEF9FB 0%, #D6F4FA 100%)' }}><Icon className="w-4 h-4" style={{ color: '#12B6D6' }} /></div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#0B2A4A]">{label}</div>
        <div className="text-xs mt-0.5 truncate" style={{ color: '#6B7A8D' }}>{isSubmitted ? record!.fileName : note}</div>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
      {isSubmitted ? (
        <div className="flex items-center gap-1.5 shrink-0">
          {record!.filePath && (
            <a href={record!.filePath} target="_blank" rel="noreferrer"
              className="text-xs font-semibold px-2.5 py-1 rounded-full hover:underline" style={{ color: '#12B6D6' }}>
              View
            </a>
          )}
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 shrink-0">
            <Check className="w-3 h-3" /> Submitted
          </span>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="text-xs font-medium px-2 py-1 rounded-full hover:bg-black/5 shrink-0" style={{ color: '#9BAAB8' }}>
            Replace
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-[#EEF9FB] hover:text-[#12B6D6] transition-colors shrink-0">
          <Clock className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Upload'}
        </button>
      )}
    </div>
  );
}

function RequirementsContent({ requirementsData, uploadingKey, onDocUpload, isCurrent }: {
  requirementsData: Record<string, ReqRecord>; uploadingKey: string | null; onDocUpload: (key: string, file: File) => void; isCurrent: boolean;
}) {
  return (
    <div className="pt-3 space-y-4">
      <div>
        <h4 className="font-semibold text-[#0B2A4A] text-sm">Document Requirements</h4>
        <p className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>Please prepare and submit the following before your scheduled deadline. Upload a clear photo or PDF scan of each document.</p>
      </div>

      <div className="space-y-2">
        {REQUIREMENTS_MAIN.map((r) => (
          <RequirementRow key={r.key} label={r.label} note={r.note} Icon={r.Icon}
            record={requirementsData[r.key]} uploading={uploadingKey === r.key} onUpload={(file) => onDocUpload(r.key, file)} />
        ))}
      </div>

      <ReqCollapsible title="Additional Requirements - If You Previously Worked Elsewhere" subtitle="Only applicable if you have prior employment">
        <div className="space-y-2">
          {REQUIREMENTS_PREV_EMPLOYER.map((r) => (
            <RequirementRow key={r.key} label={r.label} note={r.note} Icon={r.Icon}
              record={requirementsData[r.key]} uploading={uploadingKey === r.key} onUpload={(file) => onDocUpload(r.key, file)} />
          ))}
        </div>
      </ReqCollapsible>

      <ReqCollapsible title="Additional Requirements - BDO Payroll Account Application" subtitle="Only applicable when opening a BDO account">
        <div className="space-y-2">
          {REQUIREMENTS_BDO.map((r) => (
            <RequirementRow key={r.key} label={r.label} note={r.note} Icon={r.Icon}
              record={requirementsData[r.key]} uploading={uploadingKey === r.key} onUpload={(file) => onDocUpload(r.key, file)} />
          ))}
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

function HiringProcessCard({ steps, completedSteps, requirementsData, uploadingKey, onDocUpload, onStepSubmitted, onAdvance, applicantName, onWithdraw, applicationId, positionTitle, dateApplied, initialInterviewSchedule, finalInterviewSchedule, initialInterviewStatus, backgroundCheckStatus, finalInterviewStatus }: { steps: ReturnType<typeof buildHiringSteps>; completedSteps: number; requirementsData: Record<string, ReqRecord>; uploadingKey: string | null; onDocUpload: (key: string, file: File) => void; onStepSubmitted: () => void; onAdvance: () => void; applicantName: string; onWithdraw: (reason: string) => void; applicationId: string | null; positionTitle: string; dateApplied?: string | Date | null; initialInterviewSchedule?: InterviewSchedule; finalInterviewSchedule?: InterviewSchedule; initialInterviewStatus?: ReturnType<typeof normalizeInterviewStatus>; backgroundCheckStatus?: ReturnType<typeof normalizeEvStatus>; finalInterviewStatus?: ReturnType<typeof normalizeFinalInterviewStatus>; }) {
  const totalSteps = steps.length;
  const circleState = (idx: number): 'completed' | 'active' | 'locked' => { if (idx < completedSteps) return 'completed'; if (idx === completedSteps) return 'active'; return 'locked'; };
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-[#E5E9EC] overflow-hidden transition-shadow duration-300 animate-fade-slide-up delay-2">
      <div className="h-1.5" style={{ backgroundColor: '#0B2A4A' }} />
      <div className="px-6 py-4 border-b border-[#E5E9EC] flex items-center justify-between gap-2 flex-wrap">
        <div><h3 className="font-bold text-[#0B2A4A] tracking-widest text-sm">HIRING PROCESS</h3><p className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>Click on each stage to view details</p></div>
        <div className="flex items-center gap-2 shrink-0">
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
                  <StepGate stepLabel="Initial Interview" isCurrent={isCurrent} status={initialInterviewStatus} onSubmitted={onStepSubmitted} onContinue={onAdvance} onWithdraw={onWithdraw}>
                    {() => <StepDetailContent stepIdx={0} isCurrent={isCurrent} schedule={initialInterviewSchedule} />}
                  </StepGate>
                ) : step.key === 'pds' ? (
                  <PersonalDataSheetContent isCurrent={isCurrent} onSubmit={onStepSubmitted} applicationId={applicationId} positionTitle={positionTitle} applicationDate={dateApplied} />
                ) : step.key === 'sri' ? (
                  <StepGate stepLabel="SRA (Verbal Test)" isCurrent={isCurrent} status={null} onSubmitted={onStepSubmitted} onWithdraw={onWithdraw}>
                    {(markSubmitted) => <SRAContent isCurrent={isCurrent} onSubmit={markSubmitted} applicationId={applicationId} />}
                  </StepGate>
                ) : step.key === 'assessment' ? (
                  <AssessmentContent isCurrent={isCurrent} onSubmit={onStepSubmitted} applicationId={applicationId} />
                ) : step.key === 'background' ? (
                  <StepGate stepLabel="Character & Background Check" isCurrent={isCurrent} status={backgroundCheckStatus} onSubmitted={onStepSubmitted} onContinue={onAdvance} onWithdraw={onWithdraw}>
                    {(markSubmitted) => <BackgroundCheckContent isCurrent={isCurrent} onSubmit={markSubmitted} fullName={applicantName} positionTitle={positionTitle} applicationId={applicationId} />}
                  </StepGate>
                ) : step.key === 'department' ? (
                  <StepGate stepLabel="Final Interview" isCurrent={isCurrent} status={finalInterviewStatus} onSubmitted={onStepSubmitted} onContinue={onAdvance} onWithdraw={onWithdraw}>
                    {() => <StepDetailContent stepIdx={1} isCurrent={isCurrent} schedule={finalInterviewSchedule} />}
                  </StepGate>
                ) : step.key === 'joboffer' ? (
                  <JobOfferContent isCurrent={isCurrent} applicantName={applicantName} applicationId={applicationId} onAccept={onStepSubmitted} onDecline={onWithdraw} />
                ) : step.key === 'requirements' ? (
                  <StepGate stepLabel="Requirements Submission" isCurrent={isCurrent} status={null} onSubmitted={onStepSubmitted} onWithdraw={onWithdraw}>
                    {() => <RequirementsContent requirementsData={requirementsData} uploadingKey={uploadingKey} onDocUpload={onDocUpload} isCurrent={isCurrent} />}
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
  const router = useRouter();
  const { data: session, status } = useSession();
  const [application, setApplication] = useState<RealApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role === 'HR_ADMIN') {
      router.push('/hr/dashboard');
    }
  }, [status, session, router]);

  const fetchApplication = React.useCallback(() => {
    if (!session?.user?.email) return;
    fetch(`/api/applications?email=${encodeURIComponent(session.user.email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setApplication(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  // Poll every 15 seconds so the applicant sees HR-side stage updates
  // without needing to manually refresh the page.
  useEffect(() => {
    if (!session?.user?.email) return;
    const interval = setInterval(fetchApplication, 15000);
    return () => clearInterval(interval);
  }, [session, fetchApplication]);

  const positionTitle = application?.job_postings?.title || '';
  const includeSri = positionTitle === 'Clerk' || positionTitle === 'Checker';
  const steps = buildHiringSteps(includeSri);
  const { stage: applicationStage, rejected } = computeApplicationProgress(
    application?.status || '',
    application?.stage || ''
  );

  const [showHiringProcess, setShowHiringProcess] = useState(false);
  const hiringCompletedSteps = computeHiringStepIndex(
    application?.stage || '',
    application?.date_hired ?? null,
    steps
  );

  // DB `stage` only moves at HR-driven checkpoints, so sub-steps that
  // happen *within* a single stage (submitting the PDS/SRA/Assessment,
  // or clicking Continue after a Passed verdict on Initial Interview /
  // Final Interview / Background Check) need their own forward-only
  // counter. This is always kept at least as high as the DB-derived
  // index, and never moves backward, and resets whenever we switch to a
  // different application record.
  const [advancedIdx, setAdvancedIdx] = useState(0);
  useEffect(() => {
    setAdvancedIdx((prev) => Math.max(prev, hiringCompletedSteps));
  }, [hiringCompletedSteps]);
  useEffect(() => {
    setAdvancedIdx(0);
  }, [application?.id]);
  const effectiveCompletedSteps = Math.max(hiringCompletedSteps, advancedIdx);
  const advanceLocally = () => setAdvancedIdx((prev) => Math.min(prev + 1, steps.length));

  // Real requirements data, fetched from `applicant_requirements`. Keyed by
  // the stable `document` slug used both here and in the DB, instead of
  // the old local-only base64 simulation.
  const [requirementsData, setRequirementsData] = useState<Record<string, ReqRecord>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const fetchRequirements = React.useCallback(() => {
    if (!application?.id) return;
    fetch(`/api/requirements?application_id=${encodeURIComponent(application.id)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((records: { document: string; status: string; file_name: string | null; file_path: string | null }[]) => {
        const map: Record<string, ReqRecord> = {};
        for (const r of records) {
          map[r.document] = {
            status: r.status === 'Submitted' ? 'Submitted' : 'Pending',
            fileName: r.file_name,
            filePath: r.file_path,
          };
        }
        setRequirementsData(map);
      })
      .catch(console.error);
  }, [application?.id]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  const [modalOpen, setModalOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');

  // Show the congrats screen automatically once HR marks the applicant as
  // hired (date_hired gets set on the applications row), instead of a
  // manually-triggered simulation.
  useEffect(() => {
    if (application?.date_hired) {
      setCongratsOpen(true);
    }
  }, [application?.date_hired]);

  const handleWithdraw = (reason: string) => {
    setWithdrawReason(reason);
    setWithdrawn(true);
  };

  const handleDocUpload = async (key: string, file: File) => {
    if (!application?.id) return;
    setUploadingKey(key);
    try {
      const groupNumber = REQUIREMENTS_MAIN.some((r) => r.key === key)
        ? 1
        : REQUIREMENTS_PREV_EMPLOYER.some((r) => r.key === key)
        ? 2
        : 3;

      const formData = new FormData();
      formData.append('application_id', application.id);
      formData.append('document', key);
      formData.append('group_number', String(groupNumber));
      formData.append('file', file);

      const res = await fetch('/api/requirements', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to upload requirement');
      const body = await res.json();
      setRequirementsData((prev) => ({
        ...prev,
        [key]: {
          status: 'Submitted',
          fileName: body.record?.file_name ?? file.name,
          filePath: body.record?.file_path ?? null,
        },
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingKey(null);
    }
  };

  // Sub-step components (PDS, SRA, Assessment, Background Check, Job Offer,
  // Requirements) handle their own submission to the backend. We advance
  // the local counter immediately so the UI feels responsive, then
  // re-fetch the application record so any DB-side stage change (made by
  // HR or by that submission) is reflected as well.
  const handleStepSubmitted = () => {
    advanceLocally();
    fetchApplication();
  };

  const handleLogout = () => {
    void signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return <div className="flex items-center justify-center h-screen" style={{ color: '#6B7A8D' }}>Loading...</div>;
  }

  const name = session?.user?.name || 'Applicant';
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
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all">
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
          <HiringProcessCard key={effectiveCompletedSteps} steps={steps} completedSteps={effectiveCompletedSteps} requirementsData={requirementsData} uploadingKey={uploadingKey} onDocUpload={handleDocUpload} onStepSubmitted={handleStepSubmitted} onAdvance={advanceLocally} applicantName={name} onWithdraw={handleWithdraw} applicationId={application?.id ?? null} positionTitle={positionTitle} dateApplied={application?.date_applied ?? null} initialInterviewSchedule={application?.initial_interview_schedule ?? null} finalInterviewSchedule={application?.final_interview_schedule ?? null} initialInterviewStatus={normalizeInterviewStatus(application?.interview_status)} backgroundCheckStatus={normalizeEvStatus(application?.employment_verification_status)} finalInterviewStatus={normalizeFinalInterviewStatus(application?.stage || '', application?.status || '')} />
        ) : (
          <ApplicationStatusCard stage={applicationStage} rejected={rejected} onContinue={() => setModalOpen(true)} />
        )}
      </div>

      <ProceedModal open={modalOpen} onCancel={() => setModalOpen(false)} onConfirm={() => { setModalOpen(false); setShowHiringProcess(true); }} includeSri={includeSri} />
      <CongratsModal open={congratsOpen} onClose={() => setCongratsOpen(false)} />
    </div>
  );
}