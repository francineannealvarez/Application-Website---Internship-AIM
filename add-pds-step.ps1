# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# Isinisingit nito yung Personal Data Sheet step sa pagitan ng "Initial
# Interview" at "Assessment" sa dashboard hiring process, at ina-update ang
# lahat ng hardcoded na "4 steps" logic para tumama sa bagong 5-step na
# proseso. May backup bago mag-overwrite.

$target = "src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito. Siguraduhing nasa project root ka." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "src\components\dashboard\PersonalDataSheetContent.tsx")) {
    Write-Host "ERROR: Hindi mahanap ang PersonalDataSheetContent.tsx. I-check mo yung path." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw
$original = $content
$failures = @()

# Helper: count matches, replace if exactly expected count found, else record failure
function DoReplace {
    param(
        [string]$Pattern,
        [string]$Replacement,
        [string]$LabelName
    )
    $script:matchCount = ([regex]::Matches($script:content, $Pattern)).Count
    if ($script:matchCount -eq 1) {
        $script:content = [regex]::Replace($script:content, $Pattern, $Replacement, 'Singleline')
        Write-Host "OK: $LabelName" -ForegroundColor Green
    } elseif ($script:matchCount -eq 0) {
        Write-Host "MISSING: $LabelName (hindi nahanap -- baka naiba na yung file dito)" -ForegroundColor Red
        $script:failures += $LabelName
    } else {
        Write-Host "AMBIGUOUS: $LabelName (nahanap ng $($script:matchCount) beses, dapat isa lang -- ski-skip para hindi masira)" -ForegroundColor Yellow
        $script:failures += $LabelName
    }
}

# 1. Add ClipboardList to lucide-react imports
DoReplace -Pattern 'ClipboardCheck,(\s*)Calendar,' -Replacement 'ClipboardCheck, ClipboardList,$1Calendar,' -LabelName "lucide-react import (ClipboardList)"

# 2. Add PersonalDataSheetContent import after demo-session import
DoReplace -Pattern "import \{ clearDemoUser, readDemoUser, type DemoUser \} from '@/lib/demo-session';" -Replacement "import { clearDemoUser, readDemoUser, type DemoUser } from '@/lib/demo-session';`r`nimport PersonalDataSheetContent from '@/components/dashboard/PersonalDataSheetContent';" -LabelName "PersonalDataSheetContent import"

# 3. Insert new step into HIRING_STEPS array
DoReplace -Pattern [regex]::Escape("{ label: 'Initial Interview', sublabel: 'HR Screening', Icon: MessageSquare },") -Replacement "{ label: 'Initial Interview', sublabel: 'HR Screening', Icon: MessageSquare },`r`n  { label: 'Personal Data Sheet', sublabel: 'Applicant Information Form', Icon: ClipboardList }," -LabelName "HIRING_STEPS: insert Personal Data Sheet"

# 4. Fix expandedStep default
DoReplace -Pattern [regex]::Escape("completedSteps < 4 ? completedSteps : null") -Replacement "completedSteps < HIRING_STEPS.length ? completedSteps : null" -LabelName "expandedStep default (total steps)"

# 5. Fix "Simulate HR Update" button visibility
DoReplace -Pattern [regex]::Escape("completedSteps < 4 && <button") -Replacement "completedSteps < HIRING_STEPS.length && <button" -LabelName "Simulate HR Update button visibility"

# 6. Fix connector line count
DoReplace -Pattern [regex]::Escape("idx < 3 && <div") -Replacement "idx < HIRING_STEPS.length - 1 && <div" -LabelName "connector line count"

# 7. Fix isCurrent calc
DoReplace -Pattern [regex]::Escape("&& completedSteps < 4;") -Replacement "&& completedSteps < HIRING_STEPS.length;" -LabelName "isCurrent calc (total steps)"

# 8. Fix the step-content switch to add Personal Data Sheet branch
$switchPattern = 'idx\s*===\s*3\s*\?\s*<RequirementsContent\s+docStatuses=\{docStatuses\}\s+isCurrent=\{isCurrent\}\s*/>\s*:\s*<StepDetailContent\s+stepIdx=\{idx\}\s+isCurrent=\{isCurrent\}\s*/>'
$switchReplacement = @'
idx === 1 ? (
                    <PersonalDataSheetContent isCurrent={isCurrent} onSubmit={() => {}} />
                  ) : idx === HIRING_STEPS.length - 1 ? (
                    <RequirementsContent docStatuses={docStatuses} isCurrent={isCurrent} />
                  ) : (
                    <StepDetailContent stepIdx={idx > 1 ? idx - 1 : idx} isCurrent={isCurrent} />
                  )
'@
DoReplace -Pattern $switchPattern -Replacement $switchReplacement -LabelName "step content switch (add PDS branch)"

# 9. Fix Math.min cap in handleSimulateHrComplete
DoReplace -Pattern [regex]::Escape("Math.min(prev + 1, 4)") -Replacement "Math.min(prev + 1, HIRING_STEPS.length)" -LabelName "handleSimulateHrComplete: step cap"

# 10. Fix completion check in handleSimulateHrComplete
DoReplace -Pattern [regex]::Escape("if (next === 4) {") -Replacement "if (next === HIRING_STEPS.length) {" -LabelName "handleSimulateHrComplete: completion check"

if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "May $($failures.Count) hindi na-apply na pagbabago:" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "WALANG na-save na file (para hindi mapunit yung code mo). I-paste mo sakin itong output para maayos ko." -ForegroundColor Yellow
    exit 1
}

Copy-Item $target "$target.bak" -Force
Set-Content -Path $target -Value $content -NoNewline

Write-Host ""
Write-Host "TAPOS NA -- lahat ng 10 pagbabago successfully na-apply. Backup: $target.bak" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. Pumunta sa dashboard, i-click 'Continue to Hiring Process'"
Write-Host "  3. I-click yung 'Initial Interview' step para ma-collapse, tapos i-click yung bagong 'Personal Data Sheet' step (pangalawa na sa listahan)"
Write-Host "  4. Dapat lumabas na doon yung buong PDS form mo"
