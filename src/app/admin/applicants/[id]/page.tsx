'use client'
 
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { components, HIRING_STAGES, type HiringStage } from '@/lib/admin-theme'
 
// ─── Types ──────────────────────────────────────────────────
type ApplicantStatus = 'active' | 'rejected'
type YesNo = 'Yes' | 'No'
 
interface ActivityEntry {
  id: string
  label: string
  date: string
  note?: string
}
 
interface FileAsset {
  fileName: string
  sizeLabel: string
  url: string
}
 
// ── Step 1 — Personal Information ──
interface PersonalInfo {
  presentAddress: string
  provincialAddress?: string
  residenceNumber?: string
  cellphone: string
  email: string
  dateOfBirth: string
  placeOfBirth?: string
  nationality?: string
  sex: 'Male' | 'Female'
  age?: string
  height?: string
  weight?: string
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Separated'
  sssNumber?: string
  pagibigNumber?: string
  tin?: string
  philhealthNumber?: string
  coverNote?: string
}
 
// ── Step 2 — Family Background ──
interface FamilyMemberInfo {
  name?: string
  address?: string
  occupation?: string
  age?: string
}
interface Sibling { id: string; name: string; address: string; occupation: string; age: string }
interface ChildEntry { id: string; name: string; age: string }
 
interface FamilyBackground {
  father: FamilyMemberInfo
  mother: FamilyMemberInfo
  siblings: Sibling[]
  spouse?: FamilyMemberInfo
  children: ChildEntry[]
  hasRelativeInCompany: YesNo
  relativeDetails?: { name: string; position: string; relationship: string }
  howLearned?: string
  referredBy?: string
}
 
// ── Step 3 — Educational Background ──
interface EducationLevelEntry {
  school: string
  address?: string
  yearsAttended?: string
  degree?: string
  honors?: string
}
interface GovExam { id: string; name: string; date: string; rating: string }
 
interface EducationBackground {
  elementary?: EducationLevelEntry
  secondary?: EducationLevelEntry
  college?: EducationLevelEntry
  postGraduate?: EducationLevelEntry
  vocational?: EducationLevelEntry
  govExams: GovExam[]
}
 
// ── Step 4 — Employment Record ──
interface EmploymentEntry {
  id: string
  position: string
  employer: string
  from: string
  to: string
  salary?: string
  reason?: string
}
 
// ── Step 5 — Other Information ──
interface YesNoDetail { answer: YesNo; details?: string }
interface OtherInfo {
  activities: { id: string; org: string; position: string; dates: string }[]
  skillsHobbies?: string
  trainings: { id: string; title: string; company: string; dates: string }[]
  caseFiled: YesNoDetail
  convicted: YesNoDetail
  smokes: YesNoDetail
  askedToResign: YesNoDetail
  surgery: YesNoDetail
  outstandingLoans: YesNoDetail
}
 
// ── Step 6 — References ──
interface EmergencyContact { id: string; name: string; relationship: string; address: string; phone: string }
interface CharacterRef { id: string; name: string; occupation: string; address: string; phone: string }
interface ReferencesInfo {
  emergencyContacts: EmergencyContact[]
  characterReferences: CharacterRef[]
}
 
// ── Step 7 — Availability & Final Review ──
interface Availability {
  howSoon?: string
  pendingApplications?: string
  certifiedNoObligation: boolean
  certifiedTruth: boolean
  signatureName: string
  submittedDate: string
}
 
interface ApplicantDetail {
  id: number
  name: string
  job: string
  dateApplied: string
  dateMoved: string
  stage: HiringStage
  status: ApplicantStatus
  resume: FileAsset
  locationSketch?: FileAsset
  personalInfo: PersonalInfo
  familyBackground: FamilyBackground
  educationBackground: EducationBackground
  employmentRecord: EmploymentEntry[]
  otherInfo: OtherInfo
  references: ReferencesInfo
  availability: Availability
  activity: ActivityEntry[]
}
 
// ─── Shared defaults (used to keep mock records short & consistent) ──
const NO_DETAIL: YesNoDetail = { answer: 'No' }
 
const DEFAULT_OTHER_INFO: OtherInfo = {
  activities: [],
  skillsHobbies: '',
  trainings: [],
  caseFiled: NO_DETAIL,
  convicted: NO_DETAIL,
  smokes: NO_DETAIL,
  askedToResign: NO_DETAIL,
  surgery: NO_DETAIL,
  outstandingLoans: NO_DETAIL,
}
 
function defaultFamily(fatherName: string, motherName: string): FamilyBackground {
  return {
    father: { name: fatherName, occupation: 'Not specified' },
    mother: { name: motherName, occupation: 'Not specified' },
    siblings: [],
    children: [],
    hasRelativeInCompany: 'No',
    howLearned: 'Online job posting',
  }
}
 
function defaultAvailability(name: string, dateApplied: string): Availability {
  return {
    howSoon: 'Immediately',
    certifiedNoObligation: true,
    certifiedTruth: true,
    signatureName: name,
    submittedDate: dateApplied,
  }
}
 
