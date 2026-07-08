const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = content.split('\n');

function dump(lineNum, label) {
  const line = lines[lineNum - 1];
  console.log('--- ' + label + ' (line ' + lineNum + ') ---');
  console.log('Text: ' + line.trim().slice(0, 60));
  const codes = [];
  for (let i = 0; i < line.length; i++) {
    codes.push(line.charCodeAt(i).toString(16));
  }
  console.log('Codes: ' + codes.join(' '));
  console.log('');
}

dump(14, 'DATA comment (box-drawing)');
dump(866, 'Diamond in ticker');
