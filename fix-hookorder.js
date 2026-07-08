const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `function StepDetailContent({ stepIdx, isCurrent }: { stepIdx: number; isCurrent: boolean }) {
  const detail = STEP_DETAILS[stepIdx];
  if (!detail) return null;
  const stepKey = stepIdx === 0 ? 'initial-interview' : 'department-interview';
  const [schedule] = useState<StepSchedule | null>(() => (typeof window !== 'undefined' ? readStepSchedule(stepKey) : null));
  const displayDate = schedule?.date ?? detail.date;
  const displayTime = schedule?.time ?? detail.time;`;

const newBlock = `function StepDetailContent({ stepIdx, isCurrent }: { stepIdx: number; isCurrent: boolean }) {
  const detail = STEP_DETAILS[stepIdx];
  const stepKey = stepIdx === 0 ? 'initial-interview' : 'department-interview';
  const [schedule] = useState<StepSchedule | null>(() => (typeof window !== 'undefined' ? readStepSchedule(stepKey) : null));
  if (!detail) return null;
  const displayDate = schedule?.date ?? detail.date;
  const displayTime = schedule?.time ?? detail.time;`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS: useState now called before the early return.');
} else {
  console.log('WARNING: exact block not found. No changes made.');
}