// ─── Mock Data ──────────────────────────────────────────────
// TODO: replace with a real Supabase fetch, e.g.
//   const { data } = await supabase.from('applicants').select('*').eq('id', id).single()
// Field structure mirrors the 7-step applicant portal spec (Personal Info,
// Family Background, Educational Background, Employment Record, Other Info,
// References, Availability). Keyed the same way as MOCK_APPLICANTS in
// applicants/page.tsx so the "View Profile" links there resolve to matching
// records here. Once both pages are backend-connected, this can be deleted
// and both pages can pull from the same query/hook instead of keeping two
// mock lists in sync.
const MOCK_APPLICANT_DETAILS: Record<number, ApplicantDetail> = {
  1: {
    id: 1, name: 'Maria Santos', job: 'HR Associate',
    dateApplied: '2026-06-02', dateMoved: '2026-06-30',
    stage: 'Initial Interview', status: 'active',
    resume: { fileName: 'Maria_Santos_Resume.pdf', sizeLabel: '238 KB', url: '#' },
    locationSketch: { fileName: 'Maria_Santos_Location_Sketch.pdf', sizeLabel: '96 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Batangas City, Batangas',
      provincialAddress: 'Batangas City, Batangas',
      residenceNumber: '(043) 723 1122',
      cellphone: '0917 123 4567',
      email: 'maria.santos@email.com',
      dateOfBirth: '1997-03-14',
      placeOfBirth: 'Batangas City',
      nationality: 'Filipino',
      sex: 'Female',
      age: '29',
      height: "5'3\"",
      weight: '52 kg',
      civilStatus: 'Single',
      sssNumber: '34-1234567-8',
      pagibigNumber: '1211-2345-6789',
      tin: '123-456-789-000',
      philhealthNumber: '02-345678901-2',
      coverNote: 'Applying for HR Associate. 2 years of admin/HR support experience at a BPO, handled onboarding paperwork and employee records.',
    },
    familyBackground: {
      father: { name: 'Ricardo Santos', address: 'Batangas City, Batangas', occupation: 'Tricycle Operator (self-employed)', age: '55' },
      mother: { name: 'Elena Santos', address: 'Batangas City, Batangas', occupation: 'Public School Teacher', age: '52' },
      siblings: [
        { id: 's1-1', name: 'Mark Santos', address: 'Batangas City, Batangas', occupation: 'College Student', age: '20' },
      ],
      children: [],
      hasRelativeInCompany: 'No',
      howLearned: 'Facebook job posting',
      referredBy: '',
    },
    educationBackground: {
      secondary: { school: 'Batangas City National High School', address: 'Batangas City', yearsAttended: '2010–2014', honors: '' },
      college: { school: 'Batangas State University', address: 'Batangas City', yearsAttended: '2014–2018', degree: 'BS Psychology', honors: 'Dean\'s Lister (2 terms)' },
      govExams: [
        { id: 'ge1-1', name: 'Civil Service Exam (Professional)', date: '2019-08-11', rating: '84.5' },
      ],
    },
    employmentRecord: [
      { id: 'e1-1', position: 'HR/Admin Support Associate', employer: 'ClearPath BPO Solutions, Batangas City', from: '2023-01', to: '2026-05', salary: '₱19,000/mo', reason: 'Seeking growth opportunity' },
    ],
    otherInfo: {
      ...DEFAULT_OTHER_INFO,
      activities: [
        { id: 'ac1-1', org: 'PsychSoc, BatStateU', position: 'Secretary', dates: '2016–2018' },
      ],
      skillsHobbies: 'Basic HRIS/Excel proficiency, event coordination, reading, badminton.',
      trainings: [
        { id: 't1-1', title: 'Basic Occupational Safety and Health (BOSH)', company: 'DOLE-accredited provider', dates: '2024-03' },
      ],
      surgery: { answer: 'Yes', details: 'Appendectomy, 2021 — fully recovered, no restrictions.' },
    },
    references: {
      emergencyContacts: [
        { id: 'ec1-1', name: 'Elena Santos', relationship: 'Mother', address: 'Batangas City, Batangas', phone: '0917 987 6543' },
      ],
      characterReferences: [
        { id: 'cr1-1', name: 'Jenny Ocampo', occupation: 'Team Lead, ClearPath BPO Solutions', address: 'Batangas City, Batangas', phone: '0918 222 3344' },
        { id: 'cr1-2', name: 'Fr. Anton Reyes', occupation: 'Parish Priest', address: 'Batangas City, Batangas', phone: '0919 555 6677' },
      ],
    },
    availability: defaultAvailability('Maria Santos', '2026-06-02'),
    activity: [
      { id: 'a1-1', label: 'Applied', date: '2026-06-02' },
      { id: 'a1-2', label: 'Moved to Initial Interview', date: '2026-06-30' },
    ],
  },
  2: {
    id: 2, name: 'Jose Reyes', job: 'HR Associate',
    dateApplied: '2026-06-03', dateMoved: '2026-06-05',
    stage: 'Applied', status: 'active',
    resume: { fileName: 'Jose_Reyes_Resume.pdf', sizeLabel: '190 KB', url: '#' },
    locationSketch: { fileName: 'Jose_Reyes_Location_Sketch.pdf', sizeLabel: '80 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Lipa City, Batangas',
      cellphone: '0918 234 5678',
      email: 'jose.reyes@email.com',
      dateOfBirth: '2003-09-02',
      sex: 'Male',
      age: '22',
      civilStatus: 'Single',
      coverNote: 'Fresh graduate, looking for an entry-level HR role. Completed OJT at a local manufacturing firm\'s HR department.',
    },
    familyBackground: defaultFamily('Danilo Reyes', 'Corazon Reyes'),
    educationBackground: {
      college: { school: 'University of Batangas', address: 'Batangas City', yearsAttended: '2021–2025', degree: 'BS Business Administration' },
      govExams: [],
    },
    employmentRecord: [],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec2-1', name: 'Corazon Reyes', relationship: 'Mother', address: 'Lipa City, Batangas', phone: '0918 777 8899' },
      ],
      characterReferences: [
        { id: 'cr2-1', name: 'Prof. Liza Manalo', occupation: 'OJT Coordinator, University of Batangas', address: 'Batangas City, Batangas', phone: '0919 111 2233' },
      ],
    },
    availability: defaultAvailability('Jose Reyes', '2026-06-03'),
    activity: [{ id: 'a2-1', label: 'Applied', date: '2026-06-03' }],
  },
  3: {
    id: 3, name: 'Ana Dela Cruz', job: 'HR Associate',
    dateApplied: '2026-06-04', dateMoved: '2026-06-09',
    stage: 'Exam / Assessment', status: 'active',
    resume: { fileName: 'Ana_DelaCruz_Resume.pdf', sizeLabel: '212 KB', url: '#' },
    locationSketch: { fileName: 'Ana_DelaCruz_Location_Sketch.pdf', sizeLabel: '88 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Alangilan, Batangas City',
      cellphone: '0919 345 6789',
      email: 'ana.delacruz@email.com',
      dateOfBirth: '1995-11-20',
      sex: 'Female',
      age: '30',
      civilStatus: 'Single',
      coverNote: 'Currently a freelance HR consultant for small businesses, wants a full-time role with growth opportunities.',
    },
    familyBackground: defaultFamily('Bonifacio Dela Cruz', 'Grace Dela Cruz'),
    educationBackground: {
      college: { school: 'Batangas State University', address: 'Batangas City', yearsAttended: '2013–2017', degree: 'BS Psychology' },
      govExams: [],
    },
    employmentRecord: [
      { id: 'e3-1', position: 'Freelance HR Consultant', employer: 'Self-employed', from: '2021-01', to: 'Present', reason: 'Seeking full-time stability' },
    ],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec3-1', name: 'Grace Dela Cruz', relationship: 'Mother', address: 'Alangilan, Batangas City', phone: '0919 456 7788' },
      ],
      characterReferences: [
        { id: 'cr3-1', name: 'Rico Bautista', occupation: 'Owner, RB Trading', address: 'Batangas City, Batangas', phone: '0920 333 4455' },
      ],
    },
    availability: defaultAvailability('Ana Dela Cruz', '2026-06-04'),
    activity: [
      { id: 'a3-1', label: 'Applied', date: '2026-06-04' },
      { id: 'a3-2', label: 'Moved to Initial Interview', date: '2026-06-07' },
      { id: 'a3-3', label: 'Moved to Exam / Assessment', date: '2026-06-09' },
    ],
  },
  4: {
    id: 4, name: 'Roberto Lim', job: 'HR Associate',
    dateApplied: '2026-06-05', dateMoved: '2026-06-22',
    stage: 'For Onboarding', status: 'active',
    resume: { fileName: 'Roberto_Lim_Resume.pdf', sizeLabel: '265 KB', url: '#' },
    locationSketch: { fileName: 'Roberto_Lim_Location_Sketch.pdf', sizeLabel: '102 KB', url: '#' },
    personalInfo: {
      presentAddress: 'San Pascual, Batangas',
      cellphone: '0920 456 7890',
      email: 'roberto.lim@email.com',
      dateOfBirth: '1992-02-18',
      sex: 'Male',
      age: '34',
      civilStatus: 'Married',
      coverNote: '4 years HR generalist experience, previously handled recruitment end-to-end for a retail chain.',
    },
    familyBackground: {
      ...defaultFamily('Antonio Lim', 'Susan Lim'),
      spouse: { name: 'Karen Lim', occupation: 'Nurse, San Pascual District Hospital', address: 'San Pascual, Batangas', age: '32' },
      children: [{ id: 'c4-1', name: 'Miguel Lim', age: '4' }],
    },
    educationBackground: {
      college: { school: 'De La Salle Lipa', address: 'Lipa City', yearsAttended: '2010–2014', degree: 'BS Human Resource Management' },
      govExams: [],
    },
    employmentRecord: [
      { id: 'e4-1', position: 'HR Generalist', employer: 'Prime Retail Group, Lipa City', from: '2019-06', to: '2026-05', salary: '₱24,000/mo', reason: 'Career advancement' },
    ],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec4-1', name: 'Karen Lim', relationship: 'Spouse', address: 'San Pascual, Batangas', phone: '0920 999 1122' },
      ],
      characterReferences: [
        { id: 'cr4-1', name: 'Nestor Villa', occupation: 'HR Manager, Prime Retail Group', address: 'Lipa City, Batangas', phone: '0921 444 5566' },
      ],
    },
    availability: defaultAvailability('Roberto Lim', '2026-06-05'),
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
    dateApplied: '2026-06-06', dateMoved: '2026-06-08',
    stage: 'Initial Interview', status: 'active',
    resume: { fileName: 'Carmen_Villanueva_Resume.pdf', sizeLabel: '301 KB', url: '#' },
    locationSketch: { fileName: 'Carmen_Villanueva_Location_Sketch.pdf', sizeLabel: '94 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Batangas City, Batangas',
      cellphone: '0921 567 8901',
      email: 'carmen.villanueva@email.com',
      dateOfBirth: '1990-05-09',
      sex: 'Female',
      age: '36',
      civilStatus: 'Married',
      coverNote: '6 years in operations, most recently supervising a 30-person warehouse team.',
    },
    familyBackground: {
      ...defaultFamily('Pedro Villanueva', 'Norma Villanueva'),
      spouse: { name: 'Jerome Villanueva', occupation: 'Civil Engineer', address: 'Batangas City, Batangas', age: '37' },
      children: [{ id: 'c5-1', name: 'Sofia Villanueva', age: '8' }, { id: 'c5-2', name: 'Diego Villanueva', age: '5' }],
    },
    educationBackground: {
      college: { school: 'Batangas State University', address: 'Batangas City', yearsAttended: '2007–2011', degree: 'BS Industrial Engineering' },
      govExams: [],
    },
    employmentRecord: [
      { id: 'e5-1', position: 'Warehouse Operations Supervisor', employer: 'LogisTrans Phils., Batangas City', from: '2020-02', to: '2026-05', salary: '₱35,000/mo', reason: 'Looking for a managerial role' },
    ],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec5-1', name: 'Jerome Villanueva', relationship: 'Spouse', address: 'Batangas City, Batangas', phone: '0921 888 9900' },
      ],
      characterReferences: [
        { id: 'cr5-1', name: 'Engr. Paolo Santos', occupation: 'Operations Director, LogisTrans Phils.', address: 'Batangas City, Batangas', phone: '0922 111 2233' },
      ],
    },
    availability: defaultAvailability('Carmen Villanueva', '2026-06-06'),
    activity: [
      { id: 'a5-1', label: 'Applied', date: '2026-06-06' },
      { id: 'a5-2', label: 'Moved to Initial Interview', date: '2026-06-08' },
    ],
  },
  6: {
    id: 6, name: 'Eduardo Torres', job: 'Operations Manager',
    dateApplied: '2026-06-07', dateMoved: '2026-06-12',
    stage: 'Department Interview', status: 'active',
    resume: { fileName: 'Eduardo_Torres_Resume.pdf', sizeLabel: '278 KB', url: '#' },
    locationSketch: { fileName: 'Eduardo_Torres_Location_Sketch.pdf', sizeLabel: '90 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Tanauan City, Batangas',
      cellphone: '0922 678 9012',
      email: 'eduardo.torres@email.com',
      dateOfBirth: '1988-07-30',
      sex: 'Male',
      age: '37',
      civilStatus: 'Married',
      coverNote: 'Previously operations supervisor at a logistics company, handled inventory and staff scheduling.',
    },
    familyBackground: {
      ...defaultFamily('Federico Torres', 'Milagros Torres'),
      spouse: { name: 'Angela Torres', occupation: 'Public School Teacher', address: 'Tanauan City, Batangas', age: '35' },
      children: [{ id: 'c6-1', name: 'Ella Torres', age: '9' }],
    },
    educationBackground: {
      college: { school: 'Batangas State University', address: 'Batangas City', yearsAttended: '2005–2009', degree: 'BS Industrial Technology' },
      govExams: [],
    },
    employmentRecord: [
      { id: 'e6-1', position: 'Operations Supervisor', employer: 'FastMove Logistics, Tanauan City', from: '2016-04', to: '2026-05', salary: '₱30,000/mo', reason: 'Seeking a bigger scope of responsibility' },
    ],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec6-1', name: 'Angela Torres', relationship: 'Spouse', address: 'Tanauan City, Batangas', phone: '0922 555 6677' },
      ],
      characterReferences: [
        { id: 'cr6-1', name: 'Rowena Cruz', occupation: 'HR Head, FastMove Logistics', address: 'Tanauan City, Batangas', phone: '0923 222 3344' },
      ],
    },
    availability: defaultAvailability('Eduardo Torres', '2026-06-07'),
    activity: [
      { id: 'a6-1', label: 'Applied', date: '2026-06-07' },
      { id: 'a6-2', label: 'Moved to Initial Interview', date: '2026-06-09' },
      { id: 'a6-3', label: 'Moved to Exam / Assessment', date: '2026-06-10' },
      { id: 'a6-4', label: 'Moved to Department Interview', date: '2026-06-12' },
    ],
  },
  7: {
    id: 7, name: 'Liza Ramos', job: 'Accounting Clerk',
    dateApplied: '2026-06-08', dateMoved: '2026-06-10',
    stage: 'Initial Interview', status: 'active',
    resume: { fileName: 'Liza_Ramos_Resume.pdf', sizeLabel: '205 KB', url: '#' },
    locationSketch: { fileName: 'Liza_Ramos_Location_Sketch.pdf', sizeLabel: '84 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Malvar, Batangas',
      cellphone: '0923 789 0123',
      email: 'liza.ramos@email.com',
      dateOfBirth: '1999-01-25',
      sex: 'Female',
      age: '27',
      civilStatus: 'Single',
      coverNote: 'CPA board passer, 1 year experience as junior bookkeeper for a family-owned business.',
    },
    familyBackground: defaultFamily('Arnel Ramos', 'Fe Ramos'),
    educationBackground: {
      college: { school: 'Lyceum of the Philippines University - Batangas', address: 'Batangas City', yearsAttended: '2017–2021', degree: 'BS Accountancy' },
      govExams: [
        { id: 'ge7-1', name: 'CPA Licensure Examination', date: '2022-05-15', rating: 'Passed' },
      ],
    },
    employmentRecord: [
      { id: 'e7-1', position: 'Junior Bookkeeper', employer: 'RG Family Store, Malvar', from: '2022-07', to: '2026-05', salary: '₱16,000/mo', reason: 'Seeking a corporate accounting role' },
    ],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec7-1', name: 'Fe Ramos', relationship: 'Mother', address: 'Malvar, Batangas', phone: '0923 666 7788' },
      ],
      characterReferences: [
        { id: 'cr7-1', name: 'Ruth Aguilar', occupation: 'Owner, RG Family Store', address: 'Malvar, Batangas', phone: '0924 111 2233' },
      ],
    },
    availability: defaultAvailability('Liza Ramos', '2026-06-08'),
    activity: [
      { id: 'a7-1', label: 'Applied', date: '2026-06-08' },
      { id: 'a7-2', label: 'Moved to Initial Interview', date: '2026-06-10' },
    ],
  },
  8: {
    id: 8, name: 'Paolo Garcia', job: 'Accounting Clerk',
    dateApplied: '2026-06-09', dateMoved: '2026-06-11',
    stage: 'Exam / Assessment', status: 'active',
    resume: { fileName: 'Paolo_Garcia_Resume.pdf', sizeLabel: '183 KB', url: '#' },
    locationSketch: { fileName: 'Paolo_Garcia_Location_Sketch.pdf', sizeLabel: '78 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Sto. Tomas, Batangas',
      cellphone: '0924 890 1234',
      email: 'paolo.garcia@email.com',
      dateOfBirth: '2002-10-12',
      sex: 'Male',
      age: '23',
      civilStatus: 'Single',
      coverNote: 'Recent graduate with an internship at a local cooperative doing accounts payable.',
    },
    familyBackground: defaultFamily('Ernesto Garcia', 'Divina Garcia'),
    educationBackground: {
      college: { school: 'Batangas State University', address: 'Batangas City', yearsAttended: '2020–2024', degree: 'BS Accounting Technology' },
      govExams: [],
    },
    employmentRecord: [],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec8-1', name: 'Divina Garcia', relationship: 'Mother', address: 'Sto. Tomas, Batangas', phone: '0924 555 6677' },
      ],
      characterReferences: [
        { id: 'cr8-1', name: 'Amelia Torres', occupation: 'Manager, Sto. Tomas Multipurpose Cooperative', address: 'Sto. Tomas, Batangas', phone: '0925 111 2233' },
      ],
    },
    availability: defaultAvailability('Paolo Garcia', '2026-06-09'),
    activity: [
      { id: 'a8-1', label: 'Applied', date: '2026-06-09' },
      { id: 'a8-2', label: 'Moved to Initial Interview', date: '2026-06-10' },
      { id: 'a8-3', label: 'Moved to Exam / Assessment', date: '2026-06-11' },
    ],
  },
  9: {
    id: 9, name: 'Tina Cruz', job: 'Accounting Clerk',
    dateApplied: '2026-06-10', dateMoved: '2026-06-14',
    stage: 'Initial Interview', status: 'active',
    resume: { fileName: 'Tina_Cruz_Resume.pdf', sizeLabel: '220 KB', url: '#' },
    locationSketch: { fileName: 'Tina_Cruz_Location_Sketch.pdf', sizeLabel: '86 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Bauan, Batangas',
      cellphone: '0925 901 2345',
      email: 'tina.cruz@email.com',
      dateOfBirth: '1996-04-03',
      sex: 'Female',
      age: '30',
      civilStatus: 'Single',
      coverNote: '2 years as accounting assistant at a manufacturing firm, comfortable with QuickBooks and Excel.',
    },
    familyBackground: defaultFamily('Alfredo Cruz', 'Marilou Cruz'),
    educationBackground: {
      college: { school: 'Batangas State University', address: 'Batangas City', yearsAttended: '2014–2018', degree: 'BS Accountancy' },
      govExams: [],
    },
    employmentRecord: [
      { id: 'e9-1', position: 'Accounting Assistant', employer: 'Bauan Steel Works Inc.', from: '2024-01', to: '2026-05', salary: '₱18,000/mo', reason: 'Seeking better opportunity' },
    ],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec9-1', name: 'Marilou Cruz', relationship: 'Mother', address: 'Bauan, Batangas', phone: '0925 444 5566' },
      ],
      characterReferences: [
        { id: 'cr9-1', name: 'Henry Lopez', occupation: 'Finance Supervisor, Bauan Steel Works Inc.', address: 'Bauan, Batangas', phone: '0926 111 2233' },
      ],
    },
    availability: defaultAvailability('Tina Cruz', '2026-06-10'),
    activity: [
      { id: 'a9-1', label: 'Applied', date: '2026-06-10' },
      { id: 'a9-2', label: 'Moved to Initial Interview', date: '2026-06-14' },
    ],
  },
  10: {
    id: 10, name: 'Mark Aquino', job: 'IT Support Specialist',
    dateApplied: '2026-06-11', dateMoved: '2026-06-28',
    stage: 'For Onboarding', status: 'active',
    resume: { fileName: 'Mark_Aquino_Resume.pdf', sizeLabel: '250 KB', url: '#' },
    locationSketch: { fileName: 'Mark_Aquino_Location_Sketch.pdf', sizeLabel: '92 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Alangilan, Batangas City',
      cellphone: '0926 012 3456',
      email: 'mark.aquino@email.com',
      dateOfBirth: '1998-12-19',
      sex: 'Male',
      age: '27',
      civilStatus: 'Single',
      coverNote: '3 years IT support experience, handled helpdesk tickets and basic network troubleshooting for a BPO.',
    },
    familyBackground: defaultFamily('Rolando Aquino', 'Cecilia Aquino'),
    educationBackground: {
      college: { school: 'Batangas State University', address: 'Batangas City', yearsAttended: '2016–2020', degree: 'BS Information Technology' },
      govExams: [],
    },
    employmentRecord: [
      { id: 'e10-1', position: 'IT Support Associate', employer: 'ClearPath BPO Solutions, Batangas City', from: '2021-03', to: '2026-05', salary: '₱20,000/mo', reason: 'Seeking career growth' },
    ],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec10-1', name: 'Cecilia Aquino', relationship: 'Mother', address: 'Alangilan, Batangas City', phone: '0926 777 8899' },
      ],
      characterReferences: [
        { id: 'cr10-1', name: 'Jayson Del Rosario', occupation: 'IT Team Lead, ClearPath BPO Solutions', address: 'Batangas City, Batangas', phone: '0927 111 2233' },
      ],
    },
    availability: defaultAvailability('Mark Aquino', '2026-06-11'),
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
    dateApplied: '2026-06-01', dateMoved: '2026-06-06',
    stage: 'Initial Interview', status: 'rejected',
    resume: { fileName: 'Bianca_Reyes_Resume.pdf', sizeLabel: '176 KB', url: '#' },
    locationSketch: { fileName: 'Bianca_Reyes_Location_Sketch.pdf', sizeLabel: '76 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Ibaan, Batangas',
      cellphone: '0927 123 4567',
      email: 'bianca.reyes@email.com',
      dateOfBirth: '2000-06-08',
      sex: 'Female',
      age: '26',
      civilStatus: 'Single',
      coverNote: 'Applying for HR Associate, previously worked as a receptionist with light administrative duties.',
    },
    familyBackground: {
      ...defaultFamily('Willy Reyes', 'Josefina Reyes'),
      hasRelativeInCompany: 'Yes',
      relativeDetails: { name: 'Jose Reyes', position: 'Applicant — HR Associate', relationship: 'Cousin' },
    },
    educationBackground: {
      college: { school: 'University of Batangas', address: 'Batangas City', yearsAttended: '2018–2022', degree: 'BS Business Administration' },
      govExams: [],
    },
    employmentRecord: [
      { id: 'e11-1', position: 'Front Desk Receptionist', employer: 'Ibaan Medical Clinic', from: '2022-08', to: '2026-05', salary: '₱13,000/mo', reason: 'Seeking HR-focused role' },
    ],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec11-1', name: 'Josefina Reyes', relationship: 'Mother', address: 'Ibaan, Batangas', phone: '0927 555 6677' },
      ],
      characterReferences: [
        { id: 'cr11-1', name: 'Dr. Marissa Ong', occupation: 'Clinic Owner, Ibaan Medical Clinic', address: 'Ibaan, Batangas', phone: '0928 111 2233' },
      ],
    },
    availability: defaultAvailability('Bianca Reyes', '2026-06-01'),
    activity: [
      { id: 'a11-1', label: 'Applied', date: '2026-06-01' },
      { id: 'a11-2', label: 'Moved to Initial Interview', date: '2026-06-04' },
      { id: 'a11-3', label: 'Rejected at Initial Interview', date: '2026-06-06', note: 'Not enough relevant HR experience for the role at this time.' },
    ],
  },
  12: {
    id: 12, name: 'Ramon Flores', job: 'Accounting Clerk',
    dateApplied: '2026-06-08', dateMoved: '2026-06-13',
    stage: 'Exam / Assessment', status: 'rejected',
    resume: { fileName: 'Ramon_Flores_Resume.pdf', sizeLabel: '160 KB', url: '#' },
    locationSketch: { fileName: 'Ramon_Flores_Location_Sketch.pdf', sizeLabel: '70 KB', url: '#' },
    personalInfo: {
      presentAddress: 'Taal, Batangas',
      cellphone: '0928 234 5678',
      email: 'ramon.flores@email.com',
      dateOfBirth: '1994-08-21',
      sex: 'Male',
      age: '31',
      civilStatus: 'Single',
      coverNote: 'Applying for Accounting Clerk, background mostly in retail cash handling rather than bookkeeping.',
    },
    familyBackground: defaultFamily('Isagani Flores', 'Rowena Flores'),
    educationBackground: {
      college: { school: 'Lyceum of the Philippines University - Batangas', address: 'Batangas City', yearsAttended: '2012–2016', degree: 'BS Accountancy' },
      govExams: [],
    },
    employmentRecord: [
      { id: 'e12-1', position: 'Cashier', employer: 'Taal Public Market Store', from: '2017-05', to: '2026-05', salary: '₱12,000/mo', reason: 'Seeking accounting-related work' },
    ],
    otherInfo: DEFAULT_OTHER_INFO,
    references: {
      emergencyContacts: [
        { id: 'ec12-1', name: 'Rowena Flores', relationship: 'Mother', address: 'Taal, Batangas', phone: '0928 888 9900' },
      ],
      characterReferences: [
        { id: 'cr12-1', name: 'Estelita Ramos', occupation: 'Store Owner, Taal Public Market Store', address: 'Taal, Batangas', phone: '0929 111 2233' },
      ],
    },
    availability: defaultAvailability('Ramon Flores', '2026-06-08'),
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
 
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[#8fa3b0] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
 
// ─── Small display primitives for the Application Details accordion ──
function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-[#8fa3b0] dark:text-[#6b8fa3] text-xs uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-[#1a2a35] dark:text-[#e2edf3]">{value}</dd>
    </div>
  )
}
 
function DetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">{children}</dl>
}
 
