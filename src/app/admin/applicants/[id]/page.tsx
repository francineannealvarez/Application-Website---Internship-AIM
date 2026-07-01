'use client'
 
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { components, HIRING_STAGES, type HiringStage } from '@/lib/admin-theme'
 
// ─── Types ──────────────────────────────────────────────────
type ApplicantStatus = 'active' | 'rejected'
 
interface ActivityEntry {
  id: string
  label: string
  date: string
  note?: string
}
 
interface ApplicantDetail {
  id: number
  name: string
  job: string
  email: string
  phone: string
  address: string
  education: string
  dateApplied: string
  dateMoved: string
  stage: HiringStage
  status: ApplicantStatus
  coverNote: string
  resume: { fileName: string; sizeLabel: string; url: string }
  activity: ActivityEntry[]
}
 
// ─── Mock Data ──────────────────────────────────────────────
// TODO: replace with a real Supabase fetch, e.g.
//   const { data } = await supabase.from('applicants').select('*').eq('id', id).single()
// Keyed the same way as MOCK_APPLICANTS in applicants/page.tsx so the
// "View Profile" links there resolve to matching records here. Once both
// pages are backend-connected, this can be deleted and both pages can pull
// from the same query/hook instead of keeping two mock lists in sync.
const MOCK_APPLICANT_DETAILS: Record<number, ApplicantDetail> = {
  1: {
    id: 1, name: 'Maria Santos', job: 'HR Associate',
    email: 'maria.santos@email.com', phone: '0917 123 4567',
    address: 'Batangas City, Batangas',
    education: 'BS Psychology, Batangas State University',
    dateApplied: '2026-06-02', dateMoved: '2026-06-30',
    stage: 'Initial Interview', status: 'active',
    coverNote: 'Applying for HR Associate. 2 years of admin/HR support experience at a BPO, handled onboarding paperwork and employee records.',
    resume: { fileName: 'Maria_Santos_Resume.pdf', sizeLabel: '238 KB', url: '#' },
    activity: [
      { id: 'a1-1', label: 'Applied', date: '2026-06-02' },
      { id: 'a1-2', label: 'Moved to Initial Interview', date: '2026-06-30' },
    ],
  },
  2: {
    id: 2, name: 'Jose Reyes', job: 'HR Associate',
    email: 'jose.reyes@email.com', phone: '0918 234 5678',
    address: 'Lipa City, Batangas',
    education: 'BS Business Administration, University of Batangas',
    dateApplied: '2026-06-03', dateMoved: '2026-06-05',
    stage: 'Applied', status: 'active',
    coverNote: 'Fresh graduate, looking for an entry-level HR role. Completed OJT at a local manufacturing firm\'s HR department.',
    resume: { fileName: 'Jose_Reyes_Resume.pdf', sizeLabel: '190 KB', url: '#' },
    activity: [{ id: 'a2-1', label: 'Applied', date: '2026-06-03' }],
  },
  3: {
    id: 3, name: 'Ana Dela Cruz', job: 'HR Associate',
    email: 'ana.delacruz@email.com', phone: '0919 345 6789',
    address: 'Alangilan, Batangas City',
    education: 'BS Psychology, Batangas State University',
    dateApplied: '2026-06-04', dateMoved: '2026-06-09',
    stage: 'Exam / Assessment', status: 'active',
    coverNote: 'Currently a freelance HR consultant for small businesses, wants a full-time role with growth opportunities.',
    resume: { fileName: 'Ana_DelaCruz_Resume.pdf', sizeLabel: '212 KB', url: '#' },
    activity: [
      { id: 'a3-1', label: 'Applied', date: '2026-06-04' },
      { id: 'a3-2', label: 'Moved to Initial Interview', date: '2026-06-07' },
      { id: 'a3-3', label: 'Moved to Exam / Assessment', date: '2026-06-09' },
    ],
  },
  4: {
    id: 4, name: 'Roberto Lim', job: 'HR Associate',
    email: 'roberto.lim@email.com', phone: '0920 456 7890',
    address: 'San Pascual, Batangas',
    education: 'BS Human Resource Management, De La Salle Lipa',
    dateApplied: '2026-06-05', dateMoved: '2026-06-22',
    stage: 'For Onboarding', status: 'active',
    coverNote: '4 years HR generalist experience, previously handled recruitment end-to-end for a retail chain.',
    resume: { fileName: 'Roberto_Lim_Resume.pdf', sizeLabel: '265 KB', url: '#' },
    activity: [
      { id: 'a4-1', label: 'Applied', date: '2026-06-05' },
      { id: 'a4-2', label: 'Moved to Initial Interview', date: '2026-06-09' },
      { id: 'a4-3', label: 'Moved to Exam / Assessment', date: '2026-06-13' },
      { id: 'a4-4', label: 'Moved to Department Interview', date: '2026-06-18' },
      { id: 'a4-5', label: 'Moved to For Onboarding', date: '2026-06-22' },
    ],
  },
  5: {
    id: 5, name: 'Carmen Villanueva', job: 'Operations Manager',
    email: 'carmen.villanueva@email.com', phone: '0921 567 8901',
    address: 'Batangas City, Batangas',
    education: 'BS Industrial Engineering, Batangas State University',
    dateApplied: '2026-06-06', dateMoved: '2026-06-08',
    stage: 'Initial Interview', status: 'active',
    coverNote: '6 years in operations, most recently supervising a 30-person warehouse team.',
    resume: { fileName: 'Carmen_Villanueva_Resume.pdf', sizeLabel: '301 KB', url: '#' },
    activity: [
      { id: 'a5-1', label: 'Applied', date: '2026-06-06' },
      { id: 'a5-2', label: 'Moved to Initial Interview', date: '2026-06-08' },
    ],
  },
  6: {
    id: 6, name: 'Eduardo Torres', job: 'Operations Manager',
    email: 'eduardo.torres@email.com', phone: '0922 678 9012',
    address: 'Tanauan City, Batangas',
    education: 'BS Industrial Technology, Batangas State University',
    dateApplied: '2026-06-07', dateMoved: '2026-06-12',
    stage: 'Department Interview', status: 'active',
    coverNote: 'Previously operations supervisor at a logistics company, handled inventory and staff scheduling.',
    resume: { fileName: 'Eduardo_Torres_Resume.pdf', sizeLabel: '278 KB', url: '#' },
    activity: [
      { id: 'a6-1', label: 'Applied', date: '2026-06-07' },
      { id: 'a6-2', label: 'Moved to Initial Interview', date: '2026-06-09' },
      { id: 'a6-3', label: 'Moved to Exam / Assessment', date: '2026-06-10' },
      { id: 'a6-4', label: 'Moved to Department Interview', date: '2026-06-12' },
    ],
  },
  7: {
    id: 7, name: 'Liza Ramos', job: 'Accounting Clerk',
    email: 'liza.ramos@email.com', phone: '0923 789 0123',
    address: 'Malvar, Batangas',
    education: 'BS Accountancy, Lyceum of the Philippines University - Batangas',
    dateApplied: '2026-06-08', dateMoved: '2026-06-10',
    stage: 'Initial Interview', status: 'active',
    coverNote: 'CPA board passer, 1 year experience as junior bookkeeper for a family-owned business.',
    resume: { fileName: 'Liza_Ramos_Resume.pdf', sizeLabel: '205 KB', url: '#' },
    activity: [
      { id: 'a7-1', label: 'Applied', date: '2026-06-08' },
      { id: 'a7-2', label: 'Moved to Initial Interview', date: '2026-06-10' },
    ],
  },
  8: {
    id: 8, name: 'Paolo Garcia', job: 'Accounting Clerk',
    email: 'paolo.garcia@email.com', phone: '0924 890 1234',
    address: 'Sto. Tomas, Batangas',
    education: 'BS Accounting Technology, Batangas State University',
    dateApplied: '2026-06-09', dateMoved: '2026-06-11',
    stage: 'Exam / Assessment', status: 'active',
    coverNote: 'Recent graduate with an internship at a local cooperative doing accounts payable.',
    resume: { fileName: 'Paolo_Garcia_Resume.pdf', sizeLabel: '183 KB', url: '#' },
    activity: [
      { id: 'a8-1', label: 'Applied', date: '2026-06-09' },
      { id: 'a8-2', label: 'Moved to Initial Interview', date: '2026-06-10' },
      { id: 'a8-3', label: 'Moved to Exam / Assessment', date: '2026-06-11' },
    ],
  },
  9: {
    id: 9, name: 'Tina Cruz', job: 'Accounting Clerk',
    email: 'tina.cruz@email.com', phone: '0925 901 2345',
    address: 'Bauan, Batangas',
    education: 'BS Accountancy, Batangas State University',
    dateApplied: '2026-06-10', dateMoved: '2026-06-14',
    stage: 'Initial Interview', status: 'active',
    coverNote: '2 years as accounting assistant at a manufacturing firm, comfortable with QuickBooks and Excel.',
    resume: { fileName: 'Tina_Cruz_Resume.pdf', sizeLabel: '220 KB', url: '#' },
    activity: [
      { id: 'a9-1', label: 'Applied', date: '2026-06-10' },
      { id: 'a9-2', label: 'Moved to Initial Interview', date: '2026-06-14' },
    ],
  },
  10: {
    id: 10, name: 'Mark Aquino', job: 'IT Support Specialist',
    email: 'mark.aquino@email.com', phone: '0926 012 3456',
    address: 'Alangilan, Batangas City',
    education: 'BS Information Technology, Batangas State University',
    dateApplied: '2026-06-11', dateMoved: '2026-06-28',
    stage: 'For Onboarding', status: 'active',
    coverNote: '3 years IT support experience, handled helpdesk tickets and basic network troubleshooting for a BPO.',
    resume: { fileName: 'Mark_Aquino_Resume.pdf', sizeLabel: '250 KB', url: '#' },
    activity: [
      { id: 'a10-1', label: 'Applied', date: '2026-06-11' },
      { id: 'a10-2', label: 'Moved to Initial Interview', date: '2026-06-15' },
      { id: 'a10-3', label: 'Moved to Exam / Assessment', date: '2026-06-19' },
      { id: 'a10-4', label: 'Moved to Department Interview', date: '2026-06-24' },
      { id: 'a10-5', label: 'Moved to For Onboarding', date: '2026-06-28' },
    ],
  },
  11: {
    id: 11, name: 'Bianca Reyes', job: 'HR Associate',
    email: 'bianca.reyes@email.com', phone: '0927 123 4567',
    address: 'Ibaan, Batangas',
    education: 'BS Business Administration, University of Batangas',
    dateApplied: '2026-06-01', dateMoved: '2026-06-06',
    stage: 'Initial Interview', status: 'rejected',
    coverNote: 'Applying for HR Associate, previously worked as a receptionist with light administrative duties.',
    resume: { fileName: 'Bianca_Reyes_Resume.pdf', sizeLabel: '176 KB', url: '#' },
    activity: [
      { id: 'a11-1', label: 'Applied', date: '2026-06-01' },
      { id: 'a11-2', label: 'Moved to Initial Interview', date: '2026-06-04' },
      { id: 'a11-3', label: 'Rejected at Initial Interview', date: '2026-06-06', note: 'Not enough relevant HR experience for the role at this time.' },
    ],
  },
  12: {
    id: 12, name: 'Ramon Flores', job: 'Accounting Clerk',
    email: 'ramon.flores@email.com', phone: '0928 234 5678',
    address: 'Taal, Batangas',
    education: 'BS Accountancy, Lyceum of the Philippines University - Batangas',
    dateApplied: '2026-06-08', dateMoved: '2026-06-13',
    stage: 'Exam / Assessment', status: 'rejected',
    coverNote: 'Applying for Accounting Clerk, background mostly in retail cash handling rather than bookkeeping.',
    resume: { fileName: 'Ramon_Flores_Resume.pdf', sizeLabel: '160 KB', url: '#' },
    activity: [
      { id: 'a12-1', label: 'Applied', date: '2026-06-08' },
      { id: 'a12-2', label: 'Moved to Initial Interview', date: '2026-06-10' },
      { id: 'a12-3', label: 'Moved to Exam / Assessment', date: '2026-06-12' },
      { id: 'a12-4', label: 'Rejected at Exam / Assessment', date: '2026-06-13', note: 'Did not pass the assessment cutoff score.' },
    ],
  },
}
 
