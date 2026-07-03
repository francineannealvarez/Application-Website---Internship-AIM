'use client';

import { useState } from 'react';
import { Check, Clock, AlertCircle, FileText } from 'lucide-react';

const T = {
  navy: '#0B2A4A',
  cyan: '#12B6D6',
  gray: '#6B7A8D',
  border: '#E5E9EC',
  bg: '#F7F9FA',
  faint: '#9BAAB8',
  cyanBg: '#EEF9FB',
  cyanBorder: '#B8EAF3',
  locked: '#D1DAE3',
};

const QUESTIONS = [
  'Based on your own understanding, what is the primary responsibility of the position you are applying for? Why do you say so?',
  'If you are hired, what are the initial steps that you will undertake when you join the organization?',
  'Describe competencies that you possess that will enable you to effectively and efficiently perform the functions of the position you are applying for?',
  'What is your most notable strength that will enable you to efficiently and effectively perform the function? What are your weakness/es, if any, which may hamper you to do the same?',
  'How do you see yourself five years from now?',
];

export default function AssessmentContent({ isCurrent, onSubmit }: { isCurrent: boolean; onSubmit: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));

  const updateAnswer = (idx: number, value: string) => {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));
  };

  const missing = QUESTIONS.filter((_, idx) => answers[idx].trim().length === 0).length;
  const canSubmit = missing === 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    onSubmit();
  };

  if (submitted) {
    return (
      <div className="pt-3">
        <div className="flex items-start gap-2.5 rounded-xl p-4 text-sm" style={{ backgroundColor: T.cyanBg, border: `1px solid ${T.cyanBorder}` }}>
          <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.cyan }} />
          <span style={{ color: T.navy }}>
            Your assessment answers have been noted. HR is reviewing your results — please wait for an update before the next stage unlocks.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl p-3.5 text-sm mb-1" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}>
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#D97706' }} />
        <span>Please answer all questions completely. Take your time — there is no time limit for this essay assessment.</span>
      </div>

      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.cyanBg }}>
          <FileText className="w-4 h-4" style={{ color: T.cyan }} />
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: T.navy }}>Essay Test Questions</div>
          <div className="text-xs mt-0.5" style={{ color: T.gray }}>Answer each question in your own words.</div>
        </div>
      </div>

      {QUESTIONS.map((q, idx) => (
        <div key={idx}>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: T.navy }}>
            {idx + 1}. {q}
          </label>
          <textarea
            value={answers[idx]}
            onChange={(e) => updateAnswer(idx, e.target.value)}
            rows={7}
            placeholder="Type your answer here..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-colors focus:border-[#12B6D6] resize-none"
            style={{ backgroundColor: T.bg, borderColor: T.border, color: T.navy }}
          />
        </div>
      ))}

      {!canSubmit && (
        <div className="rounded-xl p-3.5 text-xs" style={{ backgroundColor: '#FFF1F2', border: '1px solid #FECDD3', color: '#9F1239' }}>
          Please answer all {QUESTIONS.length} questions before submitting. ({missing} remaining)
        </div>
      )}

      <button type="button" onClick={handleSubmit} disabled={!canSubmit}
        className="w-full py-3 font-semibold rounded-lg transition-all duration-200 text-sm shadow-sm"
        style={canSubmit
          ? { backgroundColor: T.navy, color: '#fff', cursor: 'pointer' }
          : { backgroundColor: T.locked, color: T.gray, cursor: 'not-allowed' }}>
        {canSubmit ? 'Submit Assessment' : `Complete all answers to submit (${missing} remaining)`}
      </button>

      {isCurrent && (
        <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: T.bg, border: `1px solid ${T.border}`, color: T.gray }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: T.faint }} />
          <span>Once submitted, HR will review your answers before the Department Interview stage unlocks.</span>
        </div>
      )}
    </div>
  );
}
