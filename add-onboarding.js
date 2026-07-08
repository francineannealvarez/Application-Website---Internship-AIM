const fs = require('fs');
const dashboardPath = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(dashboardPath, 'utf8');

function build(codes) {
  return codes.map(c => String.fromCharCode(c)).join('');
}

// 0. Fix known mojibake patterns in this file too
const mojiFixes = [
  [build([0x00E2, 0x20AC, 0x201D]), String.fromCharCode(0x2014)], // em dash
  [build([0x00E2, 0x201D, 0x20AC]), String.fromCharCode(0x2500)], // box-drawing dash
];
let mojiCount = 0;
for (const [bad, good] of mojiFixes) {
  const c = content.split(bad).length - 1;
  if (c > 0) { content = content.split(bad).join(good); mojiCount += c; }
}
console.log('Mojibake fixes in dashboard/page.tsx: ' + mojiCount);

// 1. Update StepKey type to include 'onboarding'
const oldType = `type StepKey = 'initial' | 'pds' | 'sri' | 'assessment' | 'background' | 'department' | 'requirements';`;
const newType = `type StepKey = 'initial' | 'pds' | 'sri' | 'assessment' | 'background' | 'department' | 'requirements' | 'onboarding';`;
if (!content.includes(oldType)) {
  console.log('ERROR: StepKey type not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldType, newType);

// 2. Add onboarding entry to buildHiringSteps push list
const oldPush = `  steps.push(
    { key: 'assessment', label: 'Assessment', sublabel: 'Aptitude & Personality', Icon: PenLine },
    { key: 'background', label: 'Character & Background Check', sublabel: 'Authorization Form', Icon: Shield },
    { key: 'department', label: 'Interview', sublabel: 'With Department Head', Icon: Users },
    { key: 'requirements', label: 'Requirements', sublabel: 'Document Submission', Icon: ClipboardCheck },
  );`;
const newPush = `  steps.push(
    { key: 'assessment', label: 'Assessment', sublabel: 'Aptitude & Personality', Icon: PenLine },
    { key: 'background', label: 'Character & Background Check', sublabel: 'Authorization Form', Icon: Shield },
    { key: 'department', label: 'Interview', sublabel: 'With Department Head', Icon: Users },
    { key: 'requirements', label: 'Requirements', sublabel: 'Document Submission', Icon: ClipboardCheck },
    { key: 'onboarding', label: 'Onboarding', sublabel: 'Welcome to Arvin!', Icon: Sparkles },
  );`;
if (!content.includes(oldPush)) {
  console.log('ERROR: buildHiringSteps push block not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldPush, newPush);

// 3. Add import for OnboardingContent (right after BackgroundCheckContent import)
const oldImport = `import BackgroundCheckContent from '@/components/dashboard/BackgroundCheckContent';`;
const newImport = `import BackgroundCheckContent from '@/components/dashboard/BackgroundCheckContent';
import OnboardingContent from '@/components/dashboard/OnboardingContent';`;
if (!content.includes(oldImport)) {
  console.log('ERROR: BackgroundCheckContent import not found. Aborting.');
  process.exit(1);
}
content = content.replace(oldImport, newImport);

// 4. Update the render branch: explicit 'requirements' check + new 'onboarding' branch
const oldBranch = `                  ) : step.key === 'department' ? (
                    <StepDetailContent stepIdx={1} isCurrent={isCurrent} />
                  ) : (
                    <RequirementsContent docStatuses={docStatuses} isCurrent={isCurrent} />
                  )}`;
const newBranch = `                  ) : step.key === 'department' ? (
                    <StepDetailContent stepIdx={1} isCurrent={isCurrent} />
                  ) : step.key === 'requirements' ? (
                    <RequirementsContent docStatuses={docStatuses} isCurrent={isCurrent} />
                  ) : (
                    <OnboardingContent isCurrent={isCurrent} />
                  )}`;
if (!content.includes(oldBranch)) {
  console.log('ERROR: render branch block not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldBranch, newBranch);

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('SUCCESS: dashboard/page.tsx updated with Onboarding step.');

// 5. Create the OnboardingContent component file
const onboardingContent = `'use client';

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
        style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}
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
          Arvin International Marketing Inc. \u2014 18th Floor, Y Tower Building, Corner Coral Way St., Macapagal
          Ave., Brgy. 76, Pasay City
        </span>
      </div>

      <div className="rounded-xl p-4" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC' }}>
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
          style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC', color: '#6B7A8D' }}
        >
          <PartyPopper className="w-4 h-4 shrink-0" style={{ color: '#9BAAB8' }} />
          <span>We look forward to seeing you on your first day!</span>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/dashboard/OnboardingContent.tsx', onboardingContent, 'utf8');
console.log('SUCCESS: Created src/components/dashboard/OnboardingContent.tsx');
