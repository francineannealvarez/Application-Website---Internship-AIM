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

console.log('Found ' + allFiles.length + ' .tsx files to process.');

let totalChanges = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // 1. Remove inline style border/borderColor key-value pairs
  content = content.replace(/\s*border(Color)?:\s*'[^']*'\s*,?/g, (match) => {
    // if match ends with a comma, drop it entirely; otherwise drop it too (trailing comma cases handled by leaving prior comma alone)
    return '';
  });

  // Clean up any resulting ", }" -> " }" or ",}" -> "}" artifacts (trailing comma before closing brace is valid but let's tidy it)
  content = content.replace(/,(\s*\}\})/g, '$1');
  content = content.replace(/,(\s*\})/g, '$1');

  // 2. Remove Tailwind border utility classes inside className strings
  //    Matches: border, border-t, border-b, border-[#XXXXXX], border-[#XXXXXX]/NN, border-gray-100, etc.
  content = content.replace(/\bborder(-[\w#\[\]\/.]+)?(?![a-zA-Z])/g, '');

  // 3. Clean up extra whitespace left inside className="..." strings (collapse multiple spaces, trim edges)
  content = content.replace(/className="([^"]*)"/g, (match, classes) => {
    const cleaned = classes.replace(/\s+/g, ' ').trim();
    return 'className="' + cleaned + '"';
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
    totalChanges++;
  } else {
    console.log('No changes: ' + file);
  }
}

console.log('Total files changed: ' + totalChanges);