function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm text-[#8fa3b0] dark:text-[#6b8fa3] italic">{text}</p>
}
 
function SubHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold tracking-wide text-[#8fa3b0] dark:text-[#6b8fa3] uppercase mt-5 mb-2 first:mt-0">{children}</h4>
}
 
function MiniCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded p-3 mb-2 last:mb-0 text-sm text-[#1a2a35] dark:text-[#e2edf3]">
      {children}
    </div>
  )
}
 
function EducationEntry({ label, entry }: { label: string; entry?: EducationLevelEntry }) {
  if (!entry || !entry.school) return null
  return (
    <MiniCard>
      <p className="font-medium">{label}: {entry.school}</p>
      <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">
        {[entry.address, entry.yearsAttended].filter(Boolean).join(' · ')}
      </p>
      {entry.degree && <p className="text-xs mt-0.5">Degree/Major: {entry.degree}</p>}
      {entry.honors && <p className="text-xs mt-0.5">Honors: {entry.honors}</p>}
    </MiniCard>
  )
}
 
function YesNoLine({ question, detail }: { question: string; detail: YesNoDetail }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-[#e2e8ed] dark:border-[#1e3448] last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[#1a2a35] dark:text-[#e2edf3]">{question}</span>
        <span className={`${components.badge.base} ${detail.answer === 'Yes' ? components.badge.pending : components.badge.applied}`}>
          {detail.answer}
        </span>
      </div>
      {detail.answer === 'Yes' && detail.details && (
        <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] pl-0.5">{detail.details}</p>
      )}
    </div>
  )
}
 
