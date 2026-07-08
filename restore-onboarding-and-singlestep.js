const fs = require('fs');
const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import for OnboardingContent (after BackgroundCheckContent import)
const oldImport = `import BackgroundCheckContent from '@/components/dashboard/BackgroundCheckContent';`;
if (!content.includes(oldImport)) {
  console.log('ERROR: BackgroundCheckContent import not found. Aborting.');
  process.exit(1);
}
if (!content.includes('OnboardingContent')) {
  content = content.replace(
    oldImport,
    oldImport + `\nimport OnboardingContent from '@/components/dashboard/OnboardingContent';`
  );
  console.log('Added OnboardingContent import.');
} else {
  console.log('OnboardingContent import already present, skipping.');
}

// 2. Add Onboarding entry to HIRING_STEPS
const oldSteps = `const HIRING_STEPS = [
  { label: 'Initial Interview', sublabel: 'HR Screening', Icon: MessageSquare },
  { label: 'Personal Data Sheet', sublabel: 'Complete your PDS', Icon: FileText },
  { label: 'Assessment', sublabel: 'Aptitude & Personality', Icon: PenLine },
  { label: 'Character & Background Check', sublabel: 'Authorization Form', Icon: Shield },
  { label: 'Department Interview', sublabel: 'With Department Head', Icon: Users },
  { label: 'Requirements', sublabel: 'Document Submission', Icon: ClipboardCheck },
] as const;`;
const newSteps = `const HIRING_STEPS = [
  { label: 'Initial Interview', sublabel: 'HR Screening', Icon: MessageSquare },
  { label: 'Personal Data Sheet', sublabel: 'Complete your PDS', Icon: FileText },
  { label: 'Assessment', sublabel: 'Aptitude & Personality', Icon: PenLine },
  { label: 'Character & Background Check', sublabel: 'Authorization Form', Icon: Shield },
  { label: 'Department Interview', sublabel: 'With Department Head', Icon: Users },
  { label: 'Requirements', sublabel: 'Document Submission', Icon: ClipboardCheck },
  { label: 'Onboarding', sublabel: 'Welcome to Arvin!', Icon: Sparkles },
] as const;`;
if (!content.includes(oldSteps)) {
  console.log('ERROR: HIRING_STEPS block not found as expected. Aborting.');
  process.exit(1);
}
content = content.replace(oldSteps, newSteps);
console.log('Added Onboarding entry to HIRING_STEPS.');

// 3. Replace the detail-list steps.map with single-current-step view (this block also
//    contains the content-mapping ternary, which we update here to add idx===5 and Onboarding in one pass)
const oldList = `      <div className="px-4 sm:px-6 pb-5 space-y-2">
        {HIRING_STEPS.map((step, idx) => {
          const isCompleted = idx < completedSteps;
          const isCurrent = idx === completedSteps && completedSteps < totalSteps;
          const isLocked = idx > completedSteps;
          const isExpanded = expandedStep === idx;
          return (
            <div key={idx} className={cn('rounded-xl border transition-all duration-200', isCompleted && 'border-green-100 bg-green-50/30', isLocked && 'bg-[#F7F9FA]')}
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
                  {idx === 0 ? (
                    <StepDetailContent stepIdx={0} isCurrent={isCurrent} />
                  ) : idx === 1 ? (
                    <PersonalDataSheetContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                  ) : idx === 2 ? (
                    <AssessmentContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                  ) : idx === 3 ? (
                    <BackgroundCheckContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                  ) : idx === 4 ? (
                    <StepDetailContent stepIdx={1} isCurrent={isCurrent} />
                  ) : (
                    <RequirementsContent docStatuses={docStatuses} isCurrent={isCurrent} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>`;

const newList = `      <div className="px-4 sm:px-6 pb-5 space-y-2">
        {(() => {
          const idx = completedSteps < totalSteps ? completedSteps : totalSteps - 1;
          const step = HIRING_STEPS[idx];
          const isCompleted = idx < completedSteps;
          const isCurrent = idx === completedSteps && completedSteps < totalSteps;
          return (
            <div key={idx} className={cn('rounded-xl border transition-all duration-200', isCompleted && 'border-green-100 bg-green-50/30')}
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
                {idx === 0 ? (
                  <StepDetailContent stepIdx={0} isCurrent={isCurrent} />
                ) : idx === 1 ? (
                  <PersonalDataSheetContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : idx === 2 ? (
                  <AssessmentContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : idx === 3 ? (
                  <BackgroundCheckContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : idx === 4 ? (
                  <StepDetailContent stepIdx={1} isCurrent={isCurrent} />
                ) : idx === 5 ? (
                  <RequirementsContent docStatuses={docStatuses} isCurrent={isCurrent} />
                ) : (
                  <OnboardingContent isCurrent={isCurrent} />
                )}
              </div>
            </div>
          );
        })()}
      </div>`;

if (!content.includes(oldList)) {
  console.log('ERROR: detail-list block not found as expected (mapping step above may have already changed it). Checking...');
  process.exit(1);
}
content = content.replace(oldList, newList);
console.log('Applied single-current-step view to the detail list.');

fs.writeFileSync(path, content, 'utf8');
console.log('SUCCESS: All changes written.');
