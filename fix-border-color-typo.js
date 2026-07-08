const fs = require('fs');

const files = [
  'src/components/dashboard/AssessmentContent.tsx',
  'src/components/dashboard/BackgroundCheckContent.tsx',
];

let totalFixed = 0;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('SKIP (not found): ' + file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Fix the exact orphaned "border color:" text left over from an earlier partial edit.
  content = content.replace(/,\s*border\s+color:/g, ', color:');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed: ' + file);
    totalFixed++;
  } else {
    console.log('No matching broken text found in: ' + file);
  }
}

console.log('Total files fixed: ' + totalFixed);
