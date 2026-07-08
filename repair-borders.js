const fs = require('fs');
const path = require('path');

function findTsxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const targetDirs = ['src/app/dashboard', 'src/components/dashboard'];
let allFiles = [];
for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(findTsxFiles(dir));
  }
}

console.log('Scanning ' + allFiles.length + ' .tsx files for repair...');

let totalFixed = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Pattern A: orphaned ": `1px solid ${T.xxx}`" left after the "border" key name was stripped.
  // Handle case where it's followed by more properties (trailing comma to eat)
  content = content.replace(/:\s*`1px solid \$\{T\.\w+\}`\s*,\s*/g, '');
  // Handle case where it's the last property (leading comma to eat)
  content = content.replace(/,\s*:\s*`1px solid \$\{T\.\w+\}`/g, '');
  // Handle case where it was the only property left
  content = content.replace(/:\s*`1px solid \$\{T\.\w+\}`/g, '');

  // Also handle single-quoted variants just in case: ': "1px solid ${T.xxx}"' style (less likely but safe)
  content = content.replace(/:\s*'1px solid \$\{T\.\w+\}'\s*,\s*/g, '');
  content = content.replace(/,\s*:\s*'1px solid \$\{T\.\w+\}'/g, '');
  content = content.replace(/:\s*'1px solid \$\{T\.\w+\}'/g, '');

  // Pattern B: "keyName: T.," left after a T.xxx token had its "xxx" (e.g. "border", "cyanBorder") stripped.
  // Remove the whole broken property, whichever key name preceded it (borderColor, border, etc.)
  content = content.replace(/\b(\w+):\s*T\.\s*,\s*/g, '');
  content = content.replace(/,\s*\b(\w+):\s*T\.\s*(?=[,}])/g, '');
  content = content.replace(/\{\s*(\w+):\s*T\.\s*\}/g, '{}');

  // Clean up any resulting stray trailing commas before closing braces
  content = content.replace(/,(\s*\}\})/g, '$1');
  content = content.replace(/,(\s*\})/g, '$1');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Repaired: ' + file);
    totalFixed++;
  }
}

console.log('Total files repaired: ' + totalFixed);
