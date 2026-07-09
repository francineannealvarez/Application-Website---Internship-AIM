const fs = require('fs');
const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove fields from the Job type definition
const oldType = `  dateOffered?: string;
  startDate?: string;
  salaryOffered?: string;
};`;
const newType = `};`;
if (!content.includes(oldType)) {
  console.log('ERROR: Job type fields not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldType, newType);
console.log('Removed offer fields from the Job type.');

// 2. Remove the three lines from each of the 6 job entries in ALL_JOBS
const beforeCount = (content.match(/dateOffered: '/g) || []).length;
content = content.replace(/\n\s*dateOffered: '[^']*',\n\s*startDate: '[^']*',\n\s*salaryOffered: '[^']*',/g, '');
const afterCount = (content.match(/dateOffered: '/g) || []).length;
console.log('Removed offer data from ' + (beforeCount - afterCount) + ' of ' + beforeCount + ' job entries.');

// 3. Remove the "Offer Details" block in the Job Modal
const oldBlock = `          <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}>
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
              <span style={{ color: '#0B2A4A' }}><span className="font-semibold">Date Offered:</span> {job.dateOffered || 'To be provided upon final approval'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
              <span style={{ color: '#0B2A4A' }}><span className="font-semibold">Start Date:</span> {job.startDate || 'To be discussed upon offer acceptance'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Banknote className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
              <span style={{ color: '#0B2A4A' }}><span className="font-semibold">Salary Offered:</span> {job.salaryOffered || 'Competitive, based on experience and qualifications'}</span>
            </div>
          </div>
`;
if (!content.includes(oldBlock)) {
  console.log('WARNING: Offer Details block in JobModal not found as an exact match. It may already be removed, or formatting differs. Please check manually if needed.');
} else {
  content = content.replace(oldBlock, '');
  console.log('Removed the Offer Details block from the Job Modal.');
}

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS: File written.');
