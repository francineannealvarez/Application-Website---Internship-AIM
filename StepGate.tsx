'use client';

import { useState } from 'react';
import { Sparkles, HeartHandshake, Clock, LogOut, Check } from 'lucide-react';

type Phase = 'active' | 'submitted' | 'reviewing' | 'passed' | 'failed';

const T = {
  navy: '#0B2A4A',
  cyan: '#12B6D6',
  gray: '#6B7A8D',
  bg: '#F7F9FA',
  faint: '#9BAAB8',
  cyanBg: '#EEF9FB',
  cyanBorder: '#B8EAF3',
  locked: '#D1DAE3',
};

const WITHDRAW_REASONS = [
  'I accepted another job offer',
  'The schedule/location does not fit my availability',
  'The salary/package does not meet my expectations',
  'Personal or family reasons',
  'I am no longer interested in this position',
  'Other',
];

export default function StepGate({
  stepLabel,
  isCurrent,
  onAdvance,
  onWithdraw,
  children,
}: {
  stepLabel: string;
  isCurrent: boolean;
  onAdvance: () => void;
  onWithdraw: (reason: string) => void;
  children: (markSubmitted: () => void) => React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>('active');
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  if (!isCurrent) {
    return <>{children(() => {})}</>;
  }

  const handleWithdrawConfirm = () => {
    const finalReason = reason === 'Other' ? otherReason.trim() : reason;
    if (!finalReason) return;
    onWithdraw(finalReason);
  };

  if (phase === 'active') {
    return (
      <>
        {children(() => setPhase('submitted'))}
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl p-3 border border-dashed" style={{ borderColor: T.locked }}>
          <span className="text-xs" style={{ color: T.faint }}>Dev tool:</span>
          <button type="button" onClick={() => setPhase('submitted')}
            className="text-xs px-3 py-1.5 rounded-lg border border-dashed font-medium hover:bg-black/5" style={{ color: T.faint, borderColor: T.locked }}>
            Simulate: Mark as Submitted
          </button>
        </div>
      </>
    );
  }

  if (phase === 'submitted') {
    return (
      <div className="pt-3 space-y-3">
        <div className="flex items-start gap-2.5 rounded-xl p-4 text-sm" style={{ backgroundColor: T.cyanBg }}>
          <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.cyan }} />
          <span style={{ color: T.navy }}>{stepLabel} submitted! We will start reviewing it soon.</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl p-3 border border-dashed" style={{ borderColor: T.locked }}>
          <span className="text-xs" style={{ color: T.faint }}>Dev tool:</span>
          <button type="button" onClick={() => setPhase('reviewing')}
            className="text-xs px-3 py-1.5 rounded-lg border border-dashed font-medium hover:bg-black/5" style={{ color: T.faint, borderColor: T.locked }}>
            Simulate: Mark Under Review
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'reviewing') {
    return (
      <div className="pt-3 space-y-3">
        <div className="flex items-start gap-2.5 rounded-xl p-4 text-sm" style={{ backgroundColor: T.cyanBg }}>
          <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.cyan }} />
          <span style={{ color: T.navy }}>Our HR team is currently reviewing this stage. This typically takes 3-5 business days.</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl p-3 border border-dashed" style={{ borderColor: T.locked }}>
          <span className="text-xs" style={{ color: T.faint }}>Dev tool — simulate result:</span>
          <button type="button" onClick={() => setPhase('passed')}
            className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: T.cyan }}>
            Pass
          </button>
          <button type="button" onClick={() => setPhase('failed')}
            className="text-xs px-3 py-1.5 rounded-lg font-medium border" style={{ color: T.gray, borderColor: T.locked }}>
            Not Selected
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'passed') {
    if (showWithdrawForm) {
      const canConfirm = reason && (reason !== 'Other' || otherReason.trim().length > 0);
      return (
        <div className="pt-3 space-y-3">
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: T.bg }}>
            <p className="text-sm font-semibold" style={{ color: T.navy }}>We&apos;re sorry to see you go. Please tell us why you&apos;re withdrawing:</p>
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg outline-none" style={{ backgroundColor: '#fff', color: T.navy, border: `1px solid ${T.locked}` }}>
              <option value="">Select a reason</option>
              {WITHDRAW_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {reason === 'Other' && (
              <textarea value={otherReason} onChange={(e) => setOtherReason(e.target.value)} rows={3}
                placeholder="Please specify your reason"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg outline-none resize-none" style={{ backgroundColor: '#fff', color: T.navy, border: `1px solid ${T.locked}` }} />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowWithdrawForm(false)}
                className="flex-1 py-2.5 border font-semibold rounded-lg text-sm" style={{ color: T.navy, borderColor: T.locked }}>
                Cancel
              </button>
              <button type="button" onClick={handleWithdrawConfirm} disabled={!canConfirm}
                className="flex-1 py-2.5 text-white font-semibold rounded-lg text-sm"
                style={{ backgroundColor: canConfirm ? '#DC2626' : T.locked, cursor: canConfirm ? 'pointer' : 'not-allowed' }}>
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="pt-3 space-y-3">
        <div className="flex items-start gap-3 rounded-xl p-4 text-sm border border-green-200 bg-green-50">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
          <span className="text-green-900">Congratulations! You passed the {stepLabel} stage and are eligible to move forward.</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button type="button" onClick={onAdvance}
            className="flex-1 py-2.5 text-white font-semibold rounded-lg text-sm" style={{ backgroundColor: T.navy }}>
            Continue to Next Stage
          </button>
          <button type="button" onClick={() => setShowWithdrawForm(true)}
            className="flex-1 py-2.5 border font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5" style={{ color: '#DC2626', borderColor: '#FCA5A5' }}>
            <LogOut className="w-3.5 h-3.5" /> Withdraw Application
          </button>
        </div>
      </div>
    );
  }

  // phase === 'failed'
  return (
    <div className="pt-3 space-y-3">
      <div className="flex items-start gap-3 rounded-xl p-4 text-sm border" style={{ backgroundColor: T.cyanBg, borderColor: T.cyanBorder }}>
        <HeartHandshake className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.cyan }} />
        <span style={{ color: T.navy }}>
          Thank you for your time and effort throughout this process. We won&apos;t be moving forward with your application for this particular role right now, but we were genuinely impressed by parts of your application and would love for you to apply again for future openings at Arvin.
        </span>
      </div>
    </div>
  );
}
