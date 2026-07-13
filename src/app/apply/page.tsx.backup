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
    'bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:shadow-sm border-gray-200'
  );

  const plainInputClass = cn(
    'w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200',
    'bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:shadow-sm border-gray-200'
  );

  if (status === 'loading') return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!session) return null;

  const STEP_LABELS = ['Personal', 'Position', 'Documents', 'Review'];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1fc_0%,_#f0f5fb_55%)] py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex gap-1.5 mb-2">
            {[1,2,3,4].map(step => (
              <div key={step} className={cn('h-2 flex-1 rounded-full transition-colors duration-500', step <= currentStep ? 'bg-gradient-to-r from-[#0D47A1] to-[#1E88E5]' : 'bg-gray-200')} />
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={cn('transition-colors duration-300', (i + 1) <= currentStep ? 'text-[#1565C0]' : 'text-gray-400')}>{label}</span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden animate-fade-slide-up">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1E88E5] px-8 py-8 text-white text-center overflow-hidden">
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <div className="text-base font-medium text-blue-50">Applicant Portal</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentStep === 1 && 'Personal Information'}
                {currentStep === 2 && 'Position Details'}
                {currentStep === 3 && 'Documents'}
                {currentStep === 4 && 'Review & Submit'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {currentStep === 4 ? 'Please review your application before submitting.' : 'Fill out all fields to submit your application.'}
              </p>
            </div>

            {/* Step 1 — Personal */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" value={session.user?.name || ''} disabled className={cn(inputClass, 'opacity-60 cursor-not-allowed')} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="email" value={session.user?.email || ''} disabled className={cn(inputClass, 'opacity-60 cursor-not-allowed')} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="tel" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="+63 917 000 0000" className={inputClass} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Home Address</label>
                  <textarea value={form.homeAddress} onChange={e => set('homeAddress', e.target.value)} placeholder="Street, Barangay, City, Province" rows={2} className={cn(plainInputClass, 'resize-none')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={plainInputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <select value={form.gender} onChange={e => set('gender', e.target.value)} className={plainInputClass}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Position */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Position Applying For</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select value={form.positionId} onChange={e => set('positionId', e.target.value)} className={cn(inputClass, 'appearance-none', !form.positionId && 'text-gray-400')}>
                      <option value="">Select a position</option>
                      {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                </div>
                {selectedPosition && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1.5 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-gray-700"><Building2 className="w-4 h-4 text-blue-500" /><span className="font-medium">Department:</span> {selectedPosition.department}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-700"><Briefcase className="w-4 h-4 text-blue-500" /><span className="font-medium">Type:</span> {selectedPosition.employmentType}</div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Preferred Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input type="date" value={form.preferredStartDate} onChange={e => set('preferredStartDate', e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">How did you hear about us?</label>
                  <select value={form.heardAboutUs} onChange={e => set('heardAboutUs', e.target.value)} className={plainInputClass}>
                    <option value="">Select</option>
                    <option>LinkedIn</option><option>Facebook</option><option>Friend / Referral</option>
                    <option>Job Fair</option><option>Company Website</option><option>Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Message / Cover Letter <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell us why you'd be a great fit..." rows={4} className={cn(plainInputClass, 'resize-none')} />
                </div>
              </div>
            )}

            {/* Step 3 — Documents */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Resume / CV <span className="text-red-500">*</span></label>
                  <div
                    onDragEnter={() => setDragging(true)}
                    onDragLeave={() => setDragging(false)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleResumeFile(f); }}
                    onClick={() => resumeRef.current?.click()}
                    className={cn('border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200', dragging ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-inner' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40')}
                  >
                    <input ref={resumeRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleResumeFile(f); }} />
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-2 animate-scale-in">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div>
                        <span className="text-sm font-medium text-blue-700">{resumeFile.name}</span>
                        <button type="button" onClick={ev => { ev.stopPropagation(); setResumeFile(null); }} className="ml-1 text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <Upload className={cn('w-8 h-8 mx-auto mb-2 transition-colors', dragging ? 'text-blue-400' : 'text-gray-300')} />
                        <p className="text-sm font-medium text-gray-600">Drag & drop your resume, or <span className="text-blue-600">browse files</span></p>
                        <p className="text-xs text-gray-400 mt-1">PDF or DOCX · Max 10 MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Cover Letter <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <input ref={coverLetterRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setCoverLetterFile(f); }} />
                    {coverLetterFile ? (
                      <div className="flex items-center gap-2 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="text-sm font-medium text-blue-700 flex-1 truncate">{coverLetterFile.name}</span>
                        <button type="button" onClick={() => setCoverLetterFile(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => coverLetterRef.current?.click()} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
                        + Upload Cover Letter
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Portfolio URL <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="url" value={form.portfolioUrl} onChange={e => set('portfolioUrl', e.target.value)} placeholder="https://yourportfolio.com" className={plainInputClass} />
                </div>
              </div>
            )}

            {/* Step 4 — Review */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 animate-fade-in">
                  <p className="text-sm text-blue-800">Thank you for your interest in joining the Arvin family. We will review your application and get back to you soon.</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50 shadow-sm">
                  {[
                    { label: 'Full Name', value: session.user?.name },
                    { label: 'Email', value: session.user?.email },
                    { label: 'Phone', value: form.phoneNumber || '—' },
                    { label: 'Position', value: selectedPosition?.title || '—' },
                    { label: 'Department', value: selectedPosition?.department || '—' },
                    { label: 'Resume', value: resumeFile?.name || 'Not uploaded' },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-4 py-3 flex items-start gap-3">
                      <span className="text-xs text-gray-500 w-24 shrink-0 pt-0.5 font-medium">{label}</span>
                      <span className="text-sm font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1 accent-blue-600" />
                  <span className="text-sm text-gray-600">I confirm that all information provided is accurate and complete to the best of my knowledge.</span>
                </label>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-2">
              <button type="button" onClick={() => setCurrentStep(prev => (prev > 1 ? (prev - 1 as Step) : prev))} disabled={currentStep === 1} className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 active:scale-95 disabled:opacity-40 transition-all duration-200">
                Previous
              </button>
              {currentStep < 4 ? (
                <button type="button" onClick={() => setCurrentStep(prev => (prev < 4 ? (prev + 1 as Step) : prev))} className="px-6 py-2.5 bg-gradient-to-r from-[#1565C0] to-[#1E88E5] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
                  Next
                </button>
              ) : (
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gradient-to-r from-[#1565C0] to-[#1E88E5] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 transition-all duration-200">
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