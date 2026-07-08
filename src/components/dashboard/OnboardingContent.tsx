'use client';

import { PartyPopper, Calendar, MapPin, ClipboardList, CheckCircle2 } from 'lucide-react';

const ONBOARDING_ITEMS = [
  'Valid government-issued ID (original and photocopy)',
  '2x2 ID pictures (2 copies, white background)',
  'Bank account details for payroll enrollment',
  'Signed employment contract (provided on-site)',
];

export default function OnboardingContent({ isCurrent }: { isCurrent: boolean }) {
  return (
    <div className="space-y-4 pt-3">
      <div
        className="rounded-xl p-5 flex items-start gap-3"
        style={{ backgroundColor: '#EEF9FB'}}
      >
        <PartyPopper className="w-6 h-6 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
        <div>
          <p className="text-base font-bold" style={{ color: '#0B2A4A' }}>
            Welcome to the Arvin Family!
          </p>
          <p className="text-sm mt-1" style={{ color: '#6B7A8D' }}>
            Congratulations on completing the hiring process! We are excited to have you join our team. Please see
            your onboarding and orientation details below.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-sm text-[#0B2A4A]">
        <Calendar className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
        <span>
          <span className="font-semibold">Orientation Date:</span>{' '}
          <span style={{ color: '#6B7A8D' }}>August 4, 2026 at 8:00 AM</span>
        </span>
      </div>

      <div className="flex items-start gap-2.5 text-sm text-[#0B2A4A]">
        <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
        <span style={{ color: '#6B7A8D' }}>
          Arvin International Marketing Inc. — 18th Floor, Y Tower Building, Corner Coral Way St., Macapagal
          Ave., Brgy. 76, Pasay City
        </span>
      </div>

      <div className="rounded-xl p-4" style={{ backgroundColor: '#F7F9FA'}}>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
          <p className="text-sm font-semibold" style={{ color: '#0B2A4A' }}>
            What to Bring on Orientation Day
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {ONBOARDING_ITEMS.map((item) => (
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
