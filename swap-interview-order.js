const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Swap the order of 'background' and 'department' steps, and rename 'Interview' -> 'Final Interview'
const oldSteps = `    { key: 'background', label: 'Character & Background Check', sublabel: 'Authorization Form', Icon: Shield },
    { key: 'department', label: 'Interview', sublabel: 'With Department Head', Icon: Users },`;
const newSteps = `    { key: 'department', label: 'Final Interview', sublabel: 'With Department Head', Icon: Users },
    { key: 'background', label: 'Character & Background Check', sublabel: 'Authorization Form', Icon: Shield },`;

if (!content.includes(oldSteps)) {
  console.log('ERROR: step order block not found as expected. Aborting without changes.');
  process.exit(1);
}
content = content.replace(oldSteps, newSteps);
console.log('Swapped step order and renamed to Final Interview.');

// 2. Update the ProceedModal descriptive paragraph to match the new order and new label
const oldParagraph = `<strong className="text-[#0B2A4A]">Character & Background Check</strong>, <strong className="text-[#0B2A4A]">Interview</strong>, and <strong className="text-[#0B2A4A]">Requirements</strong> submission.`;
const newParagraph = `<strong className="text-[#0B2A4A]">Final Interview</strong>, <strong className="text-[#0B2A4A]">Character & Background Check</strong>, and <strong className="text-[#0B2A4A]">Requirements</strong> submission.`;

if (!content.includes(oldParagraph)) {
  console.log('WARNING: ProceedModal paragraph not found as expected. Step-order change was still applied, but the modal text was not updated. Please check manually.');
} else {
  content = content.replace(oldParagraph, newParagraph);
  console.log('Updated ProceedModal paragraph to match new order.');
}

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS: File written.');
