const fs = require('fs');
const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

function build(codes) {
  return codes.map(c => String.fromCharCode(c)).join('');
}

// Known mojibake sequences (UTF-8 bytes misread as Windows-1252) -> correct character
const fixes = [
  [build([0x00E2, 0x20AC, 0x2122]), String.fromCharCode(0x2019)], // right single quote '
  [build([0x00E2, 0x20AC, 0x0153]), String.fromCharCode(0x201C)], // left double quote "
  [build([0x00E2, 0x20AC, 0x201D]), String.fromCharCode(0x2014)], // em dash
  [build([0x00E2, 0x20AC, 0x201C]), String.fromCharCode(0x2013)], // en dash
  [build([0x00E2, 0x20AC, 0x00A6]), String.fromCharCode(0x2026)], // ellipsis
  [build([0x00C2, 0x00B7]), String.fromCharCode(0x00B7)],          // middle dot
  [build([0x00C2, 0x00A9]), String.fromCharCode(0x00A9)],          // copyright
  [build([0x00C2, 0x00AE]), String.fromCharCode(0x00AE)],          // registered trademark
  [build([0x00E2, 0x2014, 0x2020]), String.fromCharCode(0x25C6)],  // diamond (ticker)
  [build([0x00E2, 0x201D, 0x20AC]), String.fromCharCode(0x2500)],  // box-drawing dash (comments)
];

let totalReplacements = 0;
for (const [bad, good] of fixes) {
  const count = content.split(bad).length - 1;
  if (count > 0) {
    content = content.split(bad).join(good);
    console.log('Fixed ' + count + ' occurrence(s) of pattern (codes: ' + [...bad].map(c => c.charCodeAt(0).toString(16)).join(',') + ')');
    totalReplacements += count;
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Total fixes applied: ' + totalReplacements);

// Final scan: report any remaining suspicious high-byte characters for manual review
const lines = content.split('\n');
const suspiciousChars = [0x00E2, 0x00C2, 0x0178, 0x2018, 0x0152, 0x0153];
let foundAny = false;
lines.forEach((line, idx) => {
  for (const code of suspiciousChars) {
    if (line.includes(String.fromCharCode(code))) {
      console.log('REVIEW line ' + (idx + 1) + ': ' + line.trim().slice(0, 120));
      foundAny = true;
      break;
    }
  }
});
if (!foundAny) {
  console.log('No remaining suspicious mojibake characters found.');
}
