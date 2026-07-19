'use client';

import { useState } from 'react';
import { User, Calendar, Clock, Banknote, Gift, Check, X } from 'lucide-react';

export default function JobOfferContent({
  isCurrent,
  applicantName,
  applicationId,
  onAccept,
  onDecline,
}: {
  isCurrent: boolean;
  applicantName: string;
  applicationId: string | null;
  onAccept: () => void;
  onDecline: (reason: string) => void;
}) {
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!applicationId) {
      setErrorMsg('No application found. Please refresh the page.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/job-offer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: 'accepted' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error || 'Failed to submit. Please try again.');
        setSubmitting(false);
        return;
      }
      onAccept();
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  const handleConfirmDecline = async () => {
    if (!applicationId) {
      setErrorMsg('No application found. Please refresh the page.');
      return;
    }
    const reason = declineReason.trim() || 'No reason provided';
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/job-offer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: 'declined', reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error || 'Failed to submit. Please try again.');
        setSubmitting(false);
        return;
      }
      onDecline(reason);
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
      setSubmitting(false);
    }
  };

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

      {errorMsg && (
        <div className="rounded-xl p-3 text-sm text-red-800" style={{ backgroundColor: '#FEF2F2' }}>
          {errorMsg}
        </div>
      )}

      {isCurrent && !showDeclineForm && (
        <div className="space-y-3">
          <div
            className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm"
            style={{ backgroundColor: '#F7F9FA', color: '#6B7A8D' }}
          >
            <Clock className="w-4 h-4 shrink-0" style={{ color: '#9BAAB8' }} />
            <span>Please confirm your acceptance with HR to proceed to the next step.</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAccept}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-lg text-sm text-white disabled:opacity-60"
              style={{ backgroundColor: '#0B2A4A' }}
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Accept Offer'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeclineForm(true)}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-lg text-sm border disabled:opacity-60"
              style={{ borderColor: '#E5E9EC', color: '#6B7A8D' }}
            >
              <X className="w-4 h-4" />
              Decline Offer
            </button>
          </div>
        </div>
      )}

      {isCurrent && showDeclineForm && (
        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: '#FEF2F2' }}>
          <p className="text-sm font-semibold text-red-800">
            Please tell us why you're declining this offer:
          </p>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={3}
            placeholder="Reason for declining (optional)"
            className="w-full rounded-lg border p-2.5 text-sm"
            style={{ borderColor: '#FCA5A5' }}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowDeclineForm(false)}
              disabled={submitting}
              className="flex-1 py-2.5 font-semibold rounded-lg text-sm border disabled:opacity-60"
              style={{ borderColor: '#E5E9EC', color: '#6B7A8D' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDecline}
              disabled={submitting}
              className="flex-1 py-2.5 font-semibold rounded-lg text-sm text-white bg-red-600 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Confirm Decline'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}