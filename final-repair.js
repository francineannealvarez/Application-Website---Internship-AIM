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

console.log('Scanning ' + allFiles.length + ' .tsx files for final repair...');

let totalFixed = 0;

// Value can be: a backtick template literal (may contain { } internally),
// or any run of characters that isn't a comma/brace/backtick (covers literals, ternaries, T.xxx tokens, broken remnants).
const valuePattern = '(?:`[^`]*`|[^,{}`]+)';
// Covers: border, borderColor, borderTop, borderBottom, borderLeft, borderRight
const keyPattern = 'border(?:Color|Top|Bottom|Left|Right)?';

let repairLog = [];

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Fix any orphaned ": `...`" (key already stripped, value remains) BEFORE the general pass
  content = content.replace(/,\s*:\s*`[^`]*`/g, '');
  content = content.replace(/:\s*`[^`]*`\s*,/g, '');
  content = content.replace(/\{\{\s*:\s*`[^`]*`\s*\}\}/g, '{{}}');

  // General sweep: remove any border-family property wholesale, whatever its value looks like.
  const propRegex = new RegExp('\\b' + keyPattern + '\\s*:\\s*' + valuePattern + '\\s*,?', 'g');
  content = content.replace(propRegex, '');

  // Clean up stray trailing commas before closing braces
  content = content.replace(/,(\s*\}\})/g, '$1');
  content = content.replace(/,(\s*\})/g, '$1');
  // Clean up a leading comma right after an opening brace
  content = content.replace(/(\{\{?)\s*,\s*/g, '$1 ');
  content = content.replace(/(\{\{?)\s*,/g, '$1');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Repaired: ' + file);
    repairLog.push(file);
    totalFixed++;
  }
}

console.log('Total files repaired: ' + totalFixed);
if (totalFixed === 0) {
  console.log('No changes were needed - files already clean.');
}
