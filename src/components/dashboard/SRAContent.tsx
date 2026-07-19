'use client';

import { useState, useRef, useCallback } from 'react';
import { Check, Clock, AlertCircle, FileText, ExternalLink, ClipboardList, Upload, X } from 'lucide-react';

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

// Update this link if the exam file ever moves to a different location.
const SRA_EXAM_URL = 'https://drive.google.com/file/d/1my-j6Hsnr-Iuoc1BHE_dMu3BQGB4hP5F/view?usp=sharing';

export default function SRAContent({ isCurrent, onSubmit, applicationId }: { isCurrent: boolean; onSubmit: () => void; applicationId: string | null }) {
  const [submitted, setSubmitted] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = acknowledged && file !== null && applicationId !== null && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !applicationId || !file) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append('application_id', applicationId);
      formData.append('file', file);

      const res = await fetch('/api/sra', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Failed to submit SRA answer sheet');
      }
      setSubmitted(true);
      onSubmit();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit SRA answer sheet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = (f: File) => {
    if (f && (f.name.endsWith('.pdf') || f.name.endsWith('.docx') || f.name.endsWith('.doc'))) {
      setFile(f);
      setFileError('');
    } else {
      setFileError('Please upload a PDF or Word document (.pdf, .docx, .doc).');
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
      <div className="pt-3">
        <div className="flex items-start gap-2.5 rounded-xl p-4 text-sm" style={{ backgroundColor: T.cyanBg }}>
          <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.cyan }} />
          <span style={{ color: T.navy }}>
            Your SRA (Verbal Reasoning Test) answer sheet has been submitted. HR is reviewing your results — please wait for an update before the next stage unlocks.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: '#FFFBEB', color: '#92400E' }}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#D97706' }} />
        <span>This exam applies to Clerk and Checker applicants only. Open the exam file below, answer it completely, then upload your accomplished answer sheet here.</span>
      </div>

      <div className="rounded-xl overflow-hidden" style={{}}>
        <div className="flex items-center gap-3 px-4 py-4" style={{ backgroundColor: T.bg }}>
          <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #EEF9FB 0%, #D6F4FA 100%)' }}>
            <ClipboardList className="w-5 h-5" style={{ color: T.cyan }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm" style={{ color: T.navy }}>SRA &mdash; Verbal Reasoning Test</div>
            <div className="text-xs mt-0.5" style={{ color: T.gray }}>Required for Clerk and Checker applicants</div>
          </div>
        </div>
        <div className="px-4 py-4 space-y-3" style={{ }}>
          <p className="text-sm leading-relaxed" style={{ color: T.navy }}>
            Step 1: Click below to open the exam document. Read the instructions on the file carefully and answer completely.
          </p>
          <a
            href={SRA_EXAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 font-semibold rounded-lg transition-all duration-200 text-sm shadow-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: T.navy, color: '#fff' }}
          >
            <FileText className="w-4 h-4" /> Open SRA Exam <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: T.navy }}>
          Step 2: Upload Your Accomplished Answer Sheet
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {file ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{  backgroundColor: T.bg }}>
            <FileText className="w-5 h-5 shrink-0" style={{ color: T.cyan }} />
            <span className="text-sm font-medium truncate flex-1" style={{ color: T.navy }}>{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="shrink-0 transition-colors hover:text-red-600" style={{ color: T.gray }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center px-4 py-6 rounded-xl cursor-pointer transition-all duration-150"
            style={{

              backgroundColor: dragging ? T.cyanBg : T.bg
            }}
          >
            <Upload className="w-6 h-6 mb-2" style={{ color: dragging ? T.cyan : T.gray }} />
            <p className="text-sm text-center" style={{ color: T.gray }}>
              Drag &amp; drop your answer sheet, or{' '}
              <span className="font-semibold hover:underline" style={{ color: T.cyan }}>browse files</span>
            </p>
            <p className="text-xs mt-1" style={{ color: T.faint }}>PDF, DOC, or DOCX</p>
          </div>
        )}
        {fileError && <p className="text-xs mt-1.5" style={{ color: '#DC2626' }}>{fileError}</p>}
      </div>

      <button
        type="button"
        onClick={() => setAcknowledged((v) => !v)}
        className="flex items-start gap-2.5 text-sm text-left"
        style={{ color: T.navy }}
      >
        <span
          className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5"
          style={{  backgroundColor: acknowledged ? T.cyan : 'transparent' }}
        >
          {acknowledged && <Check className="w-3 h-3 text-white" />}
        </span>
        <span>I confirm that the uploaded answer sheet is complete and accurate to the best of my knowledge.</span>
      </button>

      {submitError && (
        <div className="flex items-start gap-2.5 rounded-xl p-3.5 text-xs" style={{ backgroundColor: '#FFF1F2', color: '#9F1239' }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3 font-semibold rounded-lg transition-all duration-200 text-sm shadow-sm"
        style={canSubmit
          ? { backgroundColor: T.navy, color: '#fff', cursor: 'pointer' }
          : { backgroundColor: T.locked, color: T.gray, cursor: 'not-allowed' }}
      >
        {submitting ? 'Submitting...' : canSubmit ? 'Submit SRA Answer Sheet' : !file ? 'Upload your answer sheet to continue' : 'Check the box above to continue'}
      </button>

      {isCurrent && (
        <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: T.bg, color: T.gray }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: T.faint }} />
          <span>Once submitted, HR will review your results before the Assessment stage unlocks.</span>
        </div>
      )}
    </div>
  );
}