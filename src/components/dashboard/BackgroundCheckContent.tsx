'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, Clock, Upload, X, ShieldCheck } from 'lucide-react';
import { readDemoApplication } from '@/lib/demo-session';

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

const selectCls = 'px-3 py-2.5 text-sm rounded-lg border outline-none transition-colors focus:border-[#12B6D6]';
const selectStyle: React.CSSProperties = { backgroundColor: '#F7F9FA',  color: '#0B2A4A' };

export default function BackgroundCheckContent({ isCurrent, onSubmit }: { isCurrent: boolean; onSubmit: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [dateSigned, setDateSigned] = useState('');
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const app = readDemoApplication();
    if (app) {
      if (app.fullName) setFullName(app.fullName);
      if (app.positionTitle) setPosition(app.positionTitle);
    }
  }, []);

  const handleFile = (file: File) => {
    setSignatureFile(file);
    const reader = new FileReader();
    reader.onload = () => setSignaturePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const canSubmit = Boolean(dateSigned && signatureFile);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    onSubmit();
  };

  if (submitted) {
    return (
      <div className="pt-3">
        <div className="flex items-start gap-2.5 rounded-xl p-4 text-sm" style={{ backgroundColor: T.cyanBg }}>
          <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.cyan }} />
          <span style={{ color: T.navy }}>
            Authorization form submitted. You&apos;ve automatically moved forward to the Department Interview stage.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 space-y-4">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.cyanBg }}>
          <ShieldCheck className="w-4 h-4" style={{ color: T.cyan }} />
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: T.navy }}>Character and Background Check Authorization Form</div>
        </div>
      </div>

      <div className="rounded-xl p-5 space-y-4 text-sm leading-relaxed text-justify" style={{ backgroundColor: T.bg, color: T.navy }}>
        <p>
          This is to authorize Arvin International Marketing Inc. to conduct a reference check with my present and/or previous employer(s) and
          character references relative to my application in{' '}
          <span className="font-bold underline">{position || '_________________________'}</span> position under Arvin International Marketing Inc.
        </p>
        <p>
          I understand that information may include, but is not limited to, my employment performance, professional demeanor, and rehire
          potential, dates of employment, salary, and employment history.
        </p>
        <p>
          This further authorizes my former or current employers and references to release information regarding my employment record with
          their companies and to provide any additional information that may be necessary to support my application for employment in Arvin
          International Marketing Inc.
        </p>
        <p>
          I knowingly and voluntarily release all former and current employers, references, and the Company from any and all liability arising
          from their giving or receiving information about my employment history, my academic credentials or qualifications, and my suitability
          for employment with Arvin International Marketing Inc.
        </p>
        <p>
          If my application for employment in Arvin International Marketing Inc., will be accepted, any information in my 201 files which may be
          requested by any external party will be released only with my consent as an exercise of my basic right as an employee.
        </p>
        <p>
          I am fully aware that any misrepresentation in the information I have provided to Arvin International Marketing Inc. will be a ground
          for non-acceptance of my application for employment or will be a basis for my dismissal from service in case I will be employed.
        </p>
        <p>
          This form may be scanned, photocopied, or reproduced as a facsimile, and these copies will be as effective as a release or consent as
          the original which I signed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 pt-4 pb-2">
        <div className="text-center">
          <div className="font-bold underline text-sm mb-1" style={{ color: T.navy }}>{fullName || 'Your printed name'}</div>
          <div className="text-xs" style={{ color: T.gray }}>SIGNATURE OVER PRINTED NAME</div>
        </div>
        <div className="text-center">
          <input type="date" value={dateSigned} onChange={(e) => setDateSigned(e.target.value)}
            className={selectCls + ' mb-1'} style={selectStyle} />
          <div className="text-xs" style={{ color: T.gray }}>DATE SIGNED</div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: T.navy }}>E-Signature</label>
        {signaturePreview ? (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: T.bg }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signaturePreview} alt="E-signature preview" className="h-16 object-contain bg-white rounded" style={{ }} />
            <div className="flex-1 min-w-0 text-xs" style={{ color: T.gray }}>{signatureFile?.name}</div>
            <button type="button" onClick={() => { setSignatureFile(null); setSignaturePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="p-1.5 rounded-lg hover:bg-black/5 shrink-0">
              <X className="w-4 h-4" style={{ color: T.gray }} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-1.5 py-6 rounded-xl border-2 border-dashed hover:bg-black/[0.02] transition-colors"
            style={{ }}>
            <Upload className="w-5 h-5" style={{ color: T.faint }} />
            <span className="text-xs font-medium" style={{ color: T.gray }}>Upload a photo of your signature</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      {!canSubmit && (
        <div className="rounded-xl p-3.5 text-xs" style={{ backgroundColor: '#FFF1F2',  color: '#9F1239' }}>
          Please select the date signed and upload your e-signature before submitting.
        </div>
      )}

      <button type="button" onClick={handleSubmit} disabled={!canSubmit}
        className="w-full py-3 font-semibold rounded-lg transition-all duration-200 text-sm shadow-sm"
        style={canSubmit
          ? { backgroundColor: T.navy, color: '#fff', cursor: 'pointer' }
          : { backgroundColor: T.locked, color: T.gray, cursor: 'not-allowed' }}>
        Submit Authorization Form
      </button>

      {isCurrent && (
        <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: T.bg, color: T.gray }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: T.faint }} />
          <span>Once submitted, you&apos;ll automatically move forward to the Department Interview stage.</span>
        </div>
      )}
    </div>
  );
}