// ─── Helpers ────────────────────────────────────────────────
const STAGE_INDEX: Record<HiringStage, number> = HIRING_STAGES.reduce(
  (acc, stage, i) => {
    acc[stage] = i
    return acc
  },
  {} as Record<HiringStage, number>
)
 
const STATUS_BADGE: Record<string, string> = {
  'Applied': components.badge.applied,
  'Initial Interview': components.badge.initial,
  'Exam / Assessment': components.badge.exam,
  'Department Interview': components.badge.department,
  'For Onboarding': components.badge.onboarding,
}
 
function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}
 
function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
 
// ─── File Icon ──────────────────────────────────────────────
function FileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-7 5h8a2 2 0 002-2V7.828a2 2 0 00-.586-1.414l-3.828-3.828A2 2 0 0011.172 2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}
 
export default function ApplicantProfilePage() {
  const params = useParams<{ id: string }>()
  const applicantId = Number(params.id)
  const baseRecord = MOCK_APPLICANT_DETAILS[applicantId]
 
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(baseRecord ?? null)
  const [noteDraft, setNoteDraft] = useState('')
  const [confirmingReject, setConfirmingReject] = useState(false)
 
  // ── Not found state ──
  if (!applicant) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between">
          <h1 className={components.pageTitle}>Applicant Profile</h1>
          <Link href="/admin/applicants" className={components.btnGhost}>
            ← Back to Applicants
          </Link>
        </div>
        <hr className={components.pageDivider} />
 
        <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-10 text-center mt-6">
          <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">
            We couldn&apos;t find an applicant with this ID. They may have been removed, or the link is incorrect.
          </p>
        </div>
      </AdminLayout>
    )
  }
 
  const currentIndex = STAGE_INDEX[applicant.stage]
  const isLastStage = currentIndex === HIRING_STAGES.length - 1
  const isRejected = applicant.status === 'rejected'
 
  // TODO: replace with PATCH /api/applicants/[id] { stage: nextStage, dateMoved }
  function advanceStage() {
    if (!applicant || isLastStage || isRejected) return
    const nextStage = HIRING_STAGES[currentIndex + 1]
    const date = todayISO()
    setApplicant({
      ...applicant,
      stage: nextStage,
      dateMoved: date,
      activity: [...applicant.activity, { id: `a-${Date.now()}`, label: `Moved to ${nextStage}`, date }],
    })
  }
 
  // TODO: replace with PATCH /api/applicants/[id] { stage: prevStage, dateMoved }
  function moveBackStage() {
    if (!applicant || currentIndex === 0 || isRejected) return
    const prevStage = HIRING_STAGES[currentIndex - 1]
    const date = todayISO()
    setApplicant({
      ...applicant,
      stage: prevStage,
      dateMoved: date,
      activity: [...applicant.activity, { id: `a-${Date.now()}`, label: `Moved back to ${prevStage}`, date }],
    })
  }
 
  // TODO: replace with PATCH /api/applicants/[id] { status: 'rejected' }
  function rejectApplicant() {
    if (!applicant) return
    const date = todayISO()
    setApplicant({
      ...applicant,
      status: 'rejected',
      activity: [...applicant.activity, { id: `a-${Date.now()}`, label: `Rejected at ${applicant.stage}`, date }],
    })
    setConfirmingReject(false)
  }
 
  // TODO: replace with POST /api/applicants/[id]/notes { note }
  function saveNote() {
    if (!applicant || !noteDraft.trim()) return
    const date = todayISO()
    setApplicant({
      ...applicant,
      activity: [...applicant.activity, { id: `a-${Date.now()}`, label: 'HR Note added', date, note: noteDraft.trim() }],
    })
    setNoteDraft('')
  }
 
  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className={components.pageTitle}>Applicant Profile</h1>
        <Link href="/admin/applicants" className={components.btnGhost}>
          ← Back to Applicants
        </Link>
      </div>
      <hr className={components.pageDivider} />
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* ── Left: main content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#00bbda] flex items-center justify-center text-white text-lg font-semibold shrink-0">
                {initials(applicant.name)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[#0f1f29] dark:text-[#e2edf3] truncate">{applicant.name}</h2>
                <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3]">Applied for {applicant.job}</p>
              </div>
              <div className="ml-auto shrink-0">
                <span className={`${components.badge.base} ${isRejected ? components.badge.rejected : (STATUS_BADGE[applicant.stage] ?? components.badge.initial)}`}>
                  {isRejected ? 'Rejected' : applicant.stage}
                </span>
              </div>
            </div>
          </div>
 
          {/* Application Details */}
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-4">Application Details</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-[#8fa3b0] dark:text-[#6b8fa3] text-xs uppercase tracking-wide mb-1">Email</dt>
                <dd className="text-[#1a2a35] dark:text-[#e2edf3]">{applicant.email}</dd>
              </div>
              <div>
                <dt className="text-[#8fa3b0] dark:text-[#6b8fa3] text-xs uppercase tracking-wide mb-1">Phone</dt>
                <dd className="text-[#1a2a35] dark:text-[#e2edf3]">{applicant.phone}</dd>
              </div>
              <div>
                <dt className="text-[#8fa3b0] dark:text-[#6b8fa3] text-xs uppercase tracking-wide mb-1">Address</dt>
                <dd className="text-[#1a2a35] dark:text-[#e2edf3]">{applicant.address}</dd>
              </div>
              <div>
                <dt className="text-[#8fa3b0] dark:text-[#6b8fa3] text-xs uppercase tracking-wide mb-1">Education</dt>
                <dd className="text-[#1a2a35] dark:text-[#e2edf3]">{applicant.education}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[#8fa3b0] dark:text-[#6b8fa3] text-xs uppercase tracking-wide mb-1">Cover Note</dt>
                <dd className="text-[#1a2a35] dark:text-[#e2edf3] leading-relaxed">{applicant.coverNote}</dd>
              </div>
            </dl>
          </div>
 
          {/* Resume */}
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-4">Resume</h3>
            <div className="flex items-center gap-3 border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-4">
              <div className="w-10 h-10 rounded bg-[#eaf6f9] dark:bg-[#0d2b38] flex items-center justify-center text-[#00bbda] shrink-0">
                <FileIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3] truncate">{applicant.resume.fileName}</p>
                <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">{applicant.resume.sizeLabel}</p>
              </div>
              <a href={applicant.resume.url} target="_blank" rel="noopener noreferrer" className={components.btnOutlineSm}>
                View
              </a>
              <a href={applicant.resume.url} download className={components.btnNeutralSm}>
                Download
              </a>
            </div>
            {/* TODO: once resume storage (e.g. Supabase Storage) is wired up, resume.url
                should be a signed URL and "View" should open it in a lightweight preview
                (iframe/embed for PDFs) instead of a bare new tab. */}
            <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-2">
              File preview will open the actual resume once file storage is connected.
            </p>
          </div>
 
          {/* HR Notes */}
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-4">HR Notes</h3>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder={isRejected ? 'This applicant has been rejected.' : 'Add interview feedback or notes about this applicant...'}
              rows={3}
              disabled={isRejected}
              className="w-full text-sm border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3 py-2 bg-white dark:bg-[#0d1f2d] text-[#1a2a35] dark:text-[#e2edf3] placeholder:text-[#8fa3b0] focus:outline-none focus:ring-2 focus:ring-[#00bbda] disabled:opacity-50"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={saveNote}
                disabled={!noteDraft.trim() || isRejected}
                className={`${components.btnPrimarySm} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
 
        {/* ── Right: sidebar ── */}
        <div className="space-y-6">
          {/* Pipeline progress */}
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-4">Pipeline Progress</h3>
 
            {isRejected ? (
              <div className="mb-4">
                <span className={`${components.badge.base} ${components.badge.rejected}`}>
                  Rejected at {applicant.stage}
                </span>
              </div>
            ) : (
              <ol className="space-y-3 mb-4">
                {HIRING_STAGES.map((stage, i) => {
                  const done = i < currentIndex
                  const current = i === currentIndex
                  return (
                    <li key={stage} className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                          done
                            ? 'bg-[#198754] text-white'
                            : current
                            ? 'bg-[#00bbda] text-white'
                            : 'bg-[#f4f7f9] dark:bg-[#0d1f2d] text-[#8fa3b0] border border-[#e2e8ed] dark:border-[#1e3448]'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      <span className={`text-sm ${current ? 'font-semibold text-[#0f1f29] dark:text-[#e2edf3]' : 'text-[#8fa3b0] dark:text-[#6b8fa3]'}`}>
                        {stage}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}
 
            {!isRejected && (
              <div className="space-y-2">
                <button
                  onClick={advanceStage}
                  disabled={isLastStage}
                  className={`${components.btnPrimary} w-full disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {isLastStage ? 'Final Stage Reached' : `Move to ${HIRING_STAGES[currentIndex + 1]}`}
                </button>
                <button
                  onClick={moveBackStage}
                  disabled={currentIndex === 0}
                  className={`${components.btnNeutral} w-full disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Move Back a Stage
                </button>
 
                {!confirmingReject ? (
                  <button onClick={() => setConfirmingReject(true)} className={`${components.btnDanger} w-full`}>
                    Reject Applicant
                  </button>
                ) : (
                  <div className="border border-[#e05252] rounded-lg p-3 space-y-2">
                    <p className="text-xs text-[#e05252]">
                      Reject {applicant.name}? This moves them out of the active pipeline.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={rejectApplicant} className={`${components.btnDanger} flex-1`}>
                        Confirm
                      </button>
                      <button onClick={() => setConfirmingReject(false)} className={`${components.btnNeutral} flex-1`}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
 
          {/* Quick info */}
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-4">Quick Info</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#8fa3b0] dark:text-[#6b8fa3]">Date Applied</dt>
                <dd className="text-[#1a2a35] dark:text-[#e2edf3]">{applicant.dateApplied}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#8fa3b0] dark:text-[#6b8fa3]">Last Moved</dt>
                <dd className="text-[#1a2a35] dark:text-[#e2edf3]">{applicant.dateMoved}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#8fa3b0] dark:text-[#6b8fa3]">Job Posting</dt>
                <dd className="text-[#1a2a35] dark:text-[#e2edf3] text-right">{applicant.job}</dd>
              </div>
            </dl>
          </div>
 
          {/* Activity timeline */}
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-4">Activity</h3>
            <ul className="space-y-3">
              {[...applicant.activity].reverse().map((entry) => (
                <li key={entry.id} className="text-sm border-l-2 border-[#e2e8ed] dark:border-[#1e3448] pl-3">
                  <p className="text-[#1a2a35] dark:text-[#e2edf3] font-medium">{entry.label}</p>
                  {entry.note && <p className="text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">{entry.note}</p>}
                  <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">{entry.date}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}