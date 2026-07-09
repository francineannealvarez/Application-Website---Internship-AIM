const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `      <div className="flex items-center px-6 sm:px-10 pt-6 pb-4 max-w-3xl mx-auto">
        {steps.map(({ Icon }, idx) => {
          const state = circleState(idx);
          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all', state === 'locked' && 'bg-white text-[#D1DAE3]')}
                  style={
                    state === 'completed' ? { backgroundColor: '#12B6D6', borderColor: '#12B6D6', color: '#fff' }
                    : state === 'active' ? { backgroundColor: '#0B2A4A', borderColor: '#0B2A4A', color: '#fff', boxShadow: '0 0 0 4px rgba(11,42,74,0.12)' }
                    : { borderColor: '#E5E9EC' }
                  }>
                  {state === 'completed' ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight max-w-[64px]" style={{ color: state === 'completed' ? '#12B6D6' : state === 'active' ? '#0B2A4A' : '#D1DAE3' }}>{steps[idx].label}</span>
              </div>
              {idx < totalSteps - 1 && <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-500" style={{ backgroundColor: idx < completedSteps ? '#12B6D6' : '#E5E9EC' }} />}
            </React.Fragment>
          );
        })}`;

const newBlock = `      <div className="flex items-start px-6 sm:px-10 pt-6 pb-4 w-full overflow-x-auto">
        {steps.map(({ Icon }, idx) => {
          const state = circleState(idx);
          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all', state === 'locked' && 'bg-white text-[#D1DAE3]')}
                  style={
                    state === 'completed' ? { backgroundColor: '#12B6D6', borderColor: '#12B6D6', color: '#fff' }
                    : state === 'active' ? { backgroundColor: '#0B2A4A', borderColor: '#0B2A4A', color: '#fff', boxShadow: '0 0 0 4px rgba(11,42,74,0.12)' }
                    : { borderColor: '#E5E9EC' }
                  }>
                  {state === 'completed' ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight max-w-[64px]" style={{ color: state === 'completed' ? '#12B6D6' : state === 'active' ? '#0B2A4A' : '#D1DAE3' }}>{steps[idx].label}</span>
              </div>
              {idx < totalSteps - 1 && <div className="flex-1 h-0.5 min-w-[16px] mx-1.5 mt-5 rounded-full transition-colors duration-500" style={{ backgroundColor: idx < completedSteps ? '#12B6D6' : '#E5E9EC' }} />}
            </React.Fragment>
          );
        })}`;

if (!content.includes(oldBlock)) {
  console.log('ERROR: circle-row block not found as expected. Aborting without changes.');
  process.exit(1);
}
content = content.replace(oldBlock, newBlock);
fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS: Circle row now uses full width with a guaranteed minimum connector width, and circles are top-aligned for even height.');
