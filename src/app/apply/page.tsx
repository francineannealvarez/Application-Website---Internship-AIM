'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { writeDemoUser } from "@/lib/demo-session";
import {
  Upload, FileText, X, ChevronDown, CheckCircle2, Shield, Phone,
  Briefcase, Building2, ArrowRight, Info, Database, Settings, Share2,
  Clock, Scale, Lock, Mail,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const NAVY = "#0B2A4A";
const CYAN = "#12B6D6";
const MUTED = "#6B7A8D";
const BORDER = "#E5E9EC";
const BG_LIGHT = "#F7F9FA";
const ACCENT_BG = "#EEF9FB";
const ACCENT_BORDER = "#B8EAF3";

type Position = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
};

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
  const [form, setForm] = useState({ fullName: "", email: "", phone: "+63 ", positionId: "" });
  const [positions, setPositions] = useState<Position[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [coverLetterDragging, setCoverLetterDragging] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/positions")
      .then((r) => r.json())
      .then((data) => setPositions(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const selectedPosition = positions.find((p) => p.id === form.positionId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email address.";
    if (!isValidPHPhone(form.phone)) e.phone = "Enter a valid PH mobile number (e.g. +63 917 123 4567).";
    if (!form.positionId) e.position = "Please select a position.";
    if (!file) e.file = "Please attach your resume or CV.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName.trim());
      formData.append("email", form.email.trim());
      formData.append("positionId", form.positionId);
      formData.append("phoneNumber", form.phone);
      formData.append("resume", file as File);
      if (coverLetterFile) formData.append("coverLetter", coverLetterFile);

      const res = await fetch("/api/applications", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
       writeDemoUser({
          id: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: form.fullName.trim(),
          email: form.email.trim(),
          role: "APPLICANT",
        });
        setSubmitted(true);
      } else {
        setErrors({ submit: data.error || "Submission failed. Please try again." });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrors({ submit: `Error: ${message}` });
      console.error("Submit error detail:", err);
    } finally {
      setSubmitting(false);
    }
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

  const department = selectedPosition?.department || "General";

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
                  <span className="font-semibold">Position:</span> {selectedPosition?.title}
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
              href={`/dashboard?email=${encodeURIComponent(form.email)}`}
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
              {errors.submit && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
                  {errors.submit}
                </div>
              )}

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
                      color: selectedPosition ? NAVY : MUTED,
                    }}
                  >
                    <span>{selectedPosition?.title || "Select a position"}</span>
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
                      {positions.length === 0 && (
                        <div className="px-4 py-2.5 text-sm" style={{ color: MUTED }}>No open positions right now.</div>
                      )}
                      {positions.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { handleChange("positionId", p.id); setPositionOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${form.positionId === p.id ? "font-semibold" : ""}`}
                          style={form.positionId === p.id ? { color: CYAN, background: ACCENT_BG } : { color: NAVY }}
                        >
                          {p.title}
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
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white tracking-wide hover:opacity-90 active:scale-[0.99] transition-all duration-150 mt-1 disabled:opacity-60"
                style={{ backgroundColor: NAVY }}
              >
                {submitting ? "Submitting..." : "Submit Application"}
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

const PRIVACY_SECTIONS: { icon: React.ElementType; title: string; body: React.ReactNode }[] = [
  {
    icon: Info,
    title: "Introduction",
    body: (
      <p>Arvin International (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard information you provide when applying for a position through our Applicant Portal.</p>
    ),
  },
  {
    icon: Database,
    title: "Information We Collect",
    body: (
      <>
        <p>When you submit an application, we collect:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: MUTED }}>
          <li><span className="font-medium" style={{ color: NAVY }}>Personal Identifiers</span> &mdash; full name, email address, and phone number</li>
          <li><span className="font-medium" style={{ color: NAVY }}>Professional Information</span> &mdash; resume/CV, work history, and applied position</li>
          <li><span className="font-medium" style={{ color: NAVY }}>Technical Data</span> &mdash; browser type, IP address, and access timestamps (logged automatically)</li>
        </ul>
      </>
    ),
  },
  {
    icon: Settings,
    title: "How We Use Your Information",
    body: (
      <>
        <p>Your information is used solely for:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: MUTED }}>
          <li>Evaluating your application and qualifications</li>
          <li>Communicating with you about the status of your application</li>
          <li>Complying with legal and regulatory obligations</li>
          <li>Maintaining a talent pool for future openings (with your consent)</li>
        </ul>
      </>
    ),
  },
  {
    icon: Share2,
    title: "Data Sharing",
    body: (
      <>
        <p>We do not sell or rent your personal data. We may share it with:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: MUTED }}>
          <li>Internal hiring teams at Arvin International</li>
          <li>Third-party service providers under strict confidentiality agreements</li>
          <li>Government or regulatory bodies as required by Philippine law</li>
        </ul>
      </>
    ),
  },
  {
    icon: Clock,
    title: "Data Retention",
    body: (
      <p>Application data is retained for a maximum of <span className="font-semibold" style={{ color: NAVY }}>two (2) years</span> from the date of submission or until you request deletion, whichever comes first. Hired applicants&apos; data transitions to our employee records system.</p>
    ),
  },
  {
    icon: Scale,
    title: "Your Rights",
    body: (
      <>
        <p>Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the right to:</p>
        <ul className="mt-2 space-y-1 list-disc list-inside" style={{ color: MUTED }}>
          <li>Be informed about how your personal data is processed</li>
          <li>Access and obtain a copy of your personal data</li>
          <li>Correct inaccurate or incomplete data</li>
          <li>Request erasure or deletion of your data</li>
          <li>Object to processing or file a complaint with the National Privacy Commission (NPC)</li>
        </ul>
      </>
    ),
  },
  {
    icon: Lock,
    title: "Security",
    body: (
      <p>We implement industry-standard security measures including encrypted data transmission (TLS), access controls, and regular security audits to protect your information from unauthorized access.</p>
    ),
  },
  {
    icon: Mail,
    title: "Contact Us",
    body: (
      <>
        <p>For privacy concerns or to exercise your rights, contact our Data Protection Officer:</p>
        <div className="mt-2 p-3 rounded-xl text-xs space-y-0.5" style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_LIGHT }}>
          <p className="font-semibold" style={{ color: NAVY }}>Arvin International &mdash; Data Protection Office</p>
          <p>Email: <span className="font-medium" style={{ color: CYAN }}>privacy@arvininternational.com</span></p>
          <p>Address: Metro Manila, Philippines</p>
        </div>
      </>
    ),
  },
];

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

        <div className="overflow-y-auto px-6 py-5 text-sm leading-relaxed" style={{ color: NAVY }}>
          <p className="text-xs mb-5" style={{ color: MUTED }}>Effective Date: July 1, 2025 &middot; Last Updated: July 1, 2025</p>

          {PRIVACY_SECTIONS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className={i > 0 ? "pt-5 mt-5" : ""} style={i > 0 ? { borderTop: `1px solid ${BORDER}` } : {}}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${ACCENT_BG} 0%, #D6F4FA 100%)` }}>
                  <Icon className="w-4 h-4" style={{ color: CYAN }} />
                </div>
                <h3 className="font-bold text-base" style={{ color: NAVY }}>{title}</h3>
              </div>
              <div className="pl-[42px] space-y-2">{body}</div>
            </div>
          ))}
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

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  overflowY: "auto",
};

const bgStyle: React.CSSProperties = {
  backgroundColor: BG_LIGHT,
};