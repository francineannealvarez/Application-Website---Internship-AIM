const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `      <div className="px-4 sm:px-6 pb-5 space-y-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < completedSteps;
          const isCurrent = idx === completedSteps && completedSteps < totalSteps;
          const isLocked = idx > completedSteps;
          const isExpanded = expandedStep === idx;
          return (
            <div key={step.key} className={cn('rounded-xl border transition-all duration-200', isCompleted && 'border-green-100 bg-green-50/30', isLocked && 'bg-[#F7F9FA]')}
              style={isCurrent ? { borderColor: '#B8EAF3', backgroundColor: '#EEF9FB' } : isLocked ? { borderColor: '#E5E9EC' } : {}}>
              <button onClick={() => handleRowClick(idx)} disabled={isLocked} className={cn('w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors rounded-xl', isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-black/[0.02]')}>
                <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', isCompleted && 'bg-green-500')} style={isCurrent ? { backgroundColor: '#12B6D6' } : isLocked ? { backgroundColor: '#D1DAE3' } : {}} />
                <div className="flex-1 min-w-0">
                  <div className={cn('font-semibold text-sm', isLocked ? 'text-[#D1DAE3]' : 'text-[#0B2A4A]')}>{step.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: isLocked ? '#D1DAE3' : '#6B7A8D' }}>{step.sublabel}</div>
                </div>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full shrink-0', isCompleted && 'bg-green-100 text-green-700', isLocked && 'bg-gray-100 text-gray-300')}
                  style={isCurrent ? { backgroundColor: '#0B2A4A', color: '#fff' } : {}}>{isCompleted ? 'Done' : isCurrent ? 'Current' : 'Pending'}</span>
                {!isLocked && <ChevronDown className={cn('w-4 h-4 shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')} style={{ color: '#9BAAB8' }} />}
              </button>
              {isExpanded && !isLocked && (
                <div className="px-4 pb-4 border-t border-[#E5E9EC]/80 animate-fade-slide-up">
                  {step.key === 'initial' ? (
                    <StepDetailContent stepIdx={0} isCurrent={isCurrent} />
                  ) : step.key === 'pds' ? (
                    <PersonalDataSheetContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                  ) : step.key === 'sri' ? (
                    <SRAContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                  ) : step.key === 'assessment' ? (
                    <AssessmentContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                  ) : step.key === 'background' ? (
                    <BackgroundCheckContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                  ) : step.key === 'department' ? (
                    <StepDetailContent stepIdx={1} isCurrent={isCurrent} />
                  ) : step.key === 'requirements' ? (
                    <RequirementsContent docStatuses={docStatuses} isCurrent={isCurrent} />
                  ) : (
                    <OnboardingContent isCurrent={isCurrent} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>`;

const newBlock = `      <div className="px-4 sm:px-6 pb-5 space-y-2">
        {(() => {
          const idx = completedSteps < totalSteps ? completedSteps : totalSteps - 1;
          const step = steps[idx];
          const isCompleted = idx < completedSteps;
          const isCurrent = idx === completedSteps && completedSteps < totalSteps;
          return (
            <div key={step.key} className={cn('rounded-xl border transition-all duration-200', isCompleted && 'border-green-100 bg-green-50/30')}
              style={isCurrent ? { borderColor: '#B8EAF3', backgroundColor: '#EEF9FB' } : {}}>
              <div className="w-full flex items-center gap-3 px-4 py-3.5 text-left rounded-xl">
                <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', isCompleted && 'bg-green-500')} style={isCurrent ? { backgroundColor: '#12B6D6' } : {}} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#0B2A4A]">{step.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>{step.sublabel}</div>
                </div>
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full shrink-0', isCompleted && 'bg-green-100 text-green-700')}
                  style={isCurrent ? { backgroundColor: '#0B2A4A', color: '#fff' } : {}}>{isCompleted ? 'Done' : isCurrent ? 'Current' : 'Pending'}</span>
              </div>
              <div className="px-4 pb-4 border-t border-[#E5E9EC]/80 animate-fade-slide-up">
                {step.key === 'initial' ? (
                  <StepDetailContent stepIdx={0} isCurrent={isCurrent} />
                ) : step.key === 'pds' ? (
                  <PersonalDataSheetContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : step.key === 'sri' ? (
                  <SRAContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : step.key === 'assessment' ? (
                  <AssessmentContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : step.key === 'background' ? (
                  <BackgroundCheckContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : step.key === 'department' ? (
                  <StepDetailContent stepIdx={1} isCurrent={isCurrent} />
                ) : step.key === 'requirements' ? (
                  <RequirementsContent docStatuses={docStatuses} isCurrent={isCurrent} />
                ) : (
                  <OnboardingContent isCurrent={isCurrent} />
                )}
              </div>
            </div>
          );
        })()}
      </div>`;

if (!content.includes(oldBlock)) {
  console.log('ERROR: exact block not found. No changes made. Please re-check the file.');
  process.exit(1);
}
content = content.replace(oldBlock, newBlock);

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS: Detail list now shows only the current (or last completed) step.');
