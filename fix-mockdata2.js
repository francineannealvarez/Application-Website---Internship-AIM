const fs = require('fs');
const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add fields to the Job type
const oldType = `type Job = {
  title: string;
  dept: string;
  location: string;
  type: string;
  level: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
};`;

const newType = `type Job = {
  title: string;
  dept: string;
  location: string;
  type: string;
  level: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  dateOffered?: string;
  startDate?: string;
  salaryOffered?: string;
};`;

if (!content.includes(oldType)) {
  console.log('ERROR: Job type block not found as expected. No changes made.');
  process.exit(1);
}
content = content.replace(oldType, newType);

// 2. Insert mock data into each job entry, right before its closing "  },"
//    We match each job block by its "qualifications: [...]," array closing followed by "  },"
//    Simpler: split on the ALL_JOBS array and inject mock fields after each job's "qualifications:" array closes.

const mockDataByTitle = {
  'Marketing Specialist': ["July 10, 2026", "August 1, 2026", "PHP 28,000 - 35,000 / month"],
  'Sales Representative': ["July 12, 2026", "August 4, 2026", "PHP 20,000 - 25,000 / month"],
  'Business Development Manager': ["July 8, 2026", "July 27, 2026", "PHP 60,000 - 75,000 / month"],
  'Logistics Coordinator': ["July 14, 2026", "August 11, 2026", "PHP 24,000 - 30,000 / month"],
  'Accounting Staff': ["July 15, 2026", "August 18, 2026", "PHP 22,000 - 27,000 / month"],
  'Warehouse Supervisor': ["July 9, 2026", "July 28, 2026", "PHP 32,000 - 40,000 / month"],
};

let insertedCount = 0;
for (const [title, [dateOffered, startDate, salaryOffered]] of Object.entries(mockDataByTitle)) {
  // Find "title: 'X'," then find the qualifications array closing "],\n  }," right after it
  const titleMarker = `title: '${title}',`;
  const titleIdx = content.indexOf(titleMarker);
  if (titleIdx === -1) {
    console.log('WARNING: could not find job entry for "' + title + '". Skipping.');
    continue;
  }
  // find "qualifications: [" after titleIdx
  const qualIdx = content.indexOf('qualifications: [', titleIdx);
  if (qualIdx === -1) {
    console.log('WARNING: could not find qualifications array for "' + title + '". Skipping.');
    continue;
  }
  // find the closing "  ],\n  }," that ends this job object (first "\n  },\n" after qualIdx)
  const closeIdx = content.indexOf('\n  },', qualIdx);
  if (closeIdx === -1) {
    console.log('WARNING: could not find closing brace for "' + title + '". Skipping.');
    continue;
  }
  const insertion = `\n    dateOffered: '${dateOffered}',\n    startDate: '${startDate}',\n    salaryOffered: '${salaryOffered}',`;
  content = content.slice(0, closeIdx) + insertion + content.slice(closeIdx);
  insertedCount++;
}

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS: Job type updated. Mock data inserted into ' + insertedCount + ' of ' + Object.keys(mockDataByTitle).length + ' job entries.');
