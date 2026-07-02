'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Briefcase, FileText,
  Upload, X, Building2, Calendar,
} from 'lucide-react';

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type Step = 1 | 2 | 3 | 4;

type FormData = {
  positionId: string;
  phoneNumber: string;
  homeAddress: string;
  dateOfBirth: string;
  gender: string;
  heardAboutUs: string;
  preferredStartDate: string;
  message: string;
  portfolioUrl: string;
};

type Position = {
  id: string;
  title: string;
  department: string;
  employmentType: string;
};

export default function ApplicationForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const resumeRef = useRef<HTMLInputElement>(null);
  const coverLetterRef = useRef<HTMLInputElement>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormData>({
    positionId: '', phoneNumber: '', homeAddress: '', dateOfBirth: '',
    gender: '', heardAboutUs: '', preferredStartDate: '', message: '', portfolioUrl: '',
  });

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  useEffect(() => {
    fetch('/api/positions').then(r => r.json()).then(setPositions).catch(console.error);
  }, []);

  const set = (field: keyof FormData, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const selectedPosition = positions.find(p => p.id === form.positionId);

  const handleResumeFile = (file: File) => {
    if (file.name.endsWith('.pdf') || file.name.endsWith('.docx')) setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) { alert('Please upload your resume.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('resume', resumeFile);
      if (coverLetterFile) formData.append('coverLetter', coverLetterFile);

      const res = await fetch('/api/applications', { method: 'POST', body: formData });
      if (res.ok) {
        router.push('/dashboard?success=true');
      } else {
        const err = await res.json();
        alert(err.error || 'Submission failed. Please try again.');
      }
    } catch { alert('An error occurred. Please try again.'); }
    finally { setLoading(false); }
  };

  const inputClass = cn(
    'w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200',
    'bg-[#F7F9FA] focus:bg-white focus:border-[#12B6D6] focus:ring-4 focus:ring-[#12B6D6]/10 focus:shadow-sm border-[#E5E9EC]'
  );

  const plainInputClass = cn(
    'w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200',
    'bg-[#F7F9FA] focus:bg-white focus:border-[#12B6D6] focus:ring-4 focus:ring-[#12B6D6]/10 focus:shadow-sm border-[#E5E9EC]'
  );

  if (status === 'loading') return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!session) return null;

  const STEP_LABELS = ['Personal', 'Position', 'Documents', 'Review'];

  return (
    <div className="min-h-screen bg-[#F7F9FA] py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex gap-1.5 mb-2">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className={cn('h-2 flex-1 rounded-full transition-colors duration-500', step <= currentStep ? 'bg-[#0B2A4A]' : 'bg-[#E5E9EC]')} />
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={cn('transition-colors duration-300', (i + 1) <= currentStep ? 'text-[#0B2A4A]' : 'text-[#9BAAB8]')}>{label}</span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5E9EC] shadow-sm overflow-hidden animate-fade-slide-up">
          {/* Header */}
          <div className="relative bg-[#0B2A4A] px-8 py-8 text-white text-center overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <div className="text-base font-medium" style={{ color: '#B8EAF3' }}>Applicant Portal</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-5">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-[#0B2A4A]">
                {currentStep === 1 && 'Personal Information'}
                {currentStep === 2 && 'Position Details'}
                {currentStep === 3 && 'Documents'}
                {currentStep === 4 && 'Review & Submit'}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: '#6B7A8D' }}>
                {currentStep === 4 ? 'Please review your application before submitting.' : 'Fill out all fields to submit your application.'}
              </p>
            </div>

            {/* Step 1 — Personal */}
            {currentStep === 1 && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-[#0B2A4A]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BAAB8] w-4 h-4" />
                    <input type="text" value={session.user?.name || ''} disabled className={cn(inputClass, 'opacity-60 cursor-not-allowed')} />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-[#0B2A4A]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BAAB8] w-4 h-4" />
                    <input type="email" value={session.user?.email || ''} disabled className={cn(inputClass, 'opacity-60 cursor-not-allowed')} />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-[#0B2A4A]">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BAAB8] w-4 h-4" />
                    <input type="tel" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="+63 917 000 0000" className={inputClass} />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-[#0B2A4A]">Home Address</label>
                  <textarea value={form.homeAddress} onChange={e => set('homeAddress', e.target.value)} placeholder="Street, Barangay, City, Province" rows={2} className={cn(plainInputClass, 'resize-none')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2A4A]">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={plainInputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2A4A]">Gender</label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)} className={plainInputClass}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2 — Position */}
            {currentStep === 2 && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-[#0B2A4A]">Position Applying For</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BAAB8] w-4 h-4 pointer-events-none" />
                    <select value={form.positionId} onChange={e => set('positionId', e.target.value)} className={cn(inputClass, 'appearance-none', !form.positionId && 'text-[#9BAAB8]')}>
                      <option value="">Select a position</option>
                      {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                </div>
                {selectedPosition && (
                  <div className="sm:col-span-2 rounded-xl p-4 space-y-1.5 animate-fade-in" style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}>
                    <div className="flex items-center gap-2 text-sm text-[#0B2A4A]"><Building2 className="w-4 h-4" style={{ color: '#12B6D6' }} /><span className="font-medium">Department:</span> {selectedPosition.department}</div>
                    <div className="flex items-center gap-2 text-sm text-[#0B2A4A]"><Briefcase className="w-4 h-4" style={{ color: '#12B6D6' }} /><span className="font-medium">Type:</span> {selectedPosition.employmentType}</div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2A4A]">Preferred Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BAAB8] w-4 h-4 pointer-events-none" />
                    <input type="date" value={form.preferredStartDate} onChange={e => set('preferredStartDate', e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2A4A]">How did you hear about us?</label>
                  <select value={form.heardAboutUs} onChange={e => set('heardAboutUs', e.target.value)} className={plainInputClass}>
                    <option value="">Select</option>
                    <option>LinkedIn</option><option>Facebook</option><option>Friend / Referral</option>
                    <option>Job Fair</option><option>Company Website</option><option>Other</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-[#0B2A4A]">Message / Cover Letter <span style={{ color: '#9BAAB8' }} className="font-normal">(optional)</span></label>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell us why you'd be a great fit..." rows={4} className={cn(plainInputClass, 'resize-none')} />
                </div>
              </div>
            )}

            {/* Step 3 — Documents */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2A4A]">Resume / CV <span className="text-red-500">*</span></label>
                  <div
                    onDragEnter={() => setDragging(true)}
                    onDragLeave={() => setDragging(false)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleResumeFile(f); }}
                    onClick={() => resumeRef.current?.click()}
                    className={cn('border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200')}
                    style={dragging
                      ? { borderColor: '#12B6D6', backgroundColor: '#EEF9FB' }
                      : { borderColor: '#E5E9EC', backgroundColor: '#F7F9FA' }}
                  >
                    <input ref={resumeRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleResumeFile(f); }} />
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-2 animate-scale-in">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF9FB' }}><FileText className="w-4 h-4" style={{ color: '#12B6D6' }} /></div>
                        <span className="text-sm font-medium text-[#0B2A4A]">{resumeFile.name}</span>
                        <button type="button" onClick={ev => { ev.stopPropagation(); setResumeFile(null); }} className="ml-1 text-[#9BAAB8] hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <Upload className={cn('w-8 h-8 mx-auto mb-2 transition-colors')} style={{ color: dragging ? '#12B6D6' : '#D1DAE3' }} />
                        <p className="text-sm font-medium" style={{ color: '#6B7A8D' }}>Drag &amp; drop your resume, or <span style={{ color: '#12B6D6' }} className="font-semibold">browse files</span></p>
                        <p className="text-xs mt-1" style={{ color: '#9BAAB8' }}>PDF or DOCX &middot; Max 10 MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2A4A]">Cover Letter <span style={{ color: '#9BAAB8' }} className="font-normal">(optional)</span></label>
                  <div className="relative">
                    <input ref={coverLetterRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setCoverLetterFile(f); }} />
                    {coverLetterFile ? (
                      <div className="flex items-center gap-2 p-3.5 rounded-xl" style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}>
                        <FileText className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
                        <span className="text-sm font-medium text-[#0B2A4A] flex-1 truncate">{coverLetterFile.name}</span>
                        <button type="button" onClick={() => setCoverLetterFile(null)} className="text-[#9BAAB8] hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => coverLetterRef.current?.click()} className="w-full py-3 border-2 border-dashed rounded-xl text-sm transition-all duration-200" style={{ borderColor: '#E5E9EC', color: '#6B7A8D' }}>
                        + Upload Cover Letter
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B2A4A]">Portfolio URL <span style={{ color: '#9BAAB8' }} className="font-normal">(optional)</span></label>
                  <input type="url" value={form.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)} placeholder="https://yourportfolio.com" className={plainInputClass} />
                </div>
              </div>
            )}

            {/* Step 4 — Review */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="rounded-xl p-4 animate-fade-in" style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}>
                  <p className="text-sm text-[#0B2A4A]">Thank you for your interest in joining the Arvin family. We will review your application and get back to you soon.</p>
                </div>
                <div className="bg-white rounded-xl divide-y" style={{ border: '1px solid #E5E9EC' }}>
                  {[
                    { label: 'Full Name', value: session.user?.name },
                    { label: 'Email', value: session.user?.email },
                    { label: 'Phone', value: form.phoneNumber || '—' },
                    { label: 'Position', value: selectedPosition?.title || '—' },
                    { label: 'Department', value: selectedPosition?.department || '—' },
                    { label: 'Resume', value: resumeFile?.name || 'Not uploaded' },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-4 py-3 flex items-start gap-3" style={{ borderColor: '#E5E9EC' }}>
                      <span className="text-xs w-24 shrink-0 pt-0.5 font-medium" style={{ color: '#9BAAB8' }}>{label}</span>
                      <span className="text-sm font-semibold text-[#0B2A4A]">{value}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1" style={{ accentColor: '#12B6D6' }} />
                  <span className="text-sm" style={{ color: '#6B7A8D' }}>I confirm that all information provided is accurate and complete to the best of my knowledge.</span>
                </label>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-2">
              <button type="button" onClick={() => setCurrentStep(prev => (prev > 1 ? (prev - 1 as Step) : prev))} disabled={currentStep === 1} className="px-6 py-2.5 border-2 rounded-lg text-[#0B2A4A] font-semibold hover:bg-[#F7F9FA] active:scale-95 disabled:opacity-40 transition-all duration-200" style={{ borderColor: '#E5E9EC' }}>
                Previous
              </button>
              {currentStep < 4 ? (
                <button type="button" onClick={() => setCurrentStep(prev => (prev < 4 ? (prev + 1 as Step) : prev))} className="px-6 py-2.5 text-white font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all duration-200" style={{ backgroundColor: '#0B2A4A' }}>
                  Next
                </button>
              ) : (
                <button type="submit" disabled={loading} className="px-6 py-2.5 text-white font-semibold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all duration-200" style={{ backgroundColor: '#0B2A4A' }}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
