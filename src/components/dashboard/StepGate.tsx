'use client';

import { useState } from 'react';
import { Sparkles, HeartHandshake, Clock, LogOut, Check, Send, Search, ThumbsUp, ThumbsDown } from 'lucide-react';

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

function DevToolCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-xl border-2 border-dashed p-4" style={{ borderColor: T.cyanBorder, backgroundColor: T.cyanBg }}>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-2.5" style={{ color: T.cyan }}>
        {title}
      </p>
      {children}
    </div>
  );
}

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
        <DevToolCard title="Dev Tool — Testing Only">
          <button type="button" onClick={() => setPhase('submitted')}
            className="w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-lg text-sm text-white shadow-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: T.navy }}>
            <Send className="w-4 h-4" /> Simulate: Mark This Step as Submitted
          </button>
        </DevToolCard>
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
        <DevToolCard title="Dev Tool — Testing Only">
          <button type="button" onClick={() => setPhase('reviewing')}
            className="w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-lg text-sm text-white shadow-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: T.navy }}>
            <Search className="w-4 h-4" /> Simulate: Move to Under Review
          </button>
        </DevToolCard>
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
        <DevToolCard title="Dev Tool — Simulate HR Decision">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button type="button" onClick={() => setPhase('passed')}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-lg text-sm text-white shadow-sm hover:opacity-90 transition-all"
              style={{ backgroundColor: T.cyan }}>
              <ThumbsUp className="w-4 h-4" /> Simulate: Pass
            </button>
            <button type="button" onClick={() => setPhase('failed')}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-lg text-sm border-2 shadow-sm hover:bg-black/5 transition-all"
              style={{ color: T.gray, borderColor: T.locked, backgroundColor: '#fff' }}>
              <ThumbsDown className="w-4 h-4" /> Simulate: Not Selected
            </button>
          </div>
        </DevToolCard>
      </div>
    );
  }

  if (phase === 'passed') {
    if (showWithdrawForm) {
      const canConfirm = reason && (reason !== 'Other' || otherReason.trim().length > 0);
      return (
        <div className="pt-3 space-y-3">
          <div className="rounded-2xl border-2 p-5 space-y-3.5 shadow-sm" style={{ borderColor: T.cyanBorder, backgroundColor: '#fff' }}>
            <p className="text-base font-bold text-center" style={{ color: T.navy }}>We&apos;re sorry to see you go</p>
            <p className="text-sm text-center" style={{ color: T.gray }}>Please tell us why you&apos;re withdrawing your application:</p>
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-3 text-sm rounded-lg outline-none" style={{ backgroundColor: T.bg, color: T.navy, border: `1px solid ${T.locked}` }}>
              <option value="">Select a reason</option>
              {WITHDRAW_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {reason === 'Other' && (
              <textarea value={otherReason} onChange={(e) => setOtherReason(e.target.value)} rows={3}
                placeholder="Please specify your reason"
                className="w-full px-3.5 py-3 text-sm rounded-lg outline-none resize-none" style={{ backgroundColor: T.bg, color: T.navy, border: `1px solid ${T.locked}` }} />
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowWithdrawForm(false)}
                className="flex-1 py-2.5 border-2 font-semibold rounded-lg text-sm hover:bg-black/5 transition-all" style={{ color: T.navy, borderColor: T.locked }}>
                Cancel
              </button>
              <button type="button" onClick={handleWithdrawConfirm} disabled={!canConfirm}
                className="flex-1 py-2.5 text-white font-semibold rounded-lg text-sm shadow-sm transition-all"
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
        <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-lg font-bold text-green-900">Congratulations!</p>
          <p className="text-sm text-green-800 max-w-sm mx-auto">You passed the {stepLabel} stage and are eligible to move forward to the next step.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button type="button" onClick={onAdvance}
            className="flex-1 py-3 text-white font-semibold rounded-lg text-sm shadow-sm hover:opacity-90 transition-all" style={{ backgroundColor: T.navy }}>
            Continue to Next Stage
          </button>
          <button type="button" onClick={() => setShowWithdrawForm(true)}
            className="flex-1 py-3 border-2 font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5 hover:bg-red-50 transition-all" style={{ color: '#DC2626', borderColor: '#FCA5A5' }}>
            <LogOut className="w-4 h-4" /> Withdraw Application
          </button>
        </div>
      </div>
    );
  }

  // phase === 'failed'
  return (
    <div className="pt-3 space-y-3">
      <div className="rounded-2xl border-2 p-6 text-center space-y-2" style={{ backgroundColor: T.cyanBg, borderColor: T.cyanBorder }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#fff' }}>
          <HeartHandshake className="w-6 h-6" style={{ color: T.cyan }} />
        </div>
        <p className="text-lg font-bold" style={{ color: T.navy }}>Thank You for Your Time</p>
        <p className="text-sm max-w-sm mx-auto" style={{ color: T.gray }}>
          We won&apos;t be moving forward with your application for this particular role right now, but we were genuinely impressed by parts of your application and would love for you to apply again for future openings at Arvin.
        </p>
      </div>
    </div>
  );
}
