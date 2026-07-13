'use client';

import { useState, useRef, useCallback } from "react";
import { Inter } from "next/font/google";
import { Upload, FileText, X, ChevronDown, CheckCircle2, Shield, Phone } from "lucide-react";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

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

// Format PH phone: auto-inserts spaces as user types
function formatPHPhone(raw: string) {
  // strip everything except digits and leading +
  let digits = raw.replace(/\D/g, "");
  // If they start with 63, keep it; if 0, replace with 63
  if (digits.startsWith("0")) digits = "63" + digits.slice(1);
  if (!digits.startsWith("63")) digits = "63" + digits;
  // cap at 12 digits (63 + 10)
  digits = digits.slice(0, 12);
  // Format: +63 9XX XXX XXXX
  const local = digits.slice(2); // 10 digits
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
  const [dragging, setDragging] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  if (submitted) {
    return (
      <div className={`flex flex-col ${inter.className}`} style={pageStyle}>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-12" style={bgStyle}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 w-full max-w-md text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(26,82,194,0.1)" }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: "#1a52c2" }} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Thank you, <span className="font-semibold text-gray-900">{form.fullName}</span>. We received your
              application for <span className="font-semibold" style={{ color: "#1a52c2" }}>{form.position}</span> and will be in touch shortly.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ fullName: "", email: "", phone: "+63 ", position: "" }); setFile(null); }}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
              style={{ background: "linear-gradient(135deg, #1340a8 0%, #1e6adf 100%)" }}
            >
              Submit Another Application
            </button>
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-visible">
            <div className="px-6 pt-6 pb-5 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Application Form</h1>
              <p className="text-gray-500 text-sm mt-1">Fill out all fields to submit your application.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-5">
              <Field label="Full Name" error={errors.fullName}>
                <input
                  type="text"
                  placeholder="Juan dela Cruz"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={inputCls(!!errors.fullName)}
                />
              </Field>

              <Field label="Email Address" error={errors.email}>
                <input
                  type="email"
                  placeholder="juan@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputCls(!!errors.email)}
                />
              </Field>

              <Field label="Phone Number" error={errors.phone}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+63 9XX XXX XXXX"
                    value={form.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={inputCls(!!errors.phone) + " pl-9"}
                    maxLength={16}
                  />
                </div>
              </Field>

              <Field label="Position Applying For" error={errors.position}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPositionOpen((v) => !v)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-150 outline-none
                      ${errors.position ? "border-red-400" : "border-gray-200"}
                      ${form.position ? "text-gray-900" : "text-gray-500"}
                      bg-gray-50 hover:border-blue-400/50 focus:ring-2 focus:ring-blue-200`}
                  >
                    <span>{form.position || "Select a position"}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-gray-500 transition-transform duration-200 ${positionOpen ? "rotate-180" : ""}`} />
                  </button>

                  {positionOpen && (
                    <div className="absolute top-full mt-1.5 left-0 right-0 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1">
                      {POSITIONS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { handleChange("position", p); setPositionOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-100
                            ${form.position === p ? "font-semibold" : "text-gray-900"}`}
                          style={form.position === p ? { color: "#1a52c2", background: "rgba(26,82,194,0.06)" } : {}}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-100/60">
                    <FileText className="w-5 h-5 shrink-0" style={{ color: "#1a52c2" }} />
                    <span className="text-sm text-gray-900 font-medium truncate flex-1">{file.name}</span>
                    <button type="button" onClick={() => setFile(null)} className="shrink-0 text-gray-500 hover:text-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex flex-col items-center justify-center px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150
                      ${dragging ? "scale-[1.01]" : ""}
                      ${errors.file ? "border-red-400/50 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                    style={dragging ? { borderColor: "#1a52c2", background: "rgba(26,82,194,0.05)" } : {}}
                  >
                    <Upload className={`w-6 h-6 mb-2 ${dragging ? "" : "text-gray-500"}`} style={dragging ? { color: "#1a52c2" } : {}} />
                    <p className="text-sm text-center text-gray-500">
                      Drag & drop your resume, or{" "}
                      <span className="font-semibold hover:underline" style={{ color: "#1a52c2" }}>browse files</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF or DOCX · Max 10 MB</p>
                  </div>
                )}
              </Field>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white tracking-wide hover:opacity-90 active:scale-[0.99] transition-all duration-150 shadow-sm hover:shadow-md mt-1"
                style={{ background: "linear-gradient(135deg, #1340a8 0%, #1e6adf 100%)" }}
              >
                Submit Application
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500 mt-5 pb-2">
            By submitting, you agree to ARVIN International&apos;s{" "}
            <button
              onClick={() => setPrivacyOpen(true)}
              className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: "#1a52c2" }}
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

// ─── Header ──────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header
      className="w-full px-6 py-5 flex flex-col items-center gap-2 shrink-0"
      style={{ background: "linear-gradient(135deg, #1340a8 0%, #1a52c2 45%, #1e6adf 100%)" }}
    >
      <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
        <img
          src="/logo.png"
          alt="ARVIN International"
          className="w-full h-full object-contain p-1"
          onError={(e) => {
            const t = e.currentTarget;
            t.style.display = "none";
            t.parentElement!.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#1a52c2" stroke-width="2.5" fill="none"/><path d="M20 9 L25 23 H15 Z" fill="#1a52c2"/><path d="M13 28 Q20 23 27 28" stroke="#1a52c2" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
          }}
        />
      </div>
      <p className="text-white/90 text-sm font-semibold tracking-wide">Applicant Portal</p>
    </header>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer({ onPrivacy }: { onPrivacy: () => void }) {
  return (
    <footer className="w-full py-4 flex flex-col sm:flex-row items-center justify-between gap-2 px-6 border-t border-gray-200 bg-white shrink-0">
      <p className="text-xs text-gray-500">
        © {new Date().getFullYear()} ARVIN International · All rights reserved
      </p>
      <button
        onClick={onPrivacy}
        className="text-xs font-medium underline underline-offset-2 hover:opacity-70 transition-opacity flex items-center gap-1"
        style={{ color: "#1a52c2" }}
      >
        <Shield className="w-3 h-3" />
        Privacy Policy
      </button>
    </footer>
  );
}

// ─── Privacy Policy Modal ─────────────────────────────────────────────────────

function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,28,63,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0"
          style={{ background: "linear-gradient(135deg, #1340a8 0%, #1e6adf 100%)" }}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-white/80" />
            <h2 className="text-base font-bold text-white">Privacy Policy</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm text-gray-900 leading-relaxed">
          <p className="text-xs text-gray-500">Effective Date: July 1, 2025 · Last Updated: July 1, 2025</p>

          <section>
            <h3 className="font-bold text-base mb-1.5">1. Introduction</h3>
            <p>ARVIN International ("we," "us," or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard information you provide when applying for a position through our Applicant Portal.</p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">2. Information We Collect</h3>
            <p>When you submit an application, we collect:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-500">
              <li><span className="text-gray-900 font-medium">Personal Identifiers</span> — full name, email address, and phone number</li>
              <li><span className="text-gray-900 font-medium">Professional Information</span> — resume/CV, work history, and applied position</li>
              <li><span className="text-gray-900 font-medium">Technical Data</span> — browser type, IP address, and access timestamps (logged automatically)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">3. How We Use Your Information</h3>
            <p>Your information is used solely for:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-500">
              <li>Evaluating your application and qualifications</li>
              <li>Communicating with you about the status of your application</li>
              <li>Complying with legal and regulatory obligations</li>
              <li>Maintaining a talent pool for future openings (with your consent)</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">4. Data Sharing</h3>
            <p>We do not sell or rent your personal data. We may share it with:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-500">
              <li>Internal hiring teams at ARVIN International</li>
              <li>Third-party service providers under strict confidentiality agreements</li>
              <li>Government or regulatory bodies as required by Philippine law</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">5. Data Retention</h3>
            <p>Application data is retained for a maximum of <span className="font-semibold text-gray-900">two (2) years</span> from the date of submission or until you request deletion, whichever comes first. Hired applicants' data transitions to our employee records system.</p>
          </section>

          <section>
            <h3 className="font-bold text-base mb-1.5">6. Your Rights</h3>
            <p>Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the right to:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-500">
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
            <div className="mt-2 p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs space-y-0.5">
              <p className="font-semibold text-gray-900">ARVIN International — Data Protection Office</p>
              <p>Email: <span className="font-medium" style={{ color: "#1a52c2" }}>privacy@arvininternational.com</span></p>
              <p>Address: Metro Manila, Philippines</p>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all duration-150 hover:opacity-90 active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg, #1340a8 0%, #1e6adf 100%)" }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-900">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full px-4 py-3 rounded-xl border text-sm text-gray-900 placeholder:text-gray-500",
    "bg-gray-50 outline-none transition-all duration-150",
    "focus:ring-2 focus:ring-blue-200 focus:border-blue-400/50",
    "hover:border-blue-400/50",
    hasError ? "border-red-400" : "border-gray-200",
  ].join(" ");
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  overflowY: "auto",
};

const bgStyle: React.CSSProperties = {
  background: "radial-gradient(ellipse 90% 60% at 50% 0%, #c5d8f8 0%, #eef3fc 55%)",
};
