# ============================================
# FIX v2: Wire actual submitted form data into Your Application view
# (Cover Letter field, remove unused fields, fix data reflection, fix encoding)
# ============================================

$demoPath = "src\lib\demo-session.ts"
$applyPath = "src\app\apply\page.tsx"
$appPath = "src\app\application\page.tsx"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# ---- 1. lib/demo-session.ts (adds application storage) ----
$demoContent = @'
export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: 'APPLICANT' | 'HR_ADMIN';
};

export type DemoApplication = {
  fullName: string;
  email: string;
  phone: string;
  positionTitle: string;
  employmentType: string;
  resumeFileName: string;
  coverLetterFileName?: string | null;
  submittedAt: string; // ISO date string
};

const DEMO_USER_KEY = 'mockUser';
const DEMO_APPLICATION_KEY = 'mockApplicationData';

export function readDemoUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DEMO_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function writeDemoUser(user: DemoUser) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
}

export function clearDemoUser() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(DEMO_USER_KEY);
}

export function readDemoApplication(): DemoApplication | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DEMO_APPLICATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoApplication;
  } catch {
    return null;
  }
}

export function writeDemoApplication(app: DemoApplication) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DEMO_APPLICATION_KEY, JSON.stringify(app));
}

export function clearDemoApplication() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(DEMO_APPLICATION_KEY);
}

'@
[System.IO.File]::WriteAllText((Join-Path $PWD $demoPath), $demoContent, $utf8NoBom)
Write-Host "Updated: $demoPath" -ForegroundColor Green

# ---- 2. apply/page.tsx (saves real submitted data + Cover Letter field) ----
$applyContent = @'
'use client';

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { writeDemoUser, writeDemoApplication } from "@/lib/demo-session";
import {
  Upload, FileText, X, ChevronDown, CheckCircle2, Shield, Phone,
  Briefcase, Building2, ArrowRight,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

// ─── Theme (matches landing page) ─────────────────────────────
const NAVY = "#0B2A4A";
const CYAN = "#12B6D6";
const MUTED = "#6B7A8D";
const BORDER = "#E5E9EC";
const BG_LIGHT = "#F7F9FA";
const ACCENT_BG = "#EEF9FB";
const ACCENT_BORDER = "#B8EAF3";

const POSITIONS = [
  "Software Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Data Analyst",
  "Marketing Specialist",
  "Operations Manager",
  "Sales Executive",
  "Business Development Associate",
];

// Map each position to its department (shown on the success screen)
const DEPARTMENT_MAP: Record<string, string> = {
  "Software Engineer": "Information Technology",
  "Product Manager": "Product",
  "UI/UX Designer": "Design",
  "Data Analyst": "Data & Analytics",
  "Marketing Specialist": "Marketing",
  "Operations Manager": "Operations",
  "Sales Executive": "Sales",
  "Business Development Associate": "Business Development",
};

// Employment type per position (defaults to Full-time for corporate roles)
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "Software Engineer": "Full-time",
  "Product Manager": "Full-time",
  "UI/UX Designer": "Full-time",
  "Data Analyst": "Full-time",
  "Marketing Specialist": "Full-time",
  "Operations Manager": "Full-time",
  "Sales Executive": "Full-time",
  "Business Development Associate": "Full-time",
};

// Format PH phone: auto-inserts spaces as user types
function formatPHPhone(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "63" + digits.slice(1);
  if (!digits.startsWith("63")) digits = "63" + digits;
  digits = digits.slice(0, 12);
  const local = digits.slice(2);
  let formatted = "+63";
  if (local.length > 0) formatted += " " + local.slice(0, 3);
  if (local.length > 3) formatted += " " + local.slice(3, 6);
  if (local.length > 6) formatted += " " + local.slice(6, 10);
  return formatted;
}

function isValidPHPhone(val: string) {
  const digits = val.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("63") && /^639[0-9]{9}$/.test(digits);
}

