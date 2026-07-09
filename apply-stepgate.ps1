# ============================================================
# apply-stepgate.ps1
# 1. Copies StepGate.tsx into src/components/dashboard/
# 2. Patches page.tsx to:
#    - import StepGate
#    - add withdrawn/withdrawReason state + handler
#    - wrap Initial Interview, SRA, Final Interview,
#      Background Check, Job Offer, Requirements with StepGate
#    - show a "Withdrawn" screen if the applicant withdraws
# PDS and Assessment are left untouched, per your instructions.
# ============================================================

$pageFile = ".\src\app\dashboard\page.tsx"
$stepGateSource = ".\StepGate.tsx"
$stepGateDest = ".\src\components\dashboard\StepGate.tsx"

if (-not (Test-Path $pageFile)) {
    Write-Host "ERROR: Could not find $pageFile" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}
if (-not (Test-Path $stepGateSource)) {
    Write-Host "ERROR: StepGate.tsx not found next to this script." -ForegroundColor Red
    Write-Host "Download StepGate.tsx and place it in the same folder as this script (project root) before running." -ForegroundColor Yellow
    exit 1
}

# --- Backup page.tsx ---
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\page.backup-stepgate-$timestamp.tsx"
Copy-Item $pageFile $backupPath
Write-Host "Backup saved to: $backupPath" -ForegroundColor Cyan

# --- Copy StepGate.tsx into place ---
Copy-Item $stepGateSource $stepGateDest -Force
Write-Host "StepGate.tsx placed at: $stepGateDest" -ForegroundColor Cyan

$content = Get-Content -Path $pageFile -Raw
$failedPatches = @()
$appliedCount = 0

function Apply-Patch {
    param([string]$Name, [string]$Old, [string]$New)
    if ($content.Contains($Old)) {
        $script:content = $content.Replace($Old, $New)
        Write-Host "  [OK] $Name" -ForegroundColor Green
        $script:appliedCount++
    } else {
        Write-Host "  [SKIPPED - pattern not found] $Name" -ForegroundColor Yellow
        $script:failedPatches += $Name
    }
}

Write-Host "`nApplying patches to page.tsx..." -ForegroundColor Cyan

# ---------- PATCH 1: import StepGate ----------
$old1 = "import JobOfferContent from '@/components/dashboard/JobOfferContent';"
$new1 = @'
import JobOfferContent from '@/components/dashboard/JobOfferContent';
import StepGate from '@/components/dashboard/StepGate';
'@
Apply-Patch -Name "1. Import StepGate" -Old $old1 -New $new1

# ---------- PATCH 2: HiringProcessCard signature - add onWithdraw ----------
$old2 = "function HiringProcessCard({ steps, completedSteps, docStatuses, docFiles, onDocUpload, onSimulateHrComplete, applicantName }: { steps: ReturnType<typeof buildHiringSteps>; completedSteps: number; docStatuses: DocStatus[]; docFiles: (StoredReqFile | null)[]; onDocUpload: (idx: number, file: File) => void; onSimulateHrComplete: () => void;  applicantName: string; }) {"
$new2 = "function HiringProcessCard({ steps, completedSteps, docStatuses, docFiles, onDocUpload, onSimulateHrComplete, applicantName, onWithdraw }: { steps: ReturnType<typeof buildHiringSteps>; completedSteps: number; docStatuses: DocStatus[]; docFiles: (StoredReqFile | null)[]; onDocUpload: (idx: number, file: File) => void; onSimulateHrComplete: () => void;  applicantName: string; onWithdraw: (reason: string) => void; }) {"
Apply-Patch -Name "2. HiringProcessCard: add onWithdraw param" -Old $old2 -New $new2

# ---------- PATCH 3: wrap the gated steps ----------
$old3 = @'
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
                ) : step.key === 'joboffer' ? (
                  <JobOfferContent isCurrent={isCurrent} applicantName={applicantName} />
                ) : step.key === 'requirements' ? (
                  <RequirementsContent docStatuses={docStatuses} docFiles={docFiles} onDocUpload={onDocUpload} isCurrent={isCurrent} />
                ) : (
                  <OnboardingContent isCurrent={isCurrent} />
                )}
