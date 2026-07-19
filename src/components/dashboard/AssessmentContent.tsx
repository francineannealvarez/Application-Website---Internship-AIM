'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertCircle, FileText } from 'lucide-react';

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

const QUESTIONS = [
  'Based on your own understanding, what is the primary responsibility of the position you are applying for? Why do you say so?',
  'If you are hired, what are the initial steps that you will undertake when you join the organization?',
  'Describe competencies that you possess that will enable you to effectively and efficiently perform the functions of the position you are applying for?',
  'What is your most notable strength that will enable you to efficiently and effectively perform the function? What are your weakness/es, if any, which may hamper you to do the same?',
  'How do you see yourself five years from now?',
];

type ApplicantAssessmentRecord = {
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
  q4?: string | null;
  q5?: string | null;
} | null;

export default function AssessmentContent({
  isCurrent,
  onSubmit,
  applicationId,
}: {
  isCurrent: boolean;
  onSubmit: () => void;
  applicationId: string | null;
}) {
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load any previously-saved answers so a page refresh mid-assessment
  // doesn't wipe out what the applicant already wrote.
  useEffect(() => {
    if (!applicationId) {
      setLoading(false);
      return;
    }
    let active = true;
    fetch(`/api/assessment?application_id=${encodeURIComponent(applicationId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ApplicantAssessmentRecord) => {
        if (!active || !data) return;
        setAnswers([data.q1 ?? '', data.q2 ?? '', data.q3 ?? '', data.q4 ?? '', data.q5 ?? '']);
      })
      .catch((err) => console.error('Load assessment error:', err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId]);

  const updateAnswer = (idx: number, value: string) => {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));
  };

  const missing = QUESTIONS.filter((_, idx) => answers[idx].trim().length === 0).length;
  const canSubmit = missing === 0 && !submitting && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!applicationId) {
      setError('Missing application reference. Please refresh the page and try again.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          q1: answers[0],
          q2: answers[1],
          q3: answers[2],
          q4: answers[3],
          q5: answers[4],
        }),
      });
      if (!res.ok) throw new Error('Failed to save assessment');
      // No confirmation gate for Assessment - saving immediately advances
      // to the next step in the hiring process, same as the PDS step.
      onSubmit();
    } catch (err) {
      console.error('Submit assessment error:', err);
      setError('Something went wrong while saving your answers. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-3 space-y-4">
      <div className="flex items-start gap-2.5 rounded-xl p-3.5 text-sm mb-1" style={{ backgroundColor: '#FFFBEB',  color: '#92400E' }}>
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

      {loading ? (
        <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: T.bg, color: T.gray }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: T.faint }} />
          <span>Loading your assessment...</span>
        </div>
      ) : (
        <>
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
                style={{ backgroundColor: T.bg,  color: T.navy }}
                disabled={submitting}
              />
            </div>
          ))}

          {!canSubmit && missing > 0 && (
            <div className="rounded-xl p-3.5 text-xs" style={{ backgroundColor: '#FFF1F2',  color: '#9F1239' }}>
              Please answer all {QUESTIONS.length} questions before submitting. ({missing} remaining)
            </div>
          )}

          {error && (
            <div className="rounded-xl p-3.5 text-xs" style={{ backgroundColor: '#FFF1F2',  color: '#9F1239' }}>
              {error}
            </div>
          )}

          <button type="button" onClick={handleSubmit} disabled={!canSubmit}
            className="w-full py-3 font-semibold rounded-lg transition-all duration-200 text-sm shadow-sm"
            style={canSubmit
              ? { backgroundColor: T.navy, color: '#fff', cursor: 'pointer' }
              : { backgroundColor: T.locked, color: T.gray, cursor: 'not-allowed' }}>
            {submitting ? 'Submitting...' : canSubmit ? 'Submit Assessment' : `Complete all answers to submit (${missing} remaining)`}
          </button>

          {isCurrent && (
            <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: T.bg, color: T.gray }}>
              <Clock className="w-4 h-4 shrink-0" style={{ color: T.faint }} />
              <span>Take your time — you can submit your answers whenever you&apos;re ready.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}