'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, Check, Clock, AlertCircle, User, Users, GraduationCap,
  Briefcase, Phone, Shield, HeartPulse, ClipboardList, PenLine, Info, Upload
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Theme tokens — matches the rest of src/app/dashboard/page.tsx exactly
   ───────────────────────────────────────────────────────────── */
const T = {
  navy: '#0B2A4A',
  cyan: '#12B6D6',
  gray: '#6B7A8D',
  bg: '#F7F9FA',
  faint: '#9BAAB8',
  cyanBg: '#EEF9FB',
  cyanBorder: '#B8EAF3',
  locked: '#D1DAE3'

};

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ─────────────────────────────────────────────────────────────
   Generic field primitives
   ───────────────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold mb-1.5" style={{ color: T.navy }}>{children}</label>;
}

const inputCls =
  'w-full px-3.5 py-2.5 text-sm rounded-lg  outline-none transition-colors focus:';
const inputStyle: React.CSSProperties = { backgroundColor: T.bg, color: T.navy };

function TextField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={inputCls} style={inputStyle} />
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder = 'Select...' }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className={inputCls + ' resize-none'} style={inputStyle} />
    </div>
  );
}

function YesNo({ label, value, onChange, detailValue, onDetailChange, detailLabel = 'If yes, please provide details' }: {
  label: string; value: 'yes' | 'no' | ''; onChange: (v: 'yes' | 'no') => void;
  detailValue?: string; onDetailChange?: (v: string) => void; detailLabel?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-4 mb-2">
        {(['yes', 'no'] as const).map((opt) => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: value === opt ? T.navy : T.gray }}>
            <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2"
              style={{ backgroundColor: value === opt ? T.cyan : 'transparent', borderColor: value === opt ? T.cyan : T.faint }}>
              {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            {opt === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
      {value === 'yes' && onDetailChange && (
        <input type="text" value={detailValue} onChange={(e) => onDetailChange(e.target.value)} placeholder={detailLabel}
          className={inputCls} style={inputStyle} />
      )}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 text-sm" style={{ color: T.navy }}>
      <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 border-2"
        style={{ backgroundColor: checked ? T.cyan : 'transparent', borderColor: checked ? T.cyan : T.faint }}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </span>
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Accordion section wrapper
   ───────────────────────────────────────────────────────────── */
function Section({ id, icon: Icon, title, subtitle, openId, setOpenId, children }: {
  id: string; icon: React.ElementType; title: string; subtitle: string;
  openId: string | null; setOpenId: (id: string | null) => void; children: React.ReactNode;
}) {
  const isOpen = openId === id;
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [isOpen]);

  return (
    <div ref={sectionRef} className="rounded-xl overflow-hidden" style={{}}>
      <button type="button" onClick={() => setOpenId(isOpen ? null : id)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-black/[0.02] transition-colors">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.cyanBg }}>
          <Icon className="w-4 h-4" style={{ color: T.cyan }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm" style={{ color: T.navy }}>{title}</div>
          <div className="text-xs mt-0.5" style={{ color: T.gray }}>{subtitle}</div>
        </div>
        <ChevronDown className={cn('w-4 h-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} style={{ color: T.faint }} />
      </button>
      {isOpen && (
        <div className="px-4 pb-5 pt-1 space-y-4 animate-fade-slide-up" style={{}}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Repeating row helpers
   ───────────────────────────────────────────────────────────── */
function RepeatingRows<T>({ rows, setRows, empty, fields }: {
  rows: T[]; setRows: (rows: T[]) => void; empty: T;
  fields: { key: keyof T; label: string; grow?: boolean }[];
}) {
  const update = (idx: number, key: keyof T, val: string) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [key]: val };
    setRows(next);
  };
  return (
    <div className="space-y-2.5">
      {rows.map((row, idx) => (
        <div key={idx} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0,1fr))` }}>
          {fields.map((f) => (
            <input key={String(f.key)} value={(row as Record<string, string>)[f.key as string] ?? ''}
              onChange={(e) => update(idx, f.key, e.target.value)} placeholder={f.label}
              className={inputCls + ' text-xs'} style={inputStyle} />
          ))}
        </div>
      ))}
      <div className="flex gap-2">
        <button type="button" onClick={() => setRows([...rows, empty])}
          className="text-xs font-semibold hover:underline" style={{ color: T.cyan }}>+ Add another</button>
        {rows.length > 1 && (
          <button type="button" onClick={() => setRows(rows.slice(0, -1))}
            className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Remove last</button>
        )}
      </div>
    </div>
  );
}

function NARepeatingSection<T>({ label, na, setNa, rows, setRows, empty, fields }: {
  label: string; na: boolean; setNa: (v: boolean) => void;
  rows: T[]; setRows: (rows: T[]) => void; empty: T;
  fields: { key: keyof T; label: string; grow?: boolean }[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label>{label}</Label>
        <Checkbox label="N/A" checked={na} onChange={setNa} />
      </div>
      {!na && <RepeatingRows rows={rows} setRows={setRows} empty={empty} fields={fields} />}
    </div>
  );
}

function NAPersonSection({ label, na, setNa, state, setState, nameLabel = 'Name' }: {
  label: string; na: boolean; setNa: (v: boolean) => void;
  state: Person; setState: (p: Person) => void; nameLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label>{label}</Label>
        <Checkbox label="N/A" checked={na} onChange={(checked) => { setNa(checked); if (checked) setState(emptyPerson); }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input value={state.name} disabled={na} onChange={(e) => setState({ ...state, name: e.target.value })} placeholder={nameLabel} className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
        <input value={state.address} disabled={na} onChange={(e) => setState({ ...state, address: e.target.value })} placeholder="Address" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
        <input value={state.occupation} disabled={na} onChange={(e) => setState({ ...state, occupation: e.target.value })} placeholder="Occupation & Company" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
        <input value={state.age} disabled={na} onChange={(e) => setState({ ...state, age: e.target.value })} placeholder="Age" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Philippine address data & other dropdown option lists
   Note: City/Municipality and Barangay stay as free text — the full PSGC
   list (1,600+ cities/municipalities, 42,000+ barangays) is too large to
   embed here, but Region and Province are real dropdowns.
   ───────────────────────────────────────────────────────────── */
const PH_REGIONS = [
  'NCR – National Capital Region',
  'CAR – Cordillera Administrative Region',
  'Region I – Ilocos Region',
  'Region II – Cagayan Valley',
  'Region III – Central Luzon',
  'Region IV-A – CALABARZON',
  'MIMAROPA Region',
  'Region V – Bicol Region',
  'Region VI – Western Visayas',
  'Region VII – Central Visayas',
  'Region VIII – Eastern Visayas',
  'Region IX – Zamboanga Peninsula',
  'Region X – Northern Mindanao',
  'Region XI – Davao Region',
  'Region XII – SOCCSKSARGEN',
  'Region XIII – Caraga',
  'BARMM – Bangsamoro Autonomous Region',
];

const PH_PROVINCES_BY_REGION: Record<string, string[]> = {
  'NCR – National Capital Region': ['Metro Manila'],
  'CAR – Cordillera Administrative Region': ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'],
  'Region I – Ilocos Region': ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'],
  'Region II – Cagayan Valley': ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'],
  'Region III – Central Luzon': ['Aurora', 'Bataan', 'Bulacan', 'Nueva Ecija', 'Pampanga', 'Tarlac', 'Zambales'],
  'Region IV-A – CALABARZON': ['Batangas', 'Cavite', 'Laguna', 'Quezon', 'Rizal'],
  'MIMAROPA Region': ['Marinduque', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan', 'Romblon'],
  'Region V – Bicol Region': ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon'],
  'Region VI – Western Visayas': ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo', 'Negros Occidental'],
  'Region VII – Central Visayas': ['Bohol', 'Cebu', 'Negros Oriental', 'Siquijor'],
  'Region VIII – Eastern Visayas': ['Biliran', 'Eastern Samar', 'Leyte', 'Northern Samar', 'Samar', 'Southern Leyte'],
  'Region IX – Zamboanga Peninsula': ['Zamboanga del Norte', 'Zamboanga del Sur', 'Zamboanga Sibugay'],
  'Region X – Northern Mindanao': ['Bukidnon', 'Camiguin', 'Lanao del Norte', 'Misamis Occidental', 'Misamis Oriental'],
  'Region XI – Davao Region': ['Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental', 'Davao Oriental'],
  'Region XII – SOCCSKSARGEN': ['Cotabato', 'Sarangani', 'South Cotabato', 'Sultan Kudarat'],
  'Region XIII – Caraga': ['Agusan del Norte', 'Agusan del Sur', 'Dinagat Islands', 'Surigao del Norte', 'Surigao del Sur'],
  'BARMM – Bangsamoro Autonomous Region': ['Basilan', 'Lanao del Sur', 'Maguindanao del Norte', 'Maguindanao del Sur', 'Sulu', 'Tawi-Tawi']
};

const PH_MOBILE_RE = /^(09\d{9}|\+639\d{9})$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LicenseRow = { license: string; dateAcquired: string };
const emptyLicense: LicenseRow = { license: '', dateAcquired: '' };


const AVAILABLE_POSITIONS = [
  'IT Support Specialist', 'Sales Representative', 'Marketing Specialist', 'Warehouse Staff',
  'Logistics Coordinator', 'Finance Officer', 'OJT Intern (IT/CS)', 'OJT Intern (Marketing)',
];

const RELIGION_OPTIONS = [
  'Roman Catholic', 'Islam', 'Iglesia ni Cristo', 'Evangelical', 'Born Again Christian',
  'Aglipayan', 'Seventh-day Adventist', "Jehovah's Witness", 'Buddhist', 'Others',
];

const HOW_LEARNED_OPTIONS = [
  'Facebook', 'JobStreet', 'Indeed', 'LinkedIn', 'Referral from Employee',
];

const CHILDREN_COUNT_OPTIONS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];

/* ─────────────────────────────────────────────────────────────
   Form state shape
   ───────────────────────────────────────────────────────────── */
type Person = { name: string; address: string; occupation: string; age: string };
type Child = { name: string; age: string };
type Relative = { name: string; positionDept: string; relationship: string };
type EduRow = { school: string; years: string; degree: string; honors: string };
type ExamRow = { exam: string; date: string; rating: string };
type SimpleRow = { title: string; place: string; dates: string };
type JobRow = {
  company: string; position: string; lastSalary: string; allowances: string; bonus: string; otherBenefits: string;
  majorFunctions: string; accomplishments: string; reasonForLeaving: string; immediateSuperior: string;
  employmentDurationFrom: string; employmentDurationTo: string; contactNo: string;
};
type RefRow = { name: string; occupation: string; telephone: string; address: string };

const emptyPerson: Person = { name: '', address: '', occupation: '', age: '' };
const emptyChild: Child = { name: '', age: '' };
const emptyRelative: Relative = { name: '', positionDept: '', relationship: '' };
const emptyExam: ExamRow = { exam: '', date: '', rating: '' };
const emptySimpleRow: SimpleRow = { title: '', place: '', dates: '' };
const emptyJob: JobRow = {
  company: '', position: '', lastSalary: '', allowances: '', bonus: '', otherBenefits: '',
  majorFunctions: '', accomplishments: '', reasonForLeaving: '', immediateSuperior: '', employmentDurationFrom: '', employmentDurationTo: '', contactNo: ''
};
const emptyRef: RefRow = { name: '', occupation: '', telephone: '', address: '' };

// Shape returned by GET /api/pds - a saved row, or null if nothing submitted yet.
type SavedPds = {
  last_name?: string | null; first_name?: string | null; middle_name?: string | null; nickname?: string | null;
  present_address?: string | null; provincial_address?: string | null;
  how_often_visit_province?: string | null; travel_time_minutes?: string | null;
  residence_number?: string | null; cellphone?: string | null; email?: string | null;
  religion?: string | null; desired_salary?: string | null;
  date_of_birth?: string | null; place_of_birth?: string | null; nationality?: string | null;
  sex?: string | null; age?: string | null; height?: string | null; weight?: string | null;
  civil_status?: string | null; sss_number?: string | null; tin?: string | null;
  pagibig_number?: string | null; philhealth_number?: string | null; health_issues?: string | null;
  father_name?: string | null; father_address?: string | null; father_occupation?: string | null; father_age?: string | null; father_na?: boolean | null;
  mother_name?: string | null; mother_address?: string | null; mother_occupation?: string | null; mother_age?: string | null; mother_na?: boolean | null;
  spouse_name?: string | null; spouse_address?: string | null; spouse_occupation?: string | null; spouse_age?: string | null; spouse_na?: boolean | null;
  siblings?: Person[] | null; siblings_na?: boolean | null;
  children?: Child[] | null;
  has_relative_in_company?: string | null; relatives?: Relative[] | null;
  elementary?: EduRow | null; secondary?: EduRow | null; college?: EduRow | null; post_graduate?: EduRow | null; vocational?: EduRow | null;
  why_took_course?: string | null;
  licenses?: LicenseRow[] | null; licenses_na?: boolean | null;
  gov_exams?: ExamRow[] | null; gov_exams_na?: boolean | null;
  trainings?: SimpleRow[] | null; trainings_na?: boolean | null;
  activities?: SimpleRow[] | null; activities_na?: boolean | null;
  special_skills?: string | null;
  employment_record?: JobRow[] | null;
  character_references?: RefRow[] | null; character_references_na?: boolean | null;
  emergency_name?: string | null; emergency_relationship?: string | null; emergency_telephone?: string | null; emergency_address?: string | null;
  declarations?: Record<string, string> | null;
  personality_profiling?: Record<string, unknown> | null;
  work_preferences?: Record<string, unknown> | null;
  certify_truth_correctness?: boolean | null;
  signature_name?: string | null;
  photo_file_name?: string | null;
  signature_file_name?: string | null;
  location_sketch_file_name?: string | null;
  photo_signed_url?: string | null;
  signature_signed_url?: string | null;
  sketch_signed_url?: string | null;
} | null;

/* ─────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────────── */
export default function PersonalDataSheetContent({ isCurrent, onSubmit, applicationId, positionTitle, applicationDate }: { isCurrent: boolean; onSubmit: () => void; applicationId: number | string | null; positionTitle?: string; applicationDate?: string | Date | null; }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>('basic');
  const [loadingSaved, setLoadingSaved] = useState(true);

  // ── Basic / contact (deduped: Date + Position + Salary Desired asked once) ──
  const [dateApplied, setDateApplied] = useState('');
  const [positionApplied, setPositionApplied] = useState('');
  const [desiredSalary, setDesiredSalary] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [nickname, setNickname] = useState('');
  const [presentRegion, setPresentRegion] = useState('');
  const [presentProvince, setPresentProvince] = useState('');
  const [presentCity, setPresentCity] = useState('');
  const [presentBarangay, setPresentBarangay] = useState('');
  const [presentStreet, setPresentStreet] = useState('');
  const [presentAddressLoaded, setPresentAddressLoaded] = useState<string | null>(null);
  const [provRegion, setProvRegion] = useState('');
  const [provProvince, setProvProvince] = useState('');
  const [provCity, setProvCity] = useState('');
  const [provBarangay, setProvBarangay] = useState('');
  const [provStreet, setProvStreet] = useState('');
  const [provAddressLoaded, setProvAddressLoaded] = useState<string | null>(null);
  const [travelTime, setTravelTime] = useState('');
  const [howOftenVisit, setHowOftenVisit] = useState('');
  const [contactResidence, setContactResidence] = useState('');
  const [contactCellphone, setContactCellphone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [religion, setReligion] = useState('');
  const [religionOther, setReligionOther] = useState('');
  const [dob, setDob] = useState('');
  const [pob, setPob] = useState('');
  const [nationality, setNationality] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [sss, setSss] = useState('');
  const [tin, setTin] = useState('');
  const [pagibig, setPagibig] = useState('');
  const [philhealth, setPhilhealth] = useState('');
  const [healthIssues, setHealthIssues] = useState('');

  // -- Photo --
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const handlePhotoFile = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result as string); setPhotoConfirmed(false); };
    reader.readAsDataURL(file);
  };

  // ── Family background ──
  const [father, setFather] = useState<Person>(emptyPerson);
  const [naFather, setNaFather] = useState(false);
  const [mother, setMother] = useState<Person>(emptyPerson);
  const [naMother, setNaMother] = useState(false);
  const [siblings, setSiblings] = useState<Person[]>([emptyPerson]);
  const [spouse, setSpouse] = useState<Person>(emptyPerson);
  const [naSpouse, setNaSpouse] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenCount, setChildrenCount] = useState('');
  const [hasRelativesInCompany, setHasRelativesInCompany] = useState<'yes' | 'no' | ''>('');
  const [relatives, setRelatives] = useState<Relative[]>([emptyRelative]);
  const [howLearned, setHowLearned] = useState('');
  const [howLearnedOther, setHowLearnedOther] = useState('');
  const [referredBy, setReferredBy] = useState('');

  // ── Education ──
  const [eduElementary, setEduElementary] = useState<EduRow>({ school: '', years: '', degree: '', honors: '' });
  const [eduSecondary, setEduSecondary] = useState<EduRow>({ school: '', years: '', degree: '', honors: '' });
  const [eduCollege, setEduCollege] = useState<EduRow>({ school: '', years: '', degree: '', honors: '' });
  const [eduPostGrad, setEduPostGrad] = useState<EduRow>({ school: '', years: '', degree: '', honors: '' });
  const [eduVocational, setEduVocational] = useState<EduRow>({ school: '', years: '', degree: '', honors: '' });
  const [naEduLevels, setNaEduLevels] = useState<string[]>([]);
  const [whyTookCourse, setWhyTookCourse] = useState('');
  const [licenses, setLicenses] = useState<LicenseRow[]>([emptyLicense]);
  const [naLicenses, setNaLicenses] = useState(false);
  const [naSiblings, setNaSiblings] = useState(false);
  const [naGovExams, setNaGovExams] = useState(false);
  const [naTrainings, setNaTrainings] = useState(false);
  const [naActivities, setNaActivities] = useState(false);
  const [naCharRefs, setNaCharRefs] = useState(false);
  const [naWorkExperience, setNaWorkExperience] = useState(false);
  const [govExams, setGovExams] = useState<ExamRow[]>([emptyExam]);
  const [trainings, setTrainings] = useState<SimpleRow[]>([emptySimpleRow]);
  const [activities, setActivities] = useState<SimpleRow[]>([emptySimpleRow]);
  const [specialSkills, setSpecialSkills] = useState('');

  // ── Work experience (up to 3 companies, per the form) ──
  const [jobs, setJobs] = useState<JobRow[]>([emptyJob, emptyJob, emptyJob]);
  const updateJob = (idx: number, patch: Partial<JobRow>) => {
    const next = [...jobs];
    next[idx] = { ...next[idx], ...patch };
    setJobs(next);
  };

  // ── References & emergency contact ──
  const [charRefs, setCharRefs] = useState<RefRow[]>([emptyRef, emptyRef]);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyTelephone, setEmergencyTelephone] = useState('');
  const [emergencyAddress, setEmergencyAddress] = useState('');

  // ── Declarations ──
  const [outstandingLoans, setOutstandingLoans] = useState<'yes' | 'no' | ''>('');
  const [outstandingLoansDetail, setOutstandingLoansDetail] = useState('');
  const [convicted, setConvicted] = useState<'yes' | 'no' | ''>('');
  const [convictedDetail, setConvictedDetail] = useState('');
  const [surgery, setSurgery] = useState<'yes' | 'no' | ''>('');
  const [surgeryDetail, setSurgeryDetail] = useState('');
  const [terminated, setTerminated] = useState<'yes' | 'no' | ''>('');
  const [terminatedDetail, setTerminatedDetail] = useState('');
  const [pendingApps, setPendingApps] = useState<'yes' | 'no' | ''>('');
  const [pendingAppsDetail, setPendingAppsDetail] = useState('');
  const [caseFiled, setCaseFiled] = useState<'yes' | 'no' | ''>('');
  const [caseFiledDetail, setCaseFiledDetail] = useState('');
  const [doYouSmoke, setDoYouSmoke] = useState<'yes' | 'no' | ''>('');
  const [howSoonStart, setHowSoonStart] = useState('');

  // ── Personality profiling ──
  const [resignTriggers, setResignTriggers] = useState('');
  const [stayFactors, setStayFactors] = useState('');
  const [handleStress, setHandleStress] = useState('');
  const [copeWithCriticism, setCopeWithCriticism] = useState('');
  const [hobbiesInterests, setHobbiesInterests] = useState('');
  const [strengths, setStrengths] = useState(['', '', '']);
  const [improvements, setImprovements] = useState(['', '', '']);
  const [coreValues, setCoreValues] = useState(['', '', '', '', '']);
  const [futurePlans, setFuturePlans] = useState('');
  const [parentalSupport, setParentalSupport] = useState('');
  const [familyMedicalCondition, setFamilyMedicalCondition] = useState('');
  const [familyIssues, setFamilyIssues] = useState('');
  const [selfDescription, setSelfDescription] = useState('');

  // ── Preferences ──
  const [willingMonToSat, setWillingMonToSat] = useState('');
  const [willingShifting, setWillingShifting] = useState('');
  const [willingAnywhere, setWillingAnywhere] = useState('');
  const [ifNotWhy, setIfNotWhy] = useState('');
  const [areaOfAssignment, setAreaOfAssignment] = useState<string[]>([]);
  const [willingTraining, setWillingTraining] = useState('');
  const [freeLodging, setFreeLodging] = useState<'yes' | 'no' | ''>('');

  // ── Certification ──
  const [certify, setCertify] = useState(false);
  const [eSignature, setESignature] = useState('');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const handleSignatureFile = (file: File) => {
    setSignatureFile(file);
    const reader = new FileReader();
    reader.onload = () => setSignatureImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [sketchFileName, setSketchFileName] = useState('');
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const handleSketchFile = (file: File) => {
    setSketchFile(file);
    setSketchFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setSketchImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleChildrenCountChange = (val: string) => {
    setChildrenCount(val);
    const n = val === '10+' ? 10 : parseInt(val || '0', 10);
    setChildren((prev) => {
      const next = [...prev];
      while (next.length < n) next.push({ ...emptyChild });
      return next.slice(0, n);
    });
  };

  const toggleArea = (area: string) => {
    setAreaOfAssignment((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  };

  useEffect(() => {
    if (positionTitle) setPositionApplied(positionTitle);
    if (applicationDate) {
      const iso = typeof applicationDate === 'string' ? applicationDate : new Date(applicationDate).toISOString();
      setDateApplied(iso.slice(0, 10));
    }
  }, [positionTitle, applicationDate]);

  // Load any previously-submitted PDS so a refresh (or HR sending it back
  // for revision) doesn't start from a blank form. Structured fields
  // (siblings, education, work history, declarations, etc.) restore
  // exactly since they're saved as JSON matching this form's shape.
  // Present/Provincial Address were saved as a single combined string
  // (not broken back into Region/Province/City/Barangay), so we restore
  // that combined string into the Street line as a readable fallback and
  // leave the dropdowns for the applicant to reselect if needed.
  useEffect(() => {
    if (!applicationId) {
      setLoadingSaved(false);
      return;
    }
    let active = true;
    fetch(`/api/pds?application_id=${encodeURIComponent(applicationId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SavedPds) => {
        if (!active || !data) return;

        setLastName(data.last_name ?? '');
        setFirstName(data.first_name ?? '');
        setMiddleName(data.middle_name ?? '');
        setNickname(data.nickname ?? '');

        if (data.present_address) {
          setPresentStreet(data.present_address);
          setPresentAddressLoaded(data.present_address);
        }
        if (data.provincial_address) {
          setProvStreet(data.provincial_address);
          setProvAddressLoaded(data.provincial_address);
        }

        setHowOftenVisit(data.how_often_visit_province ?? '');
        setTravelTime(data.travel_time_minutes ?? '');
        setContactResidence(data.residence_number ?? '');
        setContactCellphone(data.cellphone ?? '');
        setContactEmail(data.email ?? '');

        const savedReligion = data.religion ?? '';
        if (savedReligion && !RELIGION_OPTIONS.includes(savedReligion)) {
          setReligion('Others');
          setReligionOther(savedReligion);
        } else {
          setReligion(savedReligion);
        }

        setDesiredSalary(data.desired_salary ?? '');
        setDob(data.date_of_birth ? String(data.date_of_birth).slice(0, 10) : '');
        setPob(data.place_of_birth ?? '');
        setNationality(data.nationality ?? '');
        setSex(data.sex ?? '');
        setAge(data.age ?? '');
        setHeight(data.height ?? '');
        setWeight(data.weight ?? '');
        setCivilStatus(data.civil_status ?? '');
        setSss(data.sss_number ?? '');
        setTin(data.tin ?? '');
        setPagibig(data.pagibig_number ?? '');
        setPhilhealth(data.philhealth_number ?? '');
        setHealthIssues(data.health_issues ?? '');

        setFather({ name: data.father_name ?? '', address: data.father_address ?? '', occupation: data.father_occupation ?? '', age: data.father_age ?? '' });
        setNaFather(Boolean(data.father_na));
        setMother({ name: data.mother_name ?? '', address: data.mother_address ?? '', occupation: data.mother_occupation ?? '', age: data.mother_age ?? '' });
        setNaMother(Boolean(data.mother_na));
        setSpouse({ name: data.spouse_name ?? '', address: data.spouse_address ?? '', occupation: data.spouse_occupation ?? '', age: data.spouse_age ?? '' });
        setNaSpouse(Boolean(data.spouse_na));

        if (data.siblings && data.siblings.length > 0) setSiblings(data.siblings);
        setNaSiblings(Boolean(data.siblings_na));

        if (data.children) {
          setChildren(data.children);
          setChildrenCount(data.children.length >= 10 ? '10+' : String(data.children.length));
        }

        setHasRelativesInCompany((data.has_relative_in_company as 'yes' | 'no' | '') ?? '');
        if (data.relatives && data.relatives.length > 0) setRelatives(data.relatives);

        const naLevels: string[] = [];
        if (data.elementary) setEduElementary(data.elementary); else naLevels.push('Elementary');
        if (data.secondary) setEduSecondary(data.secondary); else naLevels.push('Secondary');
        if (data.college) setEduCollege(data.college); else naLevels.push('College');
        if (data.post_graduate) setEduPostGrad(data.post_graduate); else naLevels.push('Post-Graduate');
        if (data.vocational) setEduVocational(data.vocational); else naLevels.push('Vocational');
        setNaEduLevels(naLevels);
        setWhyTookCourse(data.why_took_course ?? '');

        if (data.licenses && data.licenses.length > 0) setLicenses(data.licenses);
        setNaLicenses(Boolean(data.licenses_na));
        if (data.gov_exams && data.gov_exams.length > 0) setGovExams(data.gov_exams);
        setNaGovExams(Boolean(data.gov_exams_na));
        if (data.trainings && data.trainings.length > 0) setTrainings(data.trainings);
        setNaTrainings(Boolean(data.trainings_na));
        if (data.activities && data.activities.length > 0) setActivities(data.activities);
        setNaActivities(Boolean(data.activities_na));
        setSpecialSkills(data.special_skills ?? '');

        if (data.employment_record && data.employment_record.length > 0) {
          setJobs(data.employment_record);
          setNaWorkExperience(false);
        } else {
          setNaWorkExperience(true);
        }

        if (data.character_references && data.character_references.length > 0) setCharRefs(data.character_references);
        setNaCharRefs(Boolean(data.character_references_na));
        setEmergencyName(data.emergency_name ?? '');
        setEmergencyRelationship(data.emergency_relationship ?? '');
        setEmergencyTelephone(data.emergency_telephone ?? '');
        setEmergencyAddress(data.emergency_address ?? '');

        const decl = data.declarations ?? {};
        setOutstandingLoans((decl.outstandingLoans as 'yes' | 'no' | '') ?? '');
        setOutstandingLoansDetail(decl.outstandingLoansDetail ?? '');
        setConvicted((decl.convicted as 'yes' | 'no' | '') ?? '');
        setConvictedDetail(decl.convictedDetail ?? '');
        setSurgery((decl.surgery as 'yes' | 'no' | '') ?? '');
        setSurgeryDetail(decl.surgeryDetail ?? '');
        setTerminated((decl.terminated as 'yes' | 'no' | '') ?? '');
        setTerminatedDetail(decl.terminatedDetail ?? '');
        setPendingApps((decl.pendingApps as 'yes' | 'no' | '') ?? '');
        setPendingAppsDetail(decl.pendingAppsDetail ?? '');
        setCaseFiled((decl.caseFiled as 'yes' | 'no' | '') ?? '');
        setCaseFiledDetail(decl.caseFiledDetail ?? '');
        setDoYouSmoke((decl.doYouSmoke as 'yes' | 'no' | '') ?? '');
        setHowSoonStart(decl.howSoonStart ?? '');

        const pp = (data.personality_profiling ?? {}) as Record<string, any>;
        setResignTriggers(pp.resignTriggers ?? '');
        setStayFactors(pp.stayFactors ?? '');
        setHandleStress(pp.handleStress ?? '');
        setCopeWithCriticism(pp.copeWithCriticism ?? '');
        setHobbiesInterests(pp.hobbiesInterests ?? '');
        if (Array.isArray(pp.strengths)) setStrengths(pp.strengths);
        if (Array.isArray(pp.improvements)) setImprovements(pp.improvements);
        if (Array.isArray(pp.coreValues)) setCoreValues(pp.coreValues);
        setFuturePlans(pp.futurePlans ?? '');
        setParentalSupport(pp.parentalSupport ?? '');
        setFamilyMedicalCondition(pp.familyMedicalCondition ?? '');
        setFamilyIssues(pp.familyIssues ?? '');
        setSelfDescription(pp.selfDescription ?? '');

        const wp = (data.work_preferences ?? {}) as Record<string, any>;
        setWillingMonToSat(wp.willingMonToSat ?? '');
        setWillingShifting(wp.willingShifting ?? '');
        setWillingAnywhere(wp.willingAnywhere ?? '');
        setIfNotWhy(wp.ifNotWhy ?? '');
        if (Array.isArray(wp.areaOfAssignment)) setAreaOfAssignment(wp.areaOfAssignment);
        setWillingTraining(wp.willingTraining ?? '');
        setFreeLodging((wp.freeLodging as 'yes' | 'no' | '') ?? '');

        setCertify(Boolean(data.certify_truth_correctness));
        setESignature(data.signature_name ?? '');

        if (data.photo_signed_url) { setPhoto(data.photo_signed_url); setPhotoConfirmed(true); }
        if (data.signature_signed_url) setSignatureImage(data.signature_signed_url);
        if (data.sketch_signed_url) {
          setSketchImage(data.sketch_signed_url);
          setSketchFileName(data.location_sketch_file_name ?? '');
        }
      })
      .catch((err) => console.error('Load PDS error:', err))
      .finally(() => {
        if (active) setLoadingSaved(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId]);

  const f = (v: string) => v.trim().length > 0;
  const eduAllNA = naEduLevels.length === 5;
  const showWhyTookCourse = !(naEduLevels.includes('College') || eduAllNA);

  const missing: { section: string; label: string }[] = [];
  const check = (section: string, label: string, ok: boolean) => { if (!ok) missing.push({ section, label }); };

  // Basic & contact
  check('Basic & Contact Information', 'Photo (2x2 ID picture)', !!photo && photoConfirmed);
  check('Basic & Contact Information', 'Date Applied', f(dateApplied));
  check('Basic & Contact Information', 'Position Applied For', f(positionApplied));
  check('Basic & Contact Information', 'Last Name', f(lastName));
  check('Basic & Contact Information', 'First Name', f(firstName));
  check('Basic & Contact Information', 'Middle Name', f(middleName));
  check('Basic & Contact Information', 'Nickname', f(nickname));
  check('Basic & Contact Information', 'Present Address (Region/Province)', f(presentRegion) && f(presentProvince));
  check('Basic & Contact Information', 'Present Address (City/Municipality)', f(presentCity));
  check('Basic & Contact Information', 'Present Address (Barangay)', f(presentBarangay));
  check('Basic & Contact Information', 'Present Address (Street)', f(presentStreet));
  check('Basic & Contact Information', 'Provincial Address (Region/Province)', f(provRegion) && f(provProvince));
  check('Basic & Contact Information', 'Provincial Address (City/Municipality)', f(provCity));
  check('Basic & Contact Information', 'Provincial Address (Barangay)', f(provBarangay));
  check('Basic & Contact Information', 'Provincial Address (Street)', f(provStreet));
  check('Basic & Contact Information', 'How often do you visit your province?', f(howOftenVisit));
  check('Basic & Contact Information', 'Travel time to area of assignment', f(travelTime));
  check('Basic & Contact Information', 'Residence No.', f(contactResidence));
  check('Basic & Contact Information', 'Cellphone No. (valid format)', PH_MOBILE_RE.test(contactCellphone.trim()));
  check('Basic & Contact Information', 'Email Address (valid format)', EMAIL_RE.test(contactEmail.trim()));
  check('Basic & Contact Information', 'Religion', f(religion) && (religion !== 'Others' || f(religionOther)));
  check('Basic & Contact Information', 'Desired Salary / Package', f(desiredSalary));
  check('Basic & Contact Information', 'Date of Birth', f(dob));
  check('Basic & Contact Information', 'Place of Birth', f(pob));
  check('Basic & Contact Information', 'Nationality', f(nationality));
  check('Basic & Contact Information', 'Sex', f(sex));
  check('Basic & Contact Information', 'Age', f(age));
  check('Basic & Contact Information', 'Height', f(height));
  check('Basic & Contact Information', 'Weight', f(weight));
  check('Basic & Contact Information', 'Civil Status', f(civilStatus));
  check('Basic & Contact Information', 'SSS Number', f(sss));
  check('Basic & Contact Information', 'T.I.N.', f(tin));
  check('Basic & Contact Information', 'Pag-IBIG #', f(pagibig));
  check('Basic & Contact Information', 'PhilHealth #', f(philhealth));
  check('Basic & Contact Information', 'Health issues / condition', f(healthIssues));

  // Family background
  if (!naFather) check('Family Background', 'Name of Father (all fields, or mark N/A)', f(father.name) && f(father.address) && f(father.occupation) && f(father.age));
  if (!naMother) check('Family Background', 'Name of Mother (all fields, or mark N/A)', f(mother.name) && f(mother.address) && f(mother.occupation) && f(mother.age));
  if (civilStatus === 'Married') {
    if (!naSpouse) check('Family Background', 'Name of Spouse (all fields, or mark N/A)', f(spouse.name) && f(spouse.address) && f(spouse.occupation) && f(spouse.age));
    check('Family Background', 'Number of Children', f(childrenCount));
    if (children.length > 0) {
      check('Family Background', 'Names of Children & Ages', children.every((c) => f(c.name) && f(c.age)));
    }
  } else {
    if (!naSiblings) check('Family Background', 'Name of Brother(s)/Sister(s) (or mark N/A)', siblings.every((s) => f(s.name) && f(s.address) && f(s.occupation) && f(s.age)));
  }
  check('Family Background', 'Relatives employed with the company (Yes/No)', hasRelativesInCompany !== '');
  if (hasRelativesInCompany === 'yes') {
    check('Family Background', 'Relatives employed with the company (details)', relatives.every((r) => f(r.name) && f(r.positionDept) && f(r.relationship)));
  }
  check('Family Background', 'How did you learn about our company?', f(howLearned) && (howLearned !== 'Others' || f(howLearnedOther)));
  check('Family Background', 'Who referred you to us?', f(referredBy));

  // Education
  ([
    ['Elementary', eduElementary], ['Secondary', eduSecondary], ['College', eduCollege],
    ['Post-Graduate', eduPostGrad], ['Vocational', eduVocational],
  ] as const).forEach(([label, row]) => {
    if (!naEduLevels.includes(label)) {
      check('Educational Background', `${label} (all fields, or mark N/A)`, f(row.school) && f(row.years) && f(row.degree) && f(row.honors));
    }
  });
  if (showWhyTookCourse) check('Educational Background', 'Why did you take up this course?', f(whyTookCourse));
  if (!naLicenses) check('Educational Background', 'License(s) (or mark N/A)', licenses.every((l) => f(l.license) && f(l.dateAcquired)));
  if (!naGovExams) check('Educational Background', 'Government Examination(s) Taken (or mark N/A)', govExams.every((g) => f(g.exam) && f(g.date) && f(g.rating)));
  if (!naTrainings) check('Educational Background', 'Trainings and Seminars Attended (or mark N/A)', trainings.every((t) => f(t.title) && f(t.place) && f(t.dates)));
  if (!naActivities) check('Educational Background', 'Activities (or mark N/A)', activities.every((a) => f(a.title) && f(a.place) && f(a.dates)));
  check('Educational Background', 'Special Skills, Qualifications, Talents and Hobbies', f(specialSkills));

  // Work experience
  if (!naWorkExperience) {
    check('Work Experience', 'Each company (or mark N/A if no experience)',
      jobs.every((j) => f(j.company) && f(j.position) && f(j.lastSalary) && f(j.majorFunctions) && f(j.accomplishments) && f(j.reasonForLeaving) && f(j.immediateSuperior) && f(j.employmentDurationFrom) && f(j.employmentDurationTo) && f(j.contactNo)));
  }

  // References & emergency contact
  if (!naCharRefs) check('References & Emergency Contact', 'Character References (or mark N/A)', charRefs.every((r) => f(r.name) && f(r.occupation) && f(r.telephone) && f(r.address)));
  check('References & Emergency Contact', 'Emergency Contact Name', f(emergencyName));
  check('References & Emergency Contact', 'Emergency Contact Relationship', f(emergencyRelationship));
  check('References & Emergency Contact', 'Emergency Contact Telephone', f(emergencyTelephone));
  check('References & Emergency Contact', 'Emergency Contact Address', f(emergencyAddress));

  // Declarations
  const yesNoChecks: [string, 'yes' | 'no' | '', string][] = [
    ['Outstanding loans', outstandingLoans, outstandingLoansDetail],
    ['Convicted of offense/crime', convicted, convictedDetail],
    ['Undergone surgery', surgery, surgeryDetail],
    ['Asked to resign / terminated', terminated, terminatedDetail],
    ['Pending applications with other companies', pendingApps, pendingAppsDetail],
    ['Case/s filed against you', caseFiled, caseFiledDetail],
  ];
  yesNoChecks.forEach(([label, val, detail]) => {
    check('Other Information & Declarations', label, val !== '' && (val !== 'yes' || f(detail)));
  });
  check('Other Information & Declarations', 'Do you smoke?', doYouSmoke !== '');
  check('Other Information & Declarations', 'How soon can you start?', f(howSoonStart));

  // Personality profiling
  check('Personality Profiling', 'What would probably make you resign?', f(resignTriggers));
  check('Personality Profiling', 'What will make you stay in a company?', f(stayFactors));
  check('Personality Profiling', 'How do you handle stress?', f(handleStress));
  check('Personality Profiling', 'How do you cope with criticisms?', f(copeWithCriticism));
  check('Personality Profiling', 'Hobbies and interests aside from work', f(hobbiesInterests));
  check('Personality Profiling', 'Strengths (all 3)', strengths.every(f));
  check('Personality Profiling', 'Areas for Improvement (all 3)', improvements.every(f));
  check('Personality Profiling', 'Top 5 Core Values (all 5)', coreValues.every(f));
  check('Personality Profiling', '3–5 year plan', f(futurePlans));
  check('Personality Profiling', 'Parental/partner support', f(parentalSupport));
  check('Personality Profiling', 'Family medical condition', f(familyMedicalCondition));
  check('Personality Profiling', 'Family issues or disputes', f(familyIssues));
  check('Personality Profiling', 'Self-description', f(selfDescription));

  // Preferences
  check('Work Preferences', 'Willing for Mondays to Saturdays?', f(willingMonToSat));
  check('Work Preferences', 'Willing for Shifting Schedule?', f(willingShifting));
  check('Work Preferences', 'Willing to be assigned anywhere?', f(willingAnywhere));
  check('Work Preferences', 'Area of Assignment (at least one)', areaOfAssignment.length > 0);
  check('Work Preferences', 'Willing to undergo Training Period?', f(willingTraining));
  check('Work Preferences', 'To avail free lodging?', freeLodging !== '');

  // Certification
  check('Certification & E-Signature', 'Certification checkbox', certify);
  check('Certification & E-Signature', "Applicant's Signature", f(eSignature));
  check('Certification & E-Signature', "Uploaded Signature Image", !!signatureImage);

  const canSubmit = missing.length === 0;
  const missingSections = Array.from(new Set(missing.map((m) => m.section)));

  const handleSubmit = async () => {
    if (!canSubmit || !applicationId) return;
    setSubmitting(true);
    setSubmitError(null);

    const combineAddress = (region: string, province: string, city: string, barangay: string, street: string) =>
      [street, barangay, city, province, region].filter(Boolean).join(', ');

    const payload = {
      application_id: applicationId,
      last_name: lastName,
      first_name: firstName,
      middle_name: middleName,
      nickname: nickname,
      present_address: combineAddress(presentRegion, presentProvince, presentCity, presentBarangay, presentStreet),
      provincial_address: combineAddress(provRegion, provProvince, provCity, provBarangay, provStreet),
      how_often_visit_province: howOftenVisit,
      travel_time_minutes: travelTime,
      residence_number: contactResidence,
      cellphone: contactCellphone,
      email: contactEmail,
      religion: religion === 'Others' ? religionOther : religion,
      desired_salary: desiredSalary,
      date_of_birth: dob || null,
      place_of_birth: pob,
      nationality: nationality,
      sex: sex,
      age: age,
      height: height,
      weight: weight,
      civil_status: civilStatus,
      sss_number: sss,
      tin: tin,
      pagibig_number: pagibig,
      philhealth_number: philhealth,
      health_issues: healthIssues,
      father_name: father.name, father_address: father.address, father_occupation: father.occupation, father_age: father.age, father_na: naFather,
      mother_name: mother.name, mother_address: mother.address, mother_occupation: mother.occupation, mother_age: mother.age, mother_na: naMother,
      spouse_name: spouse.name, spouse_address: spouse.address, spouse_occupation: spouse.occupation, spouse_age: spouse.age, spouse_na: naSpouse,
      siblings: naSiblings ? [] : siblings,
      siblings_na: naSiblings,
      children: children,
      has_relative_in_company: hasRelativesInCompany || null,
      relatives: hasRelativesInCompany === 'yes' ? relatives : [],
      elementary: naEduLevels.includes('Elementary') ? null : eduElementary,
      secondary: naEduLevels.includes('Secondary') ? null : eduSecondary,
      college: naEduLevels.includes('College') ? null : eduCollege,
      post_graduate: naEduLevels.includes('Post-Graduate') ? null : eduPostGrad,
      vocational: naEduLevels.includes('Vocational') ? null : eduVocational,
      why_took_course: showWhyTookCourse ? whyTookCourse : null,
      licenses: naLicenses ? [] : licenses,
      licenses_na: naLicenses,
      gov_exams: naGovExams ? [] : govExams,
      gov_exams_na: naGovExams,
      trainings: naTrainings ? [] : trainings,
      trainings_na: naTrainings,
      activities: naActivities ? [] : activities,
      activities_na: naActivities,
      special_skills: specialSkills,
      employment_record: naWorkExperience ? [] : jobs,
      character_references: naCharRefs ? [] : charRefs,
      character_references_na: naCharRefs,
      emergency_name: emergencyName,
      emergency_relationship: emergencyRelationship,
      emergency_telephone: emergencyTelephone,
      emergency_address: emergencyAddress,
      declarations: {
        outstandingLoans, outstandingLoansDetail,
        convicted, convictedDetail,
        surgery, surgeryDetail,
        terminated, terminatedDetail,
        pendingApps, pendingAppsDetail,
        caseFiled, caseFiledDetail,
        doYouSmoke, howSoonStart,
      },
      personality_profiling: {
        resignTriggers, stayFactors, handleStress, copeWithCriticism, hobbiesInterests,
        strengths, improvements, coreValues, futurePlans, parentalSupport,
        familyMedicalCondition, familyIssues, selfDescription,
      },
      work_preferences: {
        willingMonToSat, willingShifting, willingAnywhere, ifNotWhy,
        areaOfAssignment, willingTraining, freeLodging,
      },
      certify_truth_correctness: certify,
      signature_name: eSignature,
    };

    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      if (photoFile) formData.append('photo', photoFile);
      if (signatureFile) formData.append('signature', signatureFile);
      if (sketchFile) formData.append('sketch', sketchFile);

      const res = await fetch('/api/pds', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit PDS');
      }

      setSubmitted(true);
      onSubmit();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-3 space-y-3">
        <div className="flex items-start gap-2.5 rounded-xl p-4 text-sm" style={{ backgroundColor: T.cyanBg }}>
          <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.cyan }} />
          <span style={{ color: T.navy }}>
            Personal Data Sheet submitted! HR will review your information and move you forward to the Assessment stage.
          </span>
        </div>
      </div>
    );
  }

  if (loadingSaved) {
    return (
      <div className="pt-3">
        <div className="flex items-center gap-2.5 rounded-xl p-4 text-sm" style={{ backgroundColor: T.bg, color: T.gray }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: T.faint }} />
          <span>Loading your Personal Data Sheet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 space-y-3">
      <div className="flex items-start gap-2.5 rounded-xl p-3.5 text-sm mb-1" style={{ backgroundColor: '#FFFBEB', color: '#92400E' }}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#D97706' }} />
        <span>Please fill out this Personal Data Sheet completely and accurately. This is required before you can proceed to the Assessment stage.</span>
      </div>

      {(presentAddressLoaded || provAddressLoaded) && (
        <div className="flex items-start gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: T.cyanBg }}>
          <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.cyan }} />
          <span style={{ color: T.navy }}>
            We restored your previously-saved address into the Street field below. Please reselect Region/Province/City/Barangay if they look off.
          </span>
        </div>
      )}

      <div className="rounded-xl p-4 flex items-center gap-4" style={{ backgroundColor: T.cyanBg }}>
        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 flex items-center justify-center shrink-0 bg-white" style={{ borderColor: T.cyanBorder }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Applicant 2x2 photo" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8" style={{ color: T.faint }} />
          )}
        </div>
        <div className="flex-1">
          <Label>2x2 ID Photo</Label>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePhotoFile(file); }} />
          {!photo ? (
            <button type="button" onClick={() => photoInputRef.current?.click()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white" style={{ color: T.cyan, borderColor: T.cyanBorder }}>
              Upload Photo
            </button>
          ) : photoConfirmed ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                <Check className="w-3 h-3" /> Photo confirmed
              </span>
              <button type="button" onClick={() => photoInputRef.current?.click()} className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Replace</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPhotoConfirmed(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: T.cyan }}>
                Use this photo
              </button>
              <button type="button" onClick={() => { setPhoto(null); setPhotoFile(null); setPhotoConfirmed(false); }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white hover:bg-black/5" style={{ color: T.gray }}>
                x
              </button>
            </div>
          )}
        </div>
      </div>

      <Section id="basic" icon={User} title="Basic & Contact Information" subtitle="Name, address, birth details, government IDs" openId={openId} setOpenId={setOpenId}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Date Applied</Label>
            <div className={inputCls} style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>
              {dateApplied || 'Auto-filled from your application'}
            </div>
          </div>
          <div>
            <Label>Position Applied For</Label>
            <div className={inputCls} style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>
              {positionApplied || 'Auto-filled from your application'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TextField label="Last Name" value={lastName} onChange={setLastName} />
          <TextField label="First Name" value={firstName} onChange={setFirstName} />
          <TextField label="Middle Name" value={middleName} onChange={setMiddleName} />
          <TextField label="Nickname" value={nickname} onChange={setNickname} />
        </div>

        <div>
          <Label>Present / Current Address</Label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select value={presentRegion} onChange={(e) => { setPresentRegion(e.target.value); setPresentProvince(''); }} className={inputCls + ' text-xs'} style={inputStyle}>
              <option value="">Region</option>
              {PH_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={presentProvince} onChange={(e) => setPresentProvince(e.target.value)} disabled={!presentRegion} className={inputCls + ' text-xs disabled:opacity-50'} style={inputStyle}>
              <option value="">Province</option>
              {(PH_PROVINCES_BY_REGION[presentRegion] ?? []).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input value={presentCity} onChange={(e) => setPresentCity(e.target.value)} placeholder="City / Municipality" className={inputCls + ' text-xs'} style={inputStyle} />
            <input value={presentBarangay} onChange={(e) => setPresentBarangay(e.target.value)} placeholder="Barangay" className={inputCls + ' text-xs'} style={inputStyle} />
          </div>
          <input value={presentStreet} onChange={(e) => setPresentStreet(e.target.value)} placeholder="House No. / Street / Subdivision" className={inputCls + ' text-xs w-full'} style={inputStyle} />
        </div>

        <div>
          <Label>Provincial Address</Label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select value={provRegion} onChange={(e) => { setProvRegion(e.target.value); setProvProvince(''); }} className={inputCls + ' text-xs'} style={inputStyle}>
              <option value="">Region</option>
              {PH_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={provProvince} onChange={(e) => setProvProvince(e.target.value)} disabled={!provRegion} className={inputCls + ' text-xs disabled:opacity-50'} style={inputStyle}>
              <option value="">Province</option>
              {(PH_PROVINCES_BY_REGION[provRegion] ?? []).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input value={provCity} onChange={(e) => setProvCity(e.target.value)} placeholder="City / Municipality" className={inputCls + ' text-xs'} style={inputStyle} />
            <input value={provBarangay} onChange={(e) => setProvBarangay(e.target.value)} placeholder="Barangay" className={inputCls + ' text-xs'} style={inputStyle} />
          </div>
          <input value={provStreet} onChange={(e) => setProvStreet(e.target.value)} placeholder="House No. / Street / Subdivision" className={inputCls + ' text-xs w-full'} style={inputStyle} />
        </div>
        <p className="text-[11px] -mt-2" style={{ color: T.faint }}>City/Municipality and Barangay are typed manually — the full nationwide list (1,600+ cities/municipalities, 42,000+ barangays) isn't practical to embed as a dropdown.</p>

        <TextField label="How often do you visit your province?" value={howOftenVisit} onChange={setHowOftenVisit} />
        <TextField label="How many minutes travel time to area of assignment?" value={travelTime} onChange={setTravelTime} />
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Residence No." value={contactResidence} onChange={setContactResidence} />
          <div>
            <TextField label="Cellphone No." value={contactCellphone} onChange={setContactCellphone} placeholder="09XXXXXXXXX" />
            {contactCellphone.trim() && !PH_MOBILE_RE.test(contactCellphone.trim()) && (
              <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>Enter a valid PH mobile number (e.g. 09171234567).</p>
            )}
          </div>
          <div>
            <TextField label="Email Address" type="email" value={contactEmail} onChange={setContactEmail} />
            {contactEmail.trim() && !EMAIL_RE.test(contactEmail.trim()) && (
              <p className="text-[11px] mt-1" style={{ color: '#DC2626' }}>Enter a valid email address.</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Select label="Religion" value={religion} onChange={setReligion} options={RELIGION_OPTIONS} />
            {religion === 'Others' && (
              <input value={religionOther} onChange={(e) => setReligionOther(e.target.value)} placeholder="Please specify" className={inputCls + ' text-xs mt-2'} style={inputStyle} />
            )}
          </div>
          <TextField label="Desired Salary / Package" value={desiredSalary} onChange={setDesiredSalary} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TextField label="Date of Birth" type="date" value={dob} onChange={setDob} />
          <TextField label="Place of Birth" value={pob} onChange={setPob} />
          <TextField label="Nationality" value={nationality} onChange={setNationality} />
          <TextField label="Sex" value={sex} onChange={setSex} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Age" value={age} onChange={setAge} />
          <TextField label="Height" value={height} onChange={setHeight} />
          <TextField label="Weight" value={weight} onChange={setWeight} />
        </div>
        <div>
          <Label>Civil Status</Label>
          <div className="flex flex-wrap gap-4">
            {['Single', 'Married', 'Widowed', 'Separated'].map((s) => (
              <button key={s} type="button" onClick={() => setCivilStatus(s)} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: civilStatus === s ? T.navy : T.gray }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2" style={{ backgroundColor: civilStatus === s ? T.cyan : 'transparent', borderColor: civilStatus === s ? T.cyan : T.faint }}>
                  {civilStatus === s && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="SSS Number" value={sss} onChange={setSss} />
          <TextField label="T.I.N." value={tin} onChange={setTin} />
          <TextField label="Pag-IBIG #" value={pagibig} onChange={setPagibig} />
          <TextField label="PhilHealth #" value={philhealth} onChange={setPhilhealth} />
        </div>
        <TextArea label="Do you have any current health issues / condition? If yes, please state what." value={healthIssues} onChange={setHealthIssues} rows={2} />
      </Section>

      <Section id="family" icon={Users} title="Family Background" subtitle="Parents, siblings, spouse, children" openId={openId} setOpenId={setOpenId}>
        <NAPersonSection label="Name of Father" na={naFather} setNa={setNaFather} state={father} setState={setFather} />
        <NAPersonSection label="Name of Mother" na={naMother} setNa={setNaMother} state={mother} setState={setMother} />
        {civilStatus === 'Married' && (
          <>
            <NAPersonSection label="Name of Spouse" na={naSpouse} setNa={setNaSpouse} state={spouse} setState={setSpouse} />
            <div>
              <Select label="Number of Children" value={childrenCount} onChange={handleChildrenCountChange} options={CHILDREN_COUNT_OPTIONS} />
            </div>
            {children.length > 0 && (
              <div>
                <Label>Names of Children & Ages</Label>
                <div className="space-y-2">
                  {children.map((c, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <input value={c.name} onChange={(e) => setChildren(children.map((r, ri) => ri === idx ? { ...r, name: e.target.value } : r))} placeholder={`Child ${idx + 1} Name`} className={inputCls + ' text-xs'} style={inputStyle} />
                      <input value={c.age} onChange={(e) => setChildren(children.map((r, ri) => ri === idx ? { ...r, age: e.target.value } : r))} placeholder="Age" className={inputCls + ' text-xs'} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {civilStatus !== 'Married' && (
          <NARepeatingSection label="Name of Brother(s) / Sister(s)" na={naSiblings} setNa={setNaSiblings}
            rows={siblings} setRows={setSiblings} empty={emptyPerson}
            fields={[{ key: 'name', label: 'Name' }, { key: 'address', label: 'Address' }, { key: 'occupation', label: 'Occupation & Company' }, { key: 'age', label: 'Age' }]} />
        )}
        <YesNo label="Do you have relative(s), whether by consanguinity or affinity, or friend(s) who is/are presently employed with our company?"
          value={hasRelativesInCompany} onChange={setHasRelativesInCompany} />
        {hasRelativesInCompany === 'yes' && (
          <RepeatingRows rows={relatives} setRows={setRelatives} empty={emptyRelative}
            fields={[{ key: 'name', label: 'Complete Name' }, { key: 'positionDept', label: 'Position/Department' }, { key: 'relationship', label: 'Relationship' }]} />
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Select label="How did you learn about our company?" value={howLearned} onChange={setHowLearned} options={HOW_LEARNED_OPTIONS} />
            {howLearned === 'Others' && (
              <input value={howLearnedOther} onChange={(e) => setHowLearnedOther(e.target.value)} placeholder="Please specify" className={inputCls + ' text-xs mt-2'} style={inputStyle} />
            )}
          </div>
          <TextField label="Who referred you to us?" value={referredBy} onChange={setReferredBy} />
        </div>
      </Section>

      <Section id="education" icon={GraduationCap} title="Educational Background" subtitle="School history, licenses, government exams" openId={openId} setOpenId={setOpenId}>
        {[
          { label: 'Elementary', state: eduElementary, set: setEduElementary },
          { label: 'Secondary', state: eduSecondary, set: setEduSecondary },
          { label: 'College', state: eduCollege, set: setEduCollege },
          { label: 'Post-Graduate', state: eduPostGrad, set: setEduPostGrad },
          { label: 'Vocational', state: eduVocational, set: setEduVocational },
        ].map(({ label, state, set }) => {
          const isNA = naEduLevels.includes(label);
          return (
            <div key={label} className="contents">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>{label}</Label>
                  <Checkbox label="N/A" checked={isNA} onChange={(checked) => {
                    setNaEduLevels((prev) => checked ? [...prev, label] : prev.filter((l) => l !== label));
                    if (checked) set({ school: '', years: '', degree: '', honors: '' });
                  }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input value={state.school} disabled={isNA} onChange={(e) => set({ ...state, school: e.target.value })} placeholder="School and Address" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                  <input value={state.years} disabled={isNA} onChange={(e) => set({ ...state, years: e.target.value })} placeholder="Years Attended (from–to)" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                  <input value={state.degree} disabled={isNA} onChange={(e) => set({ ...state, degree: e.target.value })} placeholder="Degree/Major" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                  <input value={state.honors} disabled={isNA} onChange={(e) => set({ ...state, honors: e.target.value })} placeholder="Academic Honors" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                </div>
              </div>
              {label === 'College' && showWhyTookCourse && (
                <TextArea label="Why did you take up this course?" value={whyTookCourse} onChange={setWhyTookCourse} rows={2} />
              )}
            </div>
          );
        })}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>License(s), if any</Label>
            <Checkbox label="N/A" checked={naLicenses} onChange={(checked) => { setNaLicenses(checked); if (checked) setLicenses([emptyLicense]); }} />
          </div>
          {!naLicenses && (
            <div className="space-y-2">
              {licenses.map((lic, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2">
                  <input value={lic.license} onChange={(e) => setLicenses(licenses.map((l, li) => li === idx ? { ...l, license: e.target.value } : l))} placeholder="License Name" className={inputCls + ' text-xs'} style={inputStyle} />
                  <input type="date" value={lic.dateAcquired} onChange={(e) => setLicenses(licenses.map((l, li) => li === idx ? { ...l, dateAcquired: e.target.value } : l))} className={inputCls + ' text-xs'} style={inputStyle} />
                </div>
              ))}
              <div className="flex gap-2">
                <button type="button" onClick={() => setLicenses([...licenses, { ...emptyLicense }])}
                  className="text-xs font-semibold hover:underline" style={{ color: T.cyan }}>+ Add another license</button>
                {licenses.length > 1 && (
                  <button type="button" onClick={() => setLicenses(licenses.slice(0, -1))}
                    className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Remove last</button>
                )}
              </div>
            </div>
          )}
        </div>

        <NARepeatingSection label="Government Examination(s) Taken" na={naGovExams} setNa={setNaGovExams}
          rows={govExams} setRows={setGovExams} empty={emptyExam}
          fields={[{ key: 'exam', label: 'Examination' }, { key: 'date', label: 'Date' }, { key: 'rating', label: 'Rating' }]} />

      </Section>

      <Section id="work" icon={Briefcase} title="Work Experience" subtitle="Add each previous company" openId={openId} setOpenId={setOpenId}>
        <Checkbox label="N/A — I have no prior work experience" checked={naWorkExperience} onChange={setNaWorkExperience} />
        {!naWorkExperience && (
          <>
            {jobs.map((job, idx) => (
              <div key={idx} className="rounded-lg p-3.5 space-y-2.5" style={{ backgroundColor: T.bg }}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold" style={{ color: T.cyan }}>Company #{idx + 1}</div>
                  {jobs.length > 1 && (
                    <button type="button" onClick={() => setJobs(jobs.filter((_, ji) => ji !== idx))}
                      className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={job.company} onChange={(e) => updateJob(idx, { company: e.target.value })} placeholder="Name of Company" className={inputCls + ' text-xs'} style={inputStyle} />
                  <input value={job.position} onChange={(e) => updateJob(idx, { position: e.target.value })} placeholder="Position" className={inputCls + ' text-xs'} style={inputStyle} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input value={job.lastSalary} onChange={(e) => updateJob(idx, { lastSalary: e.target.value })} placeholder="Last Salary" className={inputCls + ' text-xs'} style={inputStyle} />
                  <input value={job.allowances} onChange={(e) => updateJob(idx, { allowances: e.target.value })} placeholder="Allowances (please specify)" className={inputCls + ' text-xs'} style={inputStyle} />
                  <input value={job.bonus} onChange={(e) => updateJob(idx, { bonus: e.target.value })} placeholder="Bonus (please specify)" className={inputCls + ' text-xs'} style={inputStyle} />
                </div>
                <input value={job.otherBenefits} onChange={(e) => updateJob(idx, { otherBenefits: e.target.value })} placeholder="Other Benefits (please specify)" className={inputCls + ' text-xs w-full'} style={inputStyle} />
                <textarea value={job.majorFunctions} onChange={(e) => updateJob(idx, { majorFunctions: e.target.value })} placeholder="Major Job Functions" rows={2} className={inputCls + ' text-xs resize-none'} style={inputStyle} />
                <textarea value={job.accomplishments} onChange={(e) => updateJob(idx, { accomplishments: e.target.value })} placeholder="Accomplishments and Achievements" rows={2} className={inputCls + ' text-xs resize-none'} style={inputStyle} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={job.reasonForLeaving} onChange={(e) => updateJob(idx, { reasonForLeaving: e.target.value })} placeholder="Reason for Leaving" className={inputCls + ' text-xs'} style={inputStyle} />
                  <input value={job.immediateSuperior} onChange={(e) => updateJob(idx, { immediateSuperior: e.target.value })} placeholder="Immediate Superior" className={inputCls + ' text-xs'} style={inputStyle} />
                </div>
                <div>
                  <Label>Employment Duration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={job.employmentDurationFrom} onChange={(e) => updateJob(idx, { employmentDurationFrom: e.target.value })} className={inputCls + ' text-xs'} style={inputStyle} />
                    <input type="date" value={job.employmentDurationTo} onChange={(e) => updateJob(idx, { employmentDurationTo: e.target.value })} className={inputCls + ' text-xs'} style={inputStyle} />
                  </div>
                </div>
                <input value={job.contactNo} onChange={(e) => updateJob(idx, { contactNo: e.target.value })} placeholder="Contact No." className={inputCls + ' text-xs w-full'} style={inputStyle} />
              </div>
            ))}
            <button type="button" onClick={() => setJobs([...jobs, { ...emptyJob }])}
              className="text-xs font-semibold hover:underline" style={{ color: T.cyan }}>+ Add another company</button>
          </>
        )}
      </Section>

      <Section id="refs" icon={Phone} title="References & Emergency Contact" subtitle="Character references and who to notify" openId={openId} setOpenId={setOpenId}>
        <NARepeatingSection label="Character References" na={naCharRefs} setNa={setNaCharRefs}
          rows={charRefs} setRows={setCharRefs} empty={emptyRef}
          fields={[{ key: 'name', label: 'Name' }, { key: 'occupation', label: 'Occupation' }, { key: 'telephone', label: 'Telephone Number' }, { key: 'address', label: 'Exact Address' }]} />
        <div>
          <Label>Person(s) to be notified in case of emergency (please do not include relatives and present employer)</Label>
          <div className="grid grid-cols-2 gap-2">
            <input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Name" className={inputCls + ' text-xs'} style={inputStyle} />
            <input value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} placeholder="Relationship" className={inputCls + ' text-xs'} style={inputStyle} />
            <input value={emergencyTelephone} onChange={(e) => setEmergencyTelephone(e.target.value)} placeholder="Telephone Number" className={inputCls + ' text-xs'} style={inputStyle} />
            <input value={emergencyAddress} onChange={(e) => setEmergencyAddress(e.target.value)} placeholder="Exact Address" className={inputCls + ' text-xs'} style={inputStyle} />
          </div>
        </div>
      </Section>

      <Section id="declarations" icon={Shield} title="Other Information & Declarations" subtitle="Trainings, activities, skills, loans, legal history, health, smoking" openId={openId} setOpenId={setOpenId}>
        <NARepeatingSection label="Trainings and Seminars Attended" na={naTrainings} setNa={setNaTrainings}
          rows={trainings} setRows={setTrainings} empty={emptySimpleRow}
          fields={[{ key: 'title', label: 'Title/Topic' }, { key: 'place', label: 'Company' }, { key: 'dates', label: 'Inclusive Dates' }]} />

        <NARepeatingSection label="Activities (School, Community, and Professional Organizations)" na={naActivities} setNa={setNaActivities}
          rows={activities} setRows={setActivities} empty={emptySimpleRow}
          fields={[{ key: 'title', label: 'Organization/Club' }, { key: 'place', label: 'Position(s) Held' }, { key: 'dates', label: 'Inclusive Dates' }]} />

        <TextArea label="Special Skills, Qualifications, Talents and Hobbies" value={specialSkills} onChange={setSpecialSkills} rows={2} />

        <YesNo label="Do you have any outstanding loans?" value={outstandingLoans} onChange={setOutstandingLoans} detailValue={outstandingLoansDetail} onDetailChange={setOutstandingLoansDetail} />
        <YesNo label="Have you ever been convicted of any offense or crime?" value={convicted} onChange={setConvicted} detailValue={convictedDetail} onDetailChange={setConvictedDetail} />
        <YesNo label="Have you undergone any surgery?" value={surgery} onChange={setSurgery} detailValue={surgeryDetail} onDetailChange={setSurgeryDetail} />
        <YesNo label="Have you ever been asked to resign or terminated/dismissed by a previous employer?" value={terminated} onChange={setTerminated} detailValue={terminatedDetail} onDetailChange={setTerminatedDetail} />
        <YesNo label="Do you have any pending applications with other companies?" value={pendingApps} onChange={setPendingApps} detailValue={pendingAppsDetail} onDetailChange={setPendingAppsDetail} />
        <YesNo label="Has there been case/s filed against you?" value={caseFiled} onChange={setCaseFiled} detailValue={caseFiledDetail} onDetailChange={setCaseFiledDetail} />
        <YesNo label="Do you smoke?" value={doYouSmoke} onChange={setDoYouSmoke} />
        <TextField label="How soon can you start?" value={howSoonStart} onChange={setHowSoonStart} />
      </Section>

      <Section id="personality" icon={HeartPulse} title="Personality Profiling" subtitle="According to AIMI's culture" openId={openId} setOpenId={setOpenId}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextArea label="What would probably make you resign?" value={resignTriggers} onChange={setResignTriggers} rows={4} />
          <TextArea label="What will make you stay in a company?" value={stayFactors} onChange={setStayFactors} rows={4} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextArea label="How do you handle stress?" value={handleStress} onChange={setHandleStress} rows={4} />
          <TextArea label="How do you cope with criticisms?" value={copeWithCriticism} onChange={setCopeWithCriticism} rows={4} />
        </div>
        <TextArea label="What are your hobbies and interests aside from work?" value={hobbiesInterests} onChange={setHobbiesInterests} rows={3} />
        <div>
          <Label>Your Strengths (give 3)</Label>
          <div className="grid grid-cols-3 gap-2">
            {strengths.map((v, i) => (
              <input key={i} value={v} onChange={(e) => setStrengths(strengths.map((s, si) => (si === i ? e.target.value : s)))}
                placeholder={`Strength ${i + 1}`} className={inputCls + ' text-xs'} style={inputStyle} />
            ))}
          </div>
        </div>
        <div>
          <Label>Areas for Improvement (give 3)</Label>
          <div className="grid grid-cols-3 gap-2">
            {improvements.map((v, i) => (
              <input key={i} value={v} onChange={(e) => setImprovements(improvements.map((s, si) => (si === i ? e.target.value : s)))}
                placeholder={`Area ${i + 1}`} className={inputCls + ' text-xs'} style={inputStyle} />
            ))}
          </div>
        </div>
        <div>
          <Label>Top 5 Core Values You Live By</Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {coreValues.map((v, i) => (
              <input key={i} value={v} onChange={(e) => setCoreValues(coreValues.map((s, si) => (si === i ? e.target.value : s)))}
                placeholder={`Value ${i + 1}`} className={inputCls + ' text-xs'} style={inputStyle} />
            ))}
          </div>
        </div>
        <TextArea label="How do you see yourself 3 to 5 years from now? What are your future plans (business/abroad/higher education)?" value={futurePlans} onChange={setFuturePlans} rows={4} />
        <TextArea label="Are your parents and/or partner supportive and in favor of you working, and of your career choice?" value={parentalSupport} onChange={setParentalSupport} rows={3} />
        <TextArea label="Do you have a family member who suffers from a serious medical condition? If yes, what illness?" value={familyMedicalCondition} onChange={setFamilyMedicalCondition} rows={3} />
        <TextArea label="Do you have existing family issues or disputes that would probably cause you to leave a company?" value={familyIssues} onChange={setFamilyIssues} rows={4} />
        <TextArea label="How would you describe yourself as a professional? As a person?" value={selfDescription} onChange={setSelfDescription} rows={4} />
      </Section>

      <Section id="preferences" icon={ClipboardList} title="Work Preferences" subtitle="Schedule, assignment, training, lodging" openId={openId} setOpenId={setOpenId}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextField label="Willing for Mondays to Saturdays?" value={willingMonToSat} onChange={setWillingMonToSat} />
          <TextField label="Willing for Shifting Schedule (for Warehouse)?" value={willingShifting} onChange={setWillingShifting} />
          <TextField label="Willing to be assigned anywhere?" value={willingAnywhere} onChange={setWillingAnywhere} />
        </div>
        <TextField label="If not willing to be assigned anywhere, why?" value={ifNotWhy} onChange={setIfNotWhy} />
        <div>
          <Label>Area of Assignment</Label>
          <div className="flex flex-wrap gap-4">
            {['Pasay', 'Harbour', 'Batangas', 'Province'].map((area) => (
              <Checkbox key={area} label={area} checked={areaOfAssignment.includes(area)} onChange={() => toggleArea(area)} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Willing to undergo Training Period?" value={willingTraining} onChange={setWillingTraining} />
        </div>
        <YesNo label="To avail free lodging?" value={freeLodging} onChange={setFreeLodging} />
      </Section>

      <Section id="certify" icon={PenLine} title="Certification & E-Signature" subtitle="Required before you can submit" openId={openId} setOpenId={setOpenId}>
        <div className="rounded-xl p-4 text-xs leading-relaxed space-y-3" style={{ backgroundColor: T.bg, color: T.gray }}>
          <p>
            I hereby confirm that the mere filing of this form does not obligate the company to hire my services. I understand that if I am hired,
            this application and all I have stated herein shall form part of my 201 file.
          </p>
          <p>
            I hereby certify to the truth and correctness of the above information and data. I relieve AIMI from any liabilities resulting from
            verifying the above information, and I understand that any false or fraudulent information made in this application form shall
            constitute sufficient ground for disapproval of my application, or if employed, for termination for cause.
          </p>
        </div>
        <Checkbox label="I certify that the above information is true and correct to the best of my knowledge." checked={certify} onChange={setCertify} />
        <TextField label="Applicant's Signature (type your full name as e-signature)" value={eSignature} onChange={setESignature} placeholder="Juan Dela Cruz" />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label>Upload your Signature (image of your handwritten signature)</Label>
            <input ref={signatureInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleSignatureFile(file); }} />
            {!signatureImage ? (
              <button type="button" onClick={() => signatureInputRef.current?.click()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ color: T.cyan, borderColor: T.cyanBorder }}>
                Upload Signature
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-16 px-3 rounded-lg border flex items-center bg-white" style={{ borderColor: T.cyanBorder }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureImage} alt="Uploaded signature" className="h-12 object-contain" />
                </div>
                <button type="button" onClick={() => signatureInputRef.current?.click()} className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Replace</button>
                <button type="button" onClick={() => { setSignatureImage(null); setSignatureFile(null); }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-black/5" style={{ color: T.gray }}>
                  x
                </button>
              </div>
            )}
          </div>

          <div className="flex-1">
            <Label>Sketch of Your Residence (optional)</Label>
            <input ref={sketchInputRef} type="file" accept="image/*,.pdf" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleSketchFile(file); }} />
            {!sketchImage ? (
              <button type="button" onClick={() => sketchInputRef.current?.click()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ color: T.cyan, borderColor: T.cyanBorder }}>
                Upload Sketch
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-16 px-3 rounded-lg border flex items-center bg-white" style={{ borderColor: T.cyanBorder }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sketchImage} alt="Residence sketch" className="h-12 object-contain" />
                </div>
                <button type="button" onClick={() => sketchInputRef.current?.click()} className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Replace</button>
                <button type="button" onClick={() => { setSketchImage(null); setSketchFile(null); setSketchFileName(''); }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-black/5" style={{ color: T.gray }}>
                  x
                </button>
              </div>
            )}
          </div>
        </div>
      </Section>

      {!canSubmit && missingSections.length > 0 && (
        <div className="rounded-xl p-3.5 text-xs" style={{ backgroundColor: '#FFF1F2', color: '#9F1239' }}>
          <p className="font-semibold mb-1">Please complete all fields before submitting (write "N/A" if a question doesn't apply to you):</p>
          <ul className="list-disc list-inside space-y-0.5">
            {missingSections.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
      )}

      {submitError && (
        <div className="rounded-xl p-3.5 text-xs" style={{ backgroundColor: '#FFF1F2', color: '#9F1239' }}>
          {submitError}
        </div>
      )}

      <button type="button" onClick={handleSubmit} disabled={!canSubmit || submitting}
        className="w-full py-3 font-semibold rounded-lg transition-all duration-200 text-sm shadow-sm"
        style={canSubmit
          ? { backgroundColor: T.navy, color: '#fff', cursor: submitting ? 'wait' : 'pointer' }
          : { backgroundColor: T.locked, color: T.gray, cursor: 'not-allowed' }}>
        {submitting ? 'Submitting...' : canSubmit ? 'Submit Personal Data Sheet' : `Complete all fields to submit (${missing.length} remaining)`}
      </button>

      {isCurrent && (
        <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: T.bg, color: T.gray }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: T.faint }} />
          <span>Once submitted, HR will review your Personal Data Sheet before advancing you to the Assessment stage.</span>
        </div>
      )}
    </div>
  );
}