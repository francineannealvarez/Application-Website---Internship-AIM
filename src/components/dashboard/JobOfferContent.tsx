'use client';

import { User, Calendar, Clock, Banknote, Gift } from 'lucide-react';

export default function JobOfferContent({
  isCurrent,
  applicantName,
}: {
  isCurrent: boolean;
  applicantName: string;
}) {
  return (
    <div className="space-y-4 pt-3">
      <div
        className="rounded-xl p-5 flex items-start gap-3"
        style={{ backgroundColor: '#EEF9FB' }}
      >
        <Gift className="w-6 h-6 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
        <div>
          <p className="text-base font-bold" style={{ color: '#0B2A4A' }}>
            Congratulations, you have a job offer!
          </p>
          <p className="text-sm mt-1" style={{ color: '#6B7A8D' }}>
            Please review the offer details below. HR will reach out to walk you through the next
            steps and answer any questions you may have.
          </p>
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#F7F9FA' }}>
        <div className="flex items-center gap-2.5 text-sm">
          <User className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
          <span style={{ color: '#0B2A4A' }}>
            <span className="font-semibold">Name:</span> {applicantName}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Calendar className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
          <span style={{ color: '#0B2A4A' }}>
            <span className="font-semibold">Date Offered:</span> July 8, 2026
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Clock className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
          <span style={{ color: '#0B2A4A' }}>
            <span className="font-semibold">Start Date:</span> July 27, 2026
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Banknote className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
          <span style={{ color: '#0B2A4A' }}>
            <span className="font-semibold">Salary Offered:</span> PHP 60,000 - 75,000 / month
          </span>
        </div>
      </div>

      {isCurrent && (
        <div
          className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm"
          style={{ backgroundColor: '#F7F9FA', color: '#6B7A8D' }}
        >
          <Clock className="w-4 h-4 shrink-0" style={{ color: '#9BAAB8' }} />
          <span>Please confirm your acceptance with HR to proceed to the next step.</span>
        </div>
      )}
    </div>
  );
}
