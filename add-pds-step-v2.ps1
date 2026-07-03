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
$failures = @()

function CountOccurrences {
    param([string]$Haystack, [string]$Needle)
    if ($Needle.Length -eq 0) { return 0 }
    $count = 0
    $idx = 0
    while (($idx = $Haystack.IndexOf($Needle, $idx)) -ge 0) {
        $count++
        $idx += $Needle.Length
    }
    return $count
}

function DoReplaceLiteral {
    param([string]$Old, [string]$New, [string]$LabelName)
    $count = CountOccurrences -Haystack $script:content -Needle $Old
    if ($count -eq 1) {
        $script:content = $script:content.Replace($Old, $New)
        Write-Host "OK: $LabelName" -ForegroundColor Green
    } elseif ($count -eq 0) {
        Write-Host "MISSING: $LabelName (hindi nahanap)" -ForegroundColor Red
        $script:failures += $LabelName
    } else {
        Write-Host "AMBIGUOUS: $LabelName (nahanap ng $count beses)" -ForegroundColor Yellow
        $script:failures += $LabelName
    }
}

if ($content -match "ClipboardList") {
    Write-Host "SKIP: ClipboardList import (nailagay na dati)" -ForegroundColor Yellow
} else {
    DoReplaceLiteral -Old "ClipboardCheck,`r`n  Calendar," -New "ClipboardCheck, ClipboardList,`r`n  Calendar," -LabelName "lucide-react import (ClipboardList)"
}

if ($content -match "PersonalDataSheetContent") {
    Write-Host "SKIP: PersonalDataSheetContent import (nailagay na dati)" -ForegroundColor Yellow
} else {
    DoReplaceLiteral -Old "import { clearDemoUser, readDemoUser, type DemoUser } from '@/lib/demo-session';" -New "import { clearDemoUser, readDemoUser, type DemoUser } from '@/lib/demo-session';`r`nimport PersonalDataSheetContent from '@/components/dashboard/PersonalDataSheetContent';" -LabelName "PersonalDataSheetContent import"
}

if ($content -match "Personal Data Sheet', sublabel:") {
    Write-Host "SKIP: HIRING_STEPS entry (nailagay na dati)" -ForegroundColor Yellow
} else {
    DoReplaceLiteral -Old "{ label: 'Initial Interview', sublabel: 'HR Screening', Icon: MessageSquare }," -New "{ label: 'Initial Interview', sublabel: 'HR Screening', Icon: MessageSquare },`r`n  { label: 'Personal Data Sheet', sublabel: 'Applicant Information Form', Icon: ClipboardList }," -LabelName "HIRING_STEPS: insert Personal Data Sheet"
}

DoReplaceLiteral -Old "completedSteps < 4 ? completedSteps : null" -New "completedSteps < HIRING_STEPS.length ? completedSteps : null" -LabelName "expandedStep default (total steps)"
DoReplaceLiteral -Old "completedSteps < 4 && <button" -New "completedSteps < HIRING_STEPS.length && <button" -LabelName "Simulate HR Update button visibility"
DoReplaceLiteral -Old "idx < 3 && <div" -New "idx < HIRING_STEPS.length - 1 && <div" -LabelName "connector line count"
DoReplaceLiteral -Old "&& completedSteps < 4;" -New "&& completedSteps < HIRING_STEPS.length;" -LabelName "isCurrent calc (total steps)"
DoReplaceLiteral -Old "Math.min(prev + 1, 4)" -New "Math.min(prev + 1, HIRING_STEPS.length)" -LabelName "handleSimulateHrComplete: step cap"
DoReplaceLiteral -Old "if (next === 4) {" -New "if (next === HIRING_STEPS.length) {" -LabelName "handleSimulateHrComplete: completion check"

if ($content -match "PersonalDataSheetContent isCurrent") {
    Write-Host "SKIP: step content switch (nailagay na dati)" -ForegroundColor Yellow
} else {
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
    if ($content -match $switchPattern) {
        $content = [regex]::Replace($content, $switchPattern, $switchReplacement, 'Singleline')
        Write-Host "OK: step content switch (add PDS branch)" -ForegroundColor Green
    } else {
        Write-Host "MISSING: step content switch (hindi nahanap)" -ForegroundColor Red
        $failures += "step content switch"
    }
}

if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "May $($failures.Count) hindi na-apply na pagbabago:" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "WALANG na-save na file. I-paste mo sakin itong output para maayos ko." -ForegroundColor Yellow
    exit 1
}

Copy-Item $target "$target.bak" -Force
Set-Content -Path $target -Value $content -NoNewline

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. Dashboard -> 'Continue to Hiring Process' -> i-click yung 'Personal Data Sheet' step"
Write-Host "  3. Dapat lumabas na doon yung buong PDS form mo"
