const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Banknote to lucide-react icon imports
const oldIconImport = `  LogOut, Building2, User, Check
} from 'lucide-react';`;
const newIconImport = `  LogOut, Building2, User, Check, Banknote
} from 'lucide-react';`;
if (!content.includes(oldIconImport)) {
  console.log('ERROR: icon import block not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldIconImport, newIconImport);
console.log('Added Banknote icon import.');

// 2. Add import for JobOfferContent
const oldImport = `import SRAContent from '@/components/dashboard/SRAContent';`;
if (!content.includes(oldImport)) {
  console.log('ERROR: SRAContent import not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldImport, oldImport + `\nimport JobOfferContent from '@/components/dashboard/JobOfferContent';`);
console.log('Added JobOfferContent import.');

// 3. Insert new step between 'background' and 'requirements' in buildHiringSteps
const oldSteps = `    { key: 'background', label: 'Character & Background Check', sublabel: 'Authorization Form', Icon: Shield },
    { key: 'requirements', label: 'Requirements', sublabel: 'Document Submission', Icon: ClipboardCheck },`;
const newSteps = `    { key: 'background', label: 'Character & Background Check', sublabel: 'Authorization Form', Icon: Shield },
    { key: 'joboffer', label: 'Job Offer', sublabel: 'Offer Details', Icon: Banknote },
    { key: 'requirements', label: 'Requirements', sublabel: 'Document Submission', Icon: ClipboardCheck },`;
if (!content.includes(oldSteps)) {
  console.log('ERROR: steps push block not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldSteps, newSteps);
console.log('Inserted Job Offer step between Character Check and Requirements.');

// 4. Add 'joboffer' to StepKey type
const oldType = `type StepKey = 'initial' | 'pds' | 'sri' | 'assessment' | 'background' | 'department' | 'requirements' | 'onboarding';`;
const newType = `type StepKey = 'initial' | 'pds' | 'sri' | 'assessment' | 'background' | 'department' | 'joboffer' | 'requirements' | 'onboarding';`;
if (!content.includes(oldType)) {
  console.log('ERROR: StepKey type not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldType, newType);
console.log('Updated StepKey type.');

// 5. Add content-mapping branch for 'joboffer', and pass applicantName to JobOfferContent
const oldBranch = `                ) : step.key === 'requirements' ? (
                  <RequirementsContent docStatuses={docStatuses} docFiles={docFiles} onDocUpload={onDocUpload} isCurrent={isCurrent} />
                ) : (
                  <OnboardingContent isCurrent={isCurrent} />
                )}`;
const newBranch = `                ) : step.key === 'joboffer' ? (
                  <JobOfferContent isCurrent={isCurrent} applicantName={applicantName} />
                ) : step.key === 'requirements' ? (
                  <RequirementsContent docStatuses={docStatuses} docFiles={docFiles} onDocUpload={onDocUpload} isCurrent={isCurrent} />
                ) : (
                  <OnboardingContent isCurrent={isCurrent} />
                )}`;
if (!content.includes(oldBranch)) {
  console.log('ERROR: content-mapping branch not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldBranch, newBranch);
console.log('Wired Job Offer content into the step-detail mapping.');

// 6. Add applicantName prop to HiringProcessCard's function signature
const oldSig = `function HiringProcessCard({ steps, completedSteps, docStatuses, docFiles, onDocUpload, onSimulateHrComplete }: { steps: ReturnType<typeof buildHiringSteps>; completedSteps: number; docStatuses: DocStatus[]; docFiles: (StoredReqFile | null)[]; onDocUpload: (idx: number, file: StoredReqFile | null) => void; onSimulateHrComplete: () => void; }) {`;
const newSig = `function HiringProcessCard({ steps, completedSteps, docStatuses, docFiles, onDocUpload, onSimulateHrComplete, applicantName }: { steps: ReturnType<typeof buildHiringSteps>; completedSteps: number; docStatuses: DocStatus[]; docFiles: (StoredReqFile | null)[]; onDocUpload: (idx: number, file: StoredReqFile | null) => void; onSimulateHrComplete: () => void; applicantName: string; }) {`;
if (content.includes(oldSig)) {
  content = content.replace(oldSig, newSig);
  console.log('Updated HiringProcessCard signature with applicantName.');
} else {
  console.log('WARNING: HiringProcessCard signature did not match expected pattern exactly. Will try a looser fix next.');
  // Fallback: looser match just on the function declaration line + prop type closing, done via regex on the function header only
  const headerRegex = /function HiringProcessCard\(\{ steps, completedSteps, docStatuses, docFiles, onDocUpload, onSimulateHrComplete \}: \{([^}]*)\}\) \{/;
  const m = content.match(headerRegex);
  if (m) {
    const propsType = m[1];
    const replacement = `function HiringProcessCard({ steps, completedSteps, docStatuses, docFiles, onDocUpload, onSimulateHrComplete, applicantName }: {${propsType} applicantName: string; }) {`;
    content = content.replace(m[0], replacement);
    console.log('Applied fallback fix to HiringProcessCard signature.');
  } else {
    console.log('ERROR: could not locate HiringProcessCard signature at all. Please share the exact current signature.');
  }
}

// 7. Pass applicantName at the HiringProcessCard call site
const oldCall = `<HiringProcessCard key={hiringCompletedSteps} steps={steps} completedSteps={hiringCompletedSteps}`;
if (content.includes(oldCall)) {
  // find the full call line to append the prop right before the closing />
  const callLineRegex = /(<HiringProcessCard key=\{hiringCompletedSteps\}[^]*?)\/>/;
  const callMatch = content.match(callLineRegex);
  if (callMatch) {
    const newCall = callMatch[1] + `applicantName={name} />`;
    content = content.replace(callMatch[0], newCall);
    console.log('Passed applicantName prop at HiringProcessCard call site.');
  } else {
    console.log('WARNING: could not locate the full HiringProcessCard call site to append applicantName.');
  }
} else {
  console.log('WARNING: HiringProcessCard call site not found as expected.');
}

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS: File written.');