export default function ApplyPage() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "+63 ", position: "" });
  const [file, setFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [coverLetterDragging, setCoverLetterDragging] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!isValidPHPhone(form.phone)) e.phone = "Enter a valid PH mobile number (e.g. +63 917 123 4567).";
    if (!form.position) e.position = "Please select a position.";
    if (!file) e.file = "Please attach your resume or CV.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    writeDemoUser({ id: "2", name: form.fullName, email: form.email, role: "APPLICANT" });
    writeDemoApplication({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      positionTitle: form.position,
      employmentType: EMPLOYMENT_TYPE_MAP[form.position] || "Full-time",
      resumeFileName: file?.name || "",
      coverLetterFileName: coverLetterFile?.name || null,
      submittedAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePhoneChange = (raw: string) => {
    const formatted = formatPHPhone(raw);
    handleChange("phone", formatted);
  };

  const handleFile = (f: File) => {
    if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx"))) {
      setFile(f);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const handleCoverLetterFile = (f: File) => {
    if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".docx"))) {
      setCoverLetterFile(f);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onCoverLetterDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setCoverLetterDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleCoverLetterFile(f);
  }, []);

  const department = DEPARTMENT_MAP[form.position] || "General";

  if (submitted) {
    return (
      <div className={`flex flex-col ${inter.className}`} style={pageStyle}>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12" style={bgStyle}>
          <div
            className="bg-white rounded-2xl p-10 w-full max-w-md text-center"
            style={{ border: `1px solid ${BORDER}`, boxShadow: "0 12px 32px rgba(11,42,74,0.09)" }}
          >
            <div className="flex justify-center mb-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.12)" }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: "#22c55e" }} />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>Application Submitted!</h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: MUTED }}>
              Thank you, <span className="font-semibold" style={{ color: NAVY }}>{form.fullName}</span>! Your
              application has been received. We will review it and get back to you within 3&ndash;5 business days.
            </p>

            <div
              className="text-left rounded-xl p-4 mb-6 flex flex-col gap-3"
              style={{ backgroundColor: ACCENT_BG, border: `1px solid ${ACCENT_BORDER}` }}
            >
              <div className="flex items-center gap-3">
                <Briefcase size={16} style={{ color: CYAN }} strokeWidth={1.5} />
                <p className="text-sm" style={{ color: NAVY }}>
                  <span className="font-semibold">Position:</span> {form.position}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Building2 size={16} style={{ color: CYAN }} strokeWidth={1.5} />
                <p className="text-sm" style={{ color: NAVY }}>
                  <span className="font-semibold">Department:</span> {department}
                </p>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2"
              style={{ backgroundColor: NAVY }}
            >
              Go to My Dashboard <ArrowRight size={15} />
            </Link>
          </div>
        </main>
        <Footer onPrivacy={() => setPrivacyOpen(true)} />
        {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${inter.className}`} style={pageStyle}>
      <Header />

      <main className="flex-1 flex items-start justify-center px-4 py-8 md:py-12" style={bgStyle}>
        <div className="w-full max-w-lg">
          <div
            className="bg-white rounded-2xl overflow-visible"
            style={{ border: `1px solid ${BORDER}`, boxShadow: "0 12px 32px rgba(11,42,74,0.06)" }}
          >
            <div className="px-6 pt-6 pb-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h1 className="text-xl font-bold" style={{ color: NAVY }}>Application Form</h1>
              <p className="text-sm mt-1" style={{ color: MUTED }}>Fill out all fields to submit your application.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-5">
              <Field label="Full Name" error={errors.fullName}>
                <input
                  type="text"
                  placeholder="Juan dela Cruz"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={inputCls()}
                  style={inputStyle(!!errors.fullName)}
                  onFocus={(e) => (e.target.style.borderColor = CYAN)}
                  onBlur={(e) => (e.target.style.borderColor = errors.fullName ? "#f87171" : BORDER)}
                />
              </Field>

              <Field label="Email Address" error={errors.email}>
                <input
                  type="email"
                  placeholder="juan@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputCls()}
                  style={inputStyle(!!errors.email)}
                  onFocus={(e) => (e.target.style.borderColor = CYAN)}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? "#f87171" : BORDER)}
                />
              </Field>

              <Field label="Phone Number" error={errors.phone}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: MUTED }} />
                  <input
                    type="tel"
                    placeholder="+63 9XX XXX XXXX"
                    value={form.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={inputCls() + " pl-9"}
                    style={inputStyle(!!errors.phone)}
                    onFocus={(e) => (e.target.style.borderColor = CYAN)}
                    onBlur={(e) => (e.target.style.borderColor = errors.phone ? "#f87171" : BORDER)}
                    maxLength={16}
                  />
                </div>
              </Field>

              <Field label="Position Applying For" error={errors.position}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPositionOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-150 outline-none"
                    style={{
                      border: `1px solid ${errors.position ? "#f87171" : BORDER}`,
                      backgroundColor: BG_LIGHT,
                      color: form.position ? NAVY : MUTED,
                    }}
                  >
                    <span>{form.position || "Select a position"}</span>
                    <ChevronDown
                      className="w-4 h-4 shrink-0 transition-transform duration-200"
                      style={{ color: MUTED, transform: positionOpen ? "rotate(180deg)" : "none" }}
                    />
                  </button>

                  {positionOpen && (
                    <div
                      className="absolute top-full mt-1.5 left-0 right-0 z-30 bg-white rounded-xl overflow-hidden py-1"
                      style={{ border: `1px solid ${BORDER}`, boxShadow: "0 12px 32px rgba(11,42,74,0.12)" }}
                    >
                      {POSITIONS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { handleChange("position", p); setPositionOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${form.position === p ? "font-semibold" : ""}`}
                          style={form.position === p ? { color: CYAN, background: ACCENT_BG } : { color: NAVY }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Cover Letter (Optional)">
                <input
                  ref={coverLetterInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverLetterFile(f); }}
                />
                {coverLetterFile ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_LIGHT }}>
                    <FileText className="w-5 h-5 shrink-0" style={{ color: CYAN }} />
                    <span className="text-sm font-medium truncate flex-1" style={{ color: NAVY }}>{coverLetterFile.name}</span>
                    <button type="button" onClick={() => setCoverLetterFile(null)} className="shrink-0 transition-colors hover:text-red-600" style={{ color: MUTED }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => coverLetterInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setCoverLetterDragging(true); }}
                    onDragLeave={() => setCoverLetterDragging(false)}
                    onDrop={onCoverLetterDrop}
                    className={`flex flex-col items-center justify-center px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 ${coverLetterDragging ? "scale-[1.01]" : ""}`}
                    style={{
                      borderColor: coverLetterDragging ? CYAN : BORDER,
                      backgroundColor: coverLetterDragging ? ACCENT_BG : BG_LIGHT,
                    }}
                  >
                    <Upload className="w-6 h-6 mb-2" style={{ color: coverLetterDragging ? CYAN : MUTED }} />
                    <p className="text-sm text-center" style={{ color: MUTED }}>
                      Drag &amp; drop your cover letter, or{" "}
                      <span className="font-semibold hover:underline" style={{ color: CYAN }}>browse files</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: MUTED }}>PDF or DOCX &middot; Optional</p>
                  </div>
                )}
              </Field>

              <Field label="Resume / CV" error={errors.file}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {file ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_LIGHT }}>
                    <FileText className="w-5 h-5 shrink-0" style={{ color: CYAN }} />
                    <span className="text-sm font-medium truncate flex-1" style={{ color: NAVY }}>{file.name}</span>
                    <button type="button" onClick={() => setFile(null)} className="shrink-0 transition-colors hover:text-red-600" style={{ color: MUTED }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex flex-col items-center justify-center px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 ${dragging ? "scale-[1.01]" : ""}`}
                    style={{
                      borderColor: dragging ? CYAN : errors.file ? "#f87171" : BORDER,
                      backgroundColor: dragging ? ACCENT_BG : errors.file ? "#fef2f2" : BG_LIGHT,
                    }}
                  >
                    <Upload className="w-6 h-6 mb-2" style={{ color: dragging ? CYAN : MUTED }} />
                    <p className="text-sm text-center" style={{ color: MUTED }}>
                      Drag &amp; drop your resume, or{" "}
                      <span className="font-semibold hover:underline" style={{ color: CYAN }}>browse files</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: MUTED }}>PDF or DOCX &middot; Max 10 MB</p>
                  </div>
                )}
              </Field>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white tracking-wide hover:opacity-90 active:scale-[0.99] transition-all duration-150 mt-1"
                style={{ backgroundColor: NAVY }}
              >
                Submit Application
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-5 pb-2" style={{ color: MUTED }}>
            By submitting, you agree to Arvin International&apos;s{" "}
            <button
              onClick={() => setPrivacyOpen(true)}
              className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: CYAN }}
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </main>

      <Footer onPrivacy={() => setPrivacyOpen(true)} />
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </div>
  );
}

// ─── Header ────────────────────────────────────
function Header() {
  return (
    <header
      className="w-full px-6 py-5 flex flex-col items-center gap-2 shrink-0"
      style={{ backgroundColor: NAVY }}
    >
      <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
        <img
          src="/logo.png"
          alt="Arvin International"
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            t.parentElement!.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="${NAVY}" stroke-width="2.5" fill="none"/><path d="M20 9 L25 23 H15 Z" fill="${NAVY}"/><path d="M13 28 Q20 23 27 28" stroke="${NAVY}" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
          }}
        />
      </div>
      <p className="text-sm font-semibold tracking-wide" style={{ color: CYAN }}>Applicant Portal</p>
    </header>
  );
}

// ─── Footer ────────────────────────────────────
function Footer({ onPrivacy }: { onPrivacy: () => void }) {
  return (
    <footer
      className="w-full py-4 flex flex-col sm:flex-row items-center justify-between gap-2 px-6 bg-white shrink-0"
      style={{ borderTop: `1px solid ${BORDER}` }}
    >
      <p className="text-xs" style={{ color: MUTED }}>
        &copy; {new Date().getFullYear()} Arvin International &middot; All rights reserved
      </p>
      <button
        onClick={onPrivacy}
        className="text-xs font-medium underline underline-offset-2 hover:opacity-70 transition-opacity flex items-center gap-1"
        style={{ color: CYAN }}
      >
        <Shield className="w-3 h-3" />
        Privacy Policy
      </button>
    </footer>
  );
}

// ─── Privacy Policy Modal ─────────────────────────────────
function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(11,42,74,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BORDER}`, boxShadow: "0 20px 50px rgba(11,42,74,0.25)" }}>
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ backgroundColor: NAVY }}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: CYAN }} />
            <h2 className="text-base font-bold text-white">Privacy Policy</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm leading-relaxed" style={{ color: NAVY }}>
          <p className="text-xs" style={{ color: MUTED }}>Effective Date: July 1, 2025 &middot; Last Updated: July 1, 2025</p>

          <section>
            <h3 className="font-bold text-base mb-1.5">1. Introduction</h3>
            <p>Arvin International (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard information you provide when applying for a position through our Applicant Portal.</p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">2. Information We Collect</h3>
            <p>When you submit an application, we collect:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: MUTED }}>
              <li><span className="font-medium" style={{ color: NAVY }}>Personal Identifiers</span> &mdash; full name, email address, and phone number</li>
              <li><span className="font-medium" style={{ color: NAVY }}>Professional Information</span> &mdash; resume/CV, work history, and applied position</li>
              <li><span className="font-medium" style={{ color: NAVY }}>Technical Data</span> &mdash; browser type, IP address, and access timestamps (logged automatically)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">3. How We Use Your Information</h3>
            <p>Your information is used solely for:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: MUTED }}>
              <li>Evaluating your application and qualifications</li>
              <li>Communicating with you about the status of your application</li>
              <li>Complying with legal and regulatory obligations</li>
              <li>Maintaining a talent pool for future openings (with your consent)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">4. Data Sharing</h3>
            <p>We do not sell or rent your personal data. We may share it with:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: MUTED }}>
              <li>Internal hiring teams at Arvin International</li>
              <li>Third-party service providers under strict confidentiality agreements</li>
              <li>Government or regulatory bodies as required by Philippine law</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">5. Data Retention</h3>
            <p>Application data is retained for a maximum of <span className="font-semibold" style={{ color: NAVY }}>two (2) years</span> from the date of submission or until you request deletion, whichever comes first. Hired applicants&apos; data transitions to our employee records system.</p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">6. Your Rights</h3>
            <p>Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the right to:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: MUTED }}>
              <li>Access and obtain a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request erasure or deletion of your data</li>
              <li>Object to processing or file a complaint with the NPC</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">7. Security</h3>
            <p>We implement industry-standard security measures including encrypted data transmission (TLS), access controls, and regular security audits to protect your information from unauthorized access.</p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">8. Contact Us</h3>
            <p>For privacy concerns or to exercise your rights, contact our Data Protection Officer:</p>
            <div className="mt-2 p-3 rounded-xl text-xs space-y-0.5" style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_LIGHT }}>
              <p className="font-semibold" style={{ color: NAVY }}>Arvin International &mdash; Data Protection Office</p>
              <p>Email: <span className="font-medium" style={{ color: CYAN }}>privacy@arvininternational.com</span></p>
              <p>Address: Metro Manila, Philippines</p>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-150 hover:opacity-90 active:scale-[0.99]"
            style={{ backgroundColor: NAVY }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold" style={{ color: NAVY }}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls() {
  return "w-full px-4 py-3 rounded-xl text-sm placeholder:text-gray-400 outline-none transition-all duration-150";
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    border: `1px solid ${hasError ? "#f87171" : BORDER}`,
    backgroundColor: BG_LIGHT,
    color: NAVY,
  };
}

