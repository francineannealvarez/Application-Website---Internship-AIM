const fs = require('fs');
const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix mojibake middle dot (A-circumflex + middle-dot mojibake -> real middle dot)
const mojiDot = '\u00C2\u00B7';
content = content.split(mojiDot).join('\u00B7');

// 2. Find the "About the Role" div block and the Offer box block, then swap their order,
//    and replace hardcoded offer text with dynamic job.* values (with fallback).

// Locate "About the Role" and walk back to find its enclosing opening <div>
const aboutMarker = 'About the Role';
const aboutMarkerIdx = content.indexOf(aboutMarker);
if (aboutMarkerIdx === -1) {
  console.log('ERROR: "About the Role" text not found. No changes made.');
  process.exit(1);
}
const aboutDivStart = content.lastIndexOf('<div>', aboutMarkerIdx);
if (aboutDivStart === -1) {
  console.log('ERROR: could not find enclosing <div> before "About the Role". No changes made.');
  process.exit(1);
}

// Locate "Competitive, based on experience and qualifications" then find the two closing </div> after it
const salaryMarker = 'Competitive, based on experience and qualifications';
const salaryMarkerIdx = content.indexOf(salaryMarker, aboutDivStart);
if (salaryMarkerIdx === -1) {
  console.log('ERROR: salary fallback text not found. No changes made.');
  process.exit(1);
}
// find first </div> after salaryMarkerIdx (closes the inner <div className="flex items-center...">)
const firstCloseIdx = content.indexOf('</div>', salaryMarkerIdx);
// find second </div> after that (closes the outer offer box <div className="rounded-xl...">)
const secondCloseIdx = content.indexOf('</div>', firstCloseIdx + 6);
const offerBoxEnd = secondCloseIdx + '</div>'.length;

// The full chunk we will replace: from aboutDivStart to offerBoxEnd
const fullChunk = content.slice(aboutDivStart, offerBoxEnd);

// Within fullChunk, find where the offer box starts (its own opening <div className="rounded-xl...)
const offerBoxStartMarkerInChunk = fullChunk.indexOf('<div className="rounded-xl p-4 space-y-2.5"');
if (offerBoxStartMarkerInChunk === -1) {
  console.log('ERROR: could not find offer box start within chunk. No changes made.');
  process.exit(1);
}

const aboutPart = fullChunk.slice(0, offerBoxStartMarkerInChunk);
let offerPart = fullChunk.slice(offerBoxStartMarkerInChunk);

// Replace hardcoded text with dynamic job.* values (with fallback to the same generic text)
offerPart = offerPart.replace(
  'To be provided upon final approval',
  "{job.dateOffered || 'To be provided upon final approval'}"
);
offerPart = offerPart.replace(
  'To be discussed upon offer acceptance',
  "{job.startDate || 'To be discussed upon offer acceptance'}"
);
offerPart = offerPart.replace(
  'Competitive, based on experience and qualifications',
  "{job.salaryOffered || 'Competitive, based on experience and qualifications'}"
);

// Reassemble: offer box first, then About the Role
const newChunk = offerPart + '\n          ' + aboutPart.replace(/\s+$/, '') + '\n';

content = content.slice(0, aboutDivStart) + newChunk + content.slice(offerBoxEnd);

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS: Offer box moved above About the Role, now using dynamic mock data. Mojibake dot fixed.');