'@
$new3 = @'
                {step.key === 'initial' ? (
                  <StepGate stepLabel="Initial Interview" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {() => <StepDetailContent stepIdx={0} isCurrent={isCurrent} />}
                  </StepGate>
                ) : step.key === 'pds' ? (
                  <PersonalDataSheetContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : step.key === 'sri' ? (
                  <StepGate stepLabel="SRA (Verbal Test)" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {(markSubmitted) => <SRAContent isCurrent={isCurrent} onSubmit={markSubmitted} />}
                  </StepGate>
                ) : step.key === 'assessment' ? (
                  <AssessmentContent isCurrent={isCurrent} onSubmit={onSimulateHrComplete} />
                ) : step.key === 'background' ? (
                  <StepGate stepLabel="Character & Background Check" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {(markSubmitted) => <BackgroundCheckContent isCurrent={isCurrent} onSubmit={markSubmitted} />}
                  </StepGate>
                ) : step.key === 'department' ? (
                  <StepGate stepLabel="Final Interview" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {() => <StepDetailContent stepIdx={1} isCurrent={isCurrent} />}
                  </StepGate>
                ) : step.key === 'joboffer' ? (
                  <StepGate stepLabel="Job Offer" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {() => <JobOfferContent isCurrent={isCurrent} applicantName={applicantName} />}
                  </StepGate>
                ) : step.key === 'requirements' ? (
                  <StepGate stepLabel="Requirements Submission" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {() => <RequirementsContent docStatuses={docStatuses} docFiles={docFiles} onDocUpload={onDocUpload} isCurrent={isCurrent} />}
                  </StepGate>
                ) : (
                  <OnboardingContent isCurrent={isCurrent} />
                )}
'@
Apply-Patch -Name "3. Wrap gated steps with StepGate" -Old $old3 -New $new3

# ---------- PATCH 4: ApplicantDashboard - add withdrawn state ----------
$old4 = @'
  const [modalOpen, setModalOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
'@
$new4 = @'
  const [modalOpen, setModalOpen] = useState(false);
  const [congratsOpen, setCongratsOpen] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');

  const handleWithdraw = (reason: string) => {
    setWithdrawReason(reason);
    setWithdrawn(true);
  };
'@
Apply-Patch -Name "4. ApplicantDashboard: withdrawn state + handler" -Old $old4 -New $new4

# ---------- PATCH 5: render branch - withdrawn screen + pass onWithdraw ----------
$old5 = @'
        ) : showHiringProcess ? (
          <HiringProcessCard key={hiringCompletedSteps} steps={steps} completedSteps={hiringCompletedSteps} docStatuses={docStatuses} docFiles={docFiles} onDocUpload={handleDocUpload} onSimulateHrComplete={handleSimulateHrComplete} applicantName={name} />
        ) : (
'@
$new5 = @'
        ) : withdrawn ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E9EC] p-8 text-center animate-fade-slide-up delay-1 space-y-3">
            <p className="text-lg font-bold" style={{ color: '#0B2A4A' }}>Your application has been withdrawn.</p>
            <p className="text-sm" style={{ color: '#6B7A8D' }}>Reason provided: {withdrawReason}</p>
            <p className="text-sm" style={{ color: '#6B7A8D' }}>Thank you for your time and interest in Arvin International Marketing Inc. We hope to see your application again in the future.</p>
          </div>
        ) : showHiringProcess ? (
          <HiringProcessCard key={hiringCompletedSteps} steps={steps} completedSteps={hiringCompletedSteps} docStatuses={docStatuses} docFiles={docFiles} onDocUpload={handleDocUpload} onSimulateHrComplete={handleSimulateHrComplete} applicantName={name} onWithdraw={handleWithdraw} />
        ) : (
'@
Apply-Patch -Name "5. Withdrawn screen + wire onWithdraw" -Old $old5 -New $new5

Set-Content -Path $pageFile -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 5 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED patches (paste this back to Claude):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore page.tsx if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$pageFile' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
