'use client';

import { useState } from 'react';
import { Sparkles, HeartHandshake } from 'lucide-react';
import StepGate from './StepGate';
import PersonalDataSheetContent from './PersonalDataSheetContent';
import SRAContent from './SRAContent';
import AssessmentContent from './AssessmentContent';
import BackgroundCheckContent from './BackgroundCheckContent';
import JobOfferContent from './JobOfferContent';
import OnboardingContent from './OnboardingContent';

const T = {
  navy: '#0B2A4A',
  cyan: '#12B6D6',
  gray: '#6B7A8D',
  cyanBg: '#EEF9FB',
  cyanBorder: '#B8EAF3',
};

type StageKey =
  | 'initial_interview'
  | 'pds'
  | 'sra'
  | 'assessment'
  | 'background'
  | 'final_interview'
  | 'joboffer'
  | 'onboarding';

const STAGES: { key: StageKey; label: string }[] = [
  { key: 'initial_interview', label: 'Initial Interview' },
  { key: 'pds', label: 'Personal Data Sheet' },
  { key: 'sra', label: 'SRA' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'background', label: 'Background Check' },
  { key: 'final_interview', label: 'Final Interview' },
  { key: 'joboffer', label: 'Job Offer' },
  { key: 'onboarding', label: 'Onboarding' },
];

// Pansamantalang placeholder â€” walang dedicated component pa ang Initial
// Interview at Final Interview. Papalitan na lang ito balang araw ng totoong
// component, gaya ng ginawa na sa PDS/SRA/Assessment.
function PlaceholderStageContent({
  label,
  onSubmit,
}: {
  label: string;
  onSubmit: () => void;
}) {
  return (
    <div className="pt-3 space-y-3">
      <div
        className="flex items-start gap-2.5 rounded-xl p-4 text-sm"
        style={{ backgroundColor: T.cyanBg }}
      >
        <span style={{ color: T.navy }}>
          UI para sa <strong>{label}</strong> ay hindi pa ginagawa. Pansamantala
          munang i-click ang button sa ibaba para ituloy ang testing ng flow.
        </span>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        className="w-full py-3 font-semibold rounded-lg text-sm text-white"
        style={{ backgroundColor: T.navy }}
      >
        (Dev) Mark {label} as Submitted
      </button>
    </div>
  );
}

export default function HiringProcessFlow({
  applicantName,
}: {
  applicantName: string;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [withdrawReason, setWithdrawReason] = useState<string | null>(null);

  const handleAdvance = () =>
    setCurrentIdx((i) => Math.min(i + 1, STAGES.length - 1));
  const handleWithdraw = (reason: string) => setWithdrawReason(reason);

  if (withdrawReason) {
    return (
      <div
        className="rounded-2xl border-2 p-6 text-center space-y-2"
        style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}
      >
        <HeartHandshake className="w-8 h-8 mx-auto text-red-500" />
        <p className="text-lg font-bold text-red-800">
          Application Withdrawn
        </p>
        <p className="text-sm text-red-700">Reason: {withdrawReason}</p>
      </div>
    );
  }

  const allDone = currentIdx === STAGES.length - 1;

  return (
    <div className="space-y-4">
      {STAGES.map((stage, idx) => {
        if (idx > currentIdx) return null; // hindi pa naaabot na stage
        const isCurrent = idx === currentIdx;

        return (
          <div
            key={stage.key}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fade-slide-up"
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ backgroundColor: idx < currentIdx ? '#22C55E' : T.cyan }}
              >
                {idx + 1}
              </span>
              <h3 className="font-semibold" style={{ color: T.navy }}>
                {stage.label}
              </h3>
            </div>

            <StepGate
              stepLabel={stage.label}
              isCurrent={isCurrent}
              onAdvance={handleAdvance}
              onWithdraw={handleWithdraw}
            >
              {(markSubmitted) => {
                switch (stage.key) {
                  case 'pds':
                    return (
                      <PersonalDataSheetContent
                        isCurrent={isCurrent}
                        onSubmit={markSubmitted}
                      />
                    );
                  case 'sra':
                    return (
                      <SRAContent isCurrent={isCurrent} onSubmit={markSubmitted} />
                    );
                  case 'assessment':
                    return (
                      <AssessmentContent
                        isCurrent={isCurrent}
                        onSubmit={markSubmitted}
                      />
                    );
                  case 'background':
                    return (
                      <BackgroundCheckContent
                        isCurrent={isCurrent}
                        onSubmit={markSubmitted}
                      />
                    );
                  case 'joboffer':
                    return (
                      <JobOfferContent
                        isCurrent={isCurrent}
                        applicantName={applicantName}
                      />
                    );
                  case 'onboarding':
                    return <OnboardingContent isCurrent={isCurrent} />;
                  case 'initial_interview':
                  case 'final_interview':
                    return (
                      <PlaceholderStageContent
                        label={stage.label}
                        onSubmit={markSubmitted}
                      />
                    );
                  default:
                    return null;
                }
              }}
            </StepGate>
          </div>
        );
      })}

      {allDone && (
        <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-green-600" />
          <p className="text-lg font-bold text-green-900">
            Kumpleto na ang lahat ng stages!
          </p>
        </div>
      )}
    </div>
  );
}