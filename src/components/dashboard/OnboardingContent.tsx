'use client';
import { PartyPopper, Calendar, MapPin, ClipboardList, CheckCircle2 } from 'lucide-react';

const DEFAULT_ADDRESS =
  'Arvin International Marketing Inc. — 18th Floor, Y Tower Building, Corner Coral Way St., Macapagal Ave., Brgy. 76, Pasay City';

const DEFAULT_ONBOARDING_ITEMS = [
  'Valid government-issued ID (original and photocopy)',
  '2x2 ID pictures (2 copies, white background)',
  'Bank account details for payroll enrollment',
  'Signed employment contract (provided on-site)',
];

function formatOrientationDate(dateValue?: string | Date | null): string | null {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// `onboarding_what_to_bring` is stored as a plain text column (not jsonb),
// so HR enters it as one item per line. Falls back to the default
// checklist if HR hasn't filled this in yet for the applicant.
function parseChecklist(raw?: string | null): string[] {
  if (!raw || !raw.trim()) return DEFAULT_ONBOARDING_ITEMS;
  const items = raw
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
  return items.length > 0 ? items : DEFAULT_ONBOARDING_ITEMS;
}

export default function OnboardingContent({
  isCurrent,
  applicantName,
  positionTitle,
  startDate,
  onboardingAddress,
  onboardingWhatToBring,
}: {
  isCurrent: boolean;
  applicantName?: string;
  positionTitle?: string;
  startDate?: string | Date | null;
  onboardingAddress?: string | null;
  onboardingWhatToBring?: string | null;
}) {
  const firstName = applicantName ? applicantName.split(' ')[0] : null;
  const displayDate = formatOrientationDate(startDate);
  const displayAddress = onboardingAddress && onboardingAddress.trim() ? onboardingAddress : DEFAULT_ADDRESS;
  const checklist = parseChecklist(onboardingWhatToBring);

  return (
    <div className="space-y-4 pt-3">
      <div
        className="rounded-xl p-5 flex items-start gap-3"
        style={{ backgroundColor: '#EEF9FB'}}
      >
        <PartyPopper className="w-6 h-6 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
        <div>
          <p className="text-base font-bold" style={{ color: '#0B2A4A' }}>
            {firstName ? `Welcome to the Arvin Family, ${firstName}!` : 'Welcome to the Arvin Family!'}
          </p>
          <p className="text-sm mt-1" style={{ color: '#6B7A8D' }}>
            Congratulations on completing the hiring process{positionTitle ? ` for the ${positionTitle} role` : ''}!
            We are excited to have you join our team. Please see your onboarding and orientation details below.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 text-sm text-[#0B2A4A]">
        <Calendar className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
        <span>
          <span className="font-semibold">Orientation / Start Date:</span>{' '}
          {displayDate ? (
            <span style={{ color: '#6B7A8D' }}>{displayDate}</span>
          ) : (
            <span style={{ color: '#6B7A8D' }}>To be confirmed by HR</span>
          )}
        </span>
      </div>
      <div className="flex items-start gap-2.5 text-sm text-[#0B2A4A]">
        <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
        <span style={{ color: '#6B7A8D' }}>{displayAddress}</span>
      </div>
      <div className="rounded-xl p-4" style={{ backgroundColor: '#F7F9FA'}}>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
          <p className="text-sm font-semibold" style={{ color: '#0B2A4A' }}>
            What to Bring on Orientation Day
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: '#6B7A8D' }}>
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {isCurrent && (
        <div
          className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm"
          style={{ backgroundColor: '#F7F9FA', color: '#6B7A8D' }}
        >
          <PartyPopper className="w-4 h-4 shrink-0" style={{ color: '#9BAAB8' }} />
          <span>We look forward to seeing you on your first day!</span>
        </div>
      )}
    </div>
  );
}