// ─── Styles ─────────────────────────────────
const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  overflowY: "auto",
};

const bgStyle: React.CSSProperties = {
  backgroundColor: BG_LIGHT,
};

'@
[System.IO.File]::WriteAllText((Join-Path $PWD $applyPath), $applyContent, $utf8NoBom)
Write-Host "Updated: $applyPath" -ForegroundColor Green

# ---- 3. application/page.tsx (reflects real submitted data) ----
$appContent = @'
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserApplication, mockPositions } from '@/lib/mockData';
import { readDemoUser, readDemoApplication, type DemoUser } from '@/lib/demo-session';

type DisplayApplication = {
  fullName: string;
  email: string;
  phone: string;
  positionTitle: string;
  employmentType: string;
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
          employmentType: data.position?.employmentType || 'N/A',
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
            setApplication({
              fullName: submitted.fullName,
              email: submitted.email,
              phone: submitted.phone,
              positionTitle: submitted.positionTitle,
              employmentType: submitted.employmentType,
              submittedAtLabel: new Date(submitted.submittedAt).toLocaleDateString(),
              resumeFileName: submitted.resumeFileName,
              coverLetterFileName: submitted.coverLetterFileName,
              resumeHref: null,
              coverLetterHref: null,
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
              employmentType: mockPosition?.employmentType || 'N/A',
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
                  <p className="text-xs font-medium" style={{ color: '#9BAAB8' }}>Employment Type</p>
                  <p className="font-medium text-[#0B2A4A]">{application.employmentType || 'N/A'}</p>
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
                  {application.resumeHref && (
                    <a
                      href={application.resumeHref}
                      className="hover:underline text-sm font-medium"
                      style={{ color: '#12B6D6' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  )}
                </div>
                <div className="flex justify-between items-center p-3.5 rounded-xl transition-colors duration-200" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC' }}>
                  <span className="text-sm font-medium text-[#0B2A4A]">Cover Letter: {application.coverLetterFileName || 'N/A'}</span>
                  {application.coverLetterHref && (
                    <a
                      href={application.coverLetterHref}
                      className="hover:underline text-sm font-medium"
                      style={{ color: '#12B6D6' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
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

'@
[System.IO.File]::WriteAllText((Join-Path $PWD $appPath), $appContent, $utf8NoBom)
Write-Host "Updated: $appPath" -ForegroundColor Green

Write-Host ""
Write-Host "Done! Ngayon, ang Your Application page ay magpapakita ng aktwal mong isinubmit sa Application Form." -ForegroundColor Cyan
Write-Host "Paalala: dahil demo/mock storage pa rin ito (sessionStorage), mawawala ang datos kapag na-close mo ang tab o nag-logout." -ForegroundColor Yellow