// ─── Accordion shell ──────────────────────────────────────────
function AccordionSection({
  title, isOpen, onToggle, children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#f4f7f9] dark:bg-[#0d1f2d] hover:bg-[#eaf6f9] dark:hover:bg-[#1e3448] transition-colors text-left"
      >
        <span className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3]">{title}</span>
        <ChevronIcon open={isOpen} />
      </button>
      {isOpen && (
        <div className="px-4 py-4 border-t border-[#e2e8ed] dark:border-[#1e3448]">
          {children}
        </div>
      )}
    </div>
  )
}
 
const APPLICATION_DETAIL_SECTIONS = [
  'personal',
  'family',
  'education',
  'employment',
  'other',
  'references',
  'availability',
] as const
type SectionKey = typeof APPLICATION_DETAIL_SECTIONS[number]
 
export default function ApplicantProfilePage() {
  const params = useParams<{ id: string }>()
  const applicantId = Number(params.id)
  const baseRecord = MOCK_APPLICANT_DETAILS[applicantId]
 
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(baseRecord ?? null)
  const [noteDraft, setNoteDraft] = useState('')
  const [confirmingReject, setConfirmingReject] = useState(false)
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set(['personal']))
 
  function toggleSection(key: SectionKey) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }
 
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
  const { personalInfo, familyBackground, educationBackground, employmentRecord, otherInfo, references, availability } = applicant
 
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
 
          {/* Application Details — mirrors the 7-step applicant portal form, read-only accordion */}
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-1">Application Details</h3>
            <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mb-4">
              Full submission from the applicant portal, organized the same way as the 7-step form.
            </p>
 
            <div className="space-y-3">
              {/* 1. Personal Information */}
              <AccordionSection
                title="1. Personal Information"
                isOpen={openSections.has('personal')}
                onToggle={() => toggleSection('personal')}
              >
                <DetailGrid>
                  <DetailRow label="Present Address" value={personalInfo.presentAddress} />
                  <DetailRow label="Provincial Address" value={personalInfo.provincialAddress} />
                  <DetailRow label="Residence Number" value={personalInfo.residenceNumber} />
                  <DetailRow label="Cellphone Number" value={personalInfo.cellphone} />
                  <DetailRow label="Email" value={personalInfo.email} />
                  <DetailRow label="Date of Birth" value={personalInfo.dateOfBirth} />
                  <DetailRow label="Place of Birth" value={personalInfo.placeOfBirth} />
                  <DetailRow label="Nationality" value={personalInfo.nationality} />
                  <DetailRow label="Sex" value={personalInfo.sex} />
                  <DetailRow label="Age" value={personalInfo.age} />
                  <DetailRow label="Height" value={personalInfo.height} />
                  <DetailRow label="Weight" value={personalInfo.weight} />
                  <DetailRow label="Civil Status" value={personalInfo.civilStatus} />
                  <DetailRow label="SSS Number" value={personalInfo.sssNumber} />
                  <DetailRow label="Pag-IBIG Number" value={personalInfo.pagibigNumber} />
                  <DetailRow label="T.I.N." value={personalInfo.tin} />
                  <DetailRow label="PhilHealth Number" value={personalInfo.philhealthNumber} />
                </DetailGrid>
                {personalInfo.coverNote && (
                  <>
                    <SubHeading>Cover Note</SubHeading>
                    <p className="text-sm text-[#1a2a35] dark:text-[#e2edf3] leading-relaxed">{personalInfo.coverNote}</p>
                  </>
                )}
              </AccordionSection>
 
              {/* 2. Family Background */}
              <AccordionSection
                title="2. Family Background"
                isOpen={openSections.has('family')}
                onToggle={() => toggleSection('family')}
              >
                <SubHeading>Father</SubHeading>
                <DetailGrid>
                  <DetailRow label="Name" value={familyBackground.father.name} />
                  <DetailRow label="Address" value={familyBackground.father.address} />
                  <DetailRow label="Occupation & Company" value={familyBackground.father.occupation} />
                  <DetailRow label="Age" value={familyBackground.father.age} />
                </DetailGrid>
 
                <SubHeading>Mother</SubHeading>
                <DetailGrid>
                  <DetailRow label="Name" value={familyBackground.mother.name} />
                  <DetailRow label="Address" value={familyBackground.mother.address} />
                  <DetailRow label="Occupation & Company" value={familyBackground.mother.occupation} />
                  <DetailRow label="Age" value={familyBackground.mother.age} />
                </DetailGrid>
 
                <SubHeading>Sibling(s)</SubHeading>
                {familyBackground.siblings.length === 0 ? (
                  <EmptyNote text="Only child / none listed." />
                ) : (
                  familyBackground.siblings.map((s) => (
                    <MiniCard key={s.id}>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">
                        {[s.address, s.occupation, s.age ? `Age ${s.age}` : ''].filter(Boolean).join(' · ')}
                      </p>
                    </MiniCard>
                  ))
                )}
 
                {personalInfo.civilStatus === 'Married' && (
                  <>
                    <SubHeading>Spouse</SubHeading>
                    {familyBackground.spouse ? (
                      <DetailGrid>
                        <DetailRow label="Name" value={familyBackground.spouse.name} />
                        <DetailRow label="Address" value={familyBackground.spouse.address} />
                        <DetailRow label="Occupation & Company" value={familyBackground.spouse.occupation} />
                        <DetailRow label="Age" value={familyBackground.spouse.age} />
                      </DetailGrid>
                    ) : (
                      <EmptyNote text="Not provided." />
                    )}
                  </>
                )}
 
                <SubHeading>Children</SubHeading>
                {familyBackground.children.length === 0 ? (
                  <EmptyNote text="None listed." />
                ) : (
                  familyBackground.children.map((c) => (
                    <MiniCard key={c.id}>
                      <p className="font-medium">{c.name} <span className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] font-normal">— Age {c.age}</span></p>
                    </MiniCard>
                  ))
                )}
 
                <SubHeading>Relative(s)/Friend(s) Employed with the Company</SubHeading>
                <YesNoLine
                  question="Has relative(s)/friend(s) presently employed with the company?"
                  detail={{ answer: familyBackground.hasRelativeInCompany }}
                />
                {familyBackground.hasRelativeInCompany === 'Yes' && familyBackground.relativeDetails && (
                  <MiniCard>
                    <p className="font-medium">{familyBackground.relativeDetails.name}</p>
                    <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">
                      {familyBackground.relativeDetails.position} · Relationship: {familyBackground.relativeDetails.relationship}
                    </p>
                  </MiniCard>
                )}
 
                <SubHeading>Source</SubHeading>
                <DetailGrid>
                  <DetailRow label="How did you learn about our company?" value={familyBackground.howLearned} />
                  <DetailRow label="Who referred you to us?" value={familyBackground.referredBy} />
                </DetailGrid>
              </AccordionSection>
 
              {/* 3. Educational Background */}
              <AccordionSection
                title="3. Educational Background"
                isOpen={openSections.has('education')}
                onToggle={() => toggleSection('education')}
              >
                <EducationEntry label="Elementary" entry={educationBackground.elementary} />
                <EducationEntry label="Secondary" entry={educationBackground.secondary} />
                <EducationEntry label="College" entry={educationBackground.college} />
                <EducationEntry label="Post-Graduate" entry={educationBackground.postGraduate} />
                <EducationEntry label="Vocational" entry={educationBackground.vocational} />
                {!educationBackground.elementary && !educationBackground.secondary && !educationBackground.college
                  && !educationBackground.postGraduate && !educationBackground.vocational && (
                  <EmptyNote text="No education levels provided." />
                )}
 
                <SubHeading>Government Examination(s) Taken</SubHeading>
                {educationBackground.govExams.length === 0 ? (
                  <EmptyNote text="None listed." />
                ) : (
                  educationBackground.govExams.map((ex) => (
                    <MiniCard key={ex.id}>
                      <p className="font-medium">{ex.name}</p>
                      <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">Date: {ex.date} · Rating: {ex.rating}</p>
                    </MiniCard>
                  ))
                )}
              </AccordionSection>
 
              {/* 4. Employment Record */}
              <AccordionSection
                title="4. Employment Record"
                isOpen={openSections.has('employment')}
                onToggle={() => toggleSection('employment')}
              >
                {employmentRecord.length === 0 ? (
                  <EmptyNote text="No prior employment listed (e.g. fresh graduate)." />
                ) : (
                  employmentRecord.map((job) => (
                    <MiniCard key={job.id}>
                      <p className="font-medium">{job.position} — {job.employer}</p>
                      <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">
                        {job.from} to {job.to}{job.salary ? ` · ${job.salary}` : ''}
                      </p>
                      {job.reason && <p className="text-xs mt-0.5">Reason for leaving: {job.reason}</p>}
                    </MiniCard>
                  ))
                )}
              </AccordionSection>
 
              {/* 5. Other Information */}
              <AccordionSection
                title="5. Other Information"
                isOpen={openSections.has('other')}
                onToggle={() => toggleSection('other')}
              >
                <SubHeading>Activities (School / Community / Professional Orgs)</SubHeading>
                {otherInfo.activities.length === 0 ? (
                  <EmptyNote text="None listed." />
                ) : (
                  otherInfo.activities.map((a) => (
                    <MiniCard key={a.id}>
                      <p className="font-medium">{a.org}</p>
                      <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">{a.position} · {a.dates}</p>
                    </MiniCard>
                  ))
                )}
 
                <SubHeading>Special Skills, Qualifications, Talents & Hobbies</SubHeading>
                {otherInfo.skillsHobbies ? (
                  <p className="text-sm text-[#1a2a35] dark:text-[#e2edf3]">{otherInfo.skillsHobbies}</p>
                ) : (
                  <EmptyNote text="None listed." />
                )}
 
                <SubHeading>Trainings & Seminars Attended</SubHeading>
                {otherInfo.trainings.length === 0 ? (
                  <EmptyNote text="None listed." />
                ) : (
                  otherInfo.trainings.map((t) => (
                    <MiniCard key={t.id}>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">{t.company} · {t.dates}</p>
                    </MiniCard>
                  ))
                )}
 
                <SubHeading>Background Questions</SubHeading>
                <div className="border border-[#e2e8ed] dark:border-[#1e3448] rounded px-3">
                  <YesNoLine question="Has there been a case filed against you?" detail={otherInfo.caseFiled} />
                  <YesNoLine question="Have you ever been convicted of any offense or crime?" detail={otherInfo.convicted} />
                  <YesNoLine question="Do you smoke?" detail={otherInfo.smokes} />
                  <YesNoLine question="Have you ever been asked to resign or terminated/dismissed by a previous employer?" detail={otherInfo.askedToResign} />
                  <YesNoLine question="Have you undergone any surgery?" detail={otherInfo.surgery} />
                  <YesNoLine question="Do you have any outstanding loans?" detail={otherInfo.outstandingLoans} />
                </div>
              </AccordionSection>
 
              {/* 6. References */}
              <AccordionSection
                title="6. References"
                isOpen={openSections.has('references')}
                onToggle={() => toggleSection('references')}
              >
                <SubHeading>Person(s) to Notify in Case of Emergency</SubHeading>
                {references.emergencyContacts.length === 0 ? (
                  <EmptyNote text="None provided." />
                ) : (
                  references.emergencyContacts.map((c) => (
                    <MiniCard key={c.id}>
                      <p className="font-medium">{c.name} <span className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] font-normal">— {c.relationship}</span></p>
                      <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">{c.address} · {c.phone}</p>
                    </MiniCard>
                  ))
                )}
 
                <SubHeading>Character References</SubHeading>
                <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mb-2 italic">Excludes relatives or the applicant&apos;s present employer.</p>
                {references.characterReferences.length === 0 ? (
                  <EmptyNote text="None provided." />
                ) : (
                  references.characterReferences.map((c) => (
                    <MiniCard key={c.id}>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mt-0.5">{c.occupation} · {c.address} · {c.phone}</p>
                    </MiniCard>
                  ))
                )}
              </AccordionSection>
 
              {/* 7. Availability & Final Review */}
              <AccordionSection
                title="7. Availability & Final Review"
                isOpen={openSections.has('availability')}
                onToggle={() => toggleSection('availability')}
              >
                <DetailGrid>
                  <DetailRow label="How soon can you start?" value={availability.howSoon} />
                  <DetailRow label="Pending applications with other companies?" value={availability.pendingApplications || 'None stated'} />
                  <DetailRow label="Date Submitted" value={availability.submittedDate} />
                  <DetailRow label="Applicant's Signature" value={availability.signatureName} />
                </DetailGrid>
                <SubHeading>Certifications</SubHeading>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-start gap-2">
                    <span className={availability.certifiedNoObligation ? 'text-[#198754]' : 'text-[#e05252]'}>
                      {availability.certifiedNoObligation ? '✓' : '✗'}
                    </span>
                    <span className="text-[#1a2a35] dark:text-[#e2edf3]">
                      Confirms that the mere filing of this form does not obligate the company to hire their services.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={availability.certifiedTruth ? 'text-[#198754]' : 'text-[#e05252]'}>
                      {availability.certifiedTruth ? '✓' : '✗'}
                    </span>
                    <span className="text-[#1a2a35] dark:text-[#e2edf3]">
                      Certifies to the truth and correctness of the information and data provided above.
                    </span>
                  </li>
                </ul>
              </AccordionSection>
            </div>
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
 
          {/* Location Sketch */}
          <div className="bg-white dark:bg-[#132435] border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#0f1f29] dark:text-[#e2edf3] mb-1">Location Sketch</h3>
            <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3] mb-4">
              Applicant-submitted sketch of the route to/from their residence and the AIMI office.
            </p>
            {applicant.locationSketch ? (
              <div className="flex items-center gap-3 border border-[#e2e8ed] dark:border-[#1e3448] rounded-lg p-4">
                <div className="w-10 h-10 rounded bg-[#eaf6f9] dark:bg-[#0d2b38] flex items-center justify-center text-[#00bbda] shrink-0">
                  <FileIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a2a35] dark:text-[#e2edf3] truncate">{applicant.locationSketch.fileName}</p>
                  <p className="text-xs text-[#8fa3b0] dark:text-[#6b8fa3]">{applicant.locationSketch.sizeLabel}</p>
                </div>
                <a href={applicant.locationSketch.url} target="_blank" rel="noopener noreferrer" className={components.btnOutlineSm}>
                  View
                </a>
                <a href={applicant.locationSketch.url} download className={components.btnNeutralSm}>
                  Download
                </a>
              </div>
            ) : (
              <EmptyNote text="No location sketch submitted yet." />
            )}
            {/* TODO: once file storage is wired up, locationSketch.url should be a signed URL
                and "View" should open it in a lightweight preview (iframe/embed for PDFs/images)
                instead of a bare new tab — same pattern as the Resume block above. */}
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