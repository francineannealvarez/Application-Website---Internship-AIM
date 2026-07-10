<#
  apply-joboffer-fix.ps1
  1. Replaces JobOfferContent.tsx with the Accept/Decline version
     (no more Submitted/Under Review/HR simulate for Job Offer -
     just a direct "Do you want to accept this offer?" message).
  2. Updates the Initial Interview instructions to mention
     Microsoft Teams, face-to-face, and Viber call (not Viber only).

  Run this from your project root, with JobOfferContent.tsx placed
  in the SAME folder as this script.
#>

$pageFile = ".\src\app\dashboard\page.tsx"
$jobOfferSource = ".\JobOfferContent.tsx"
$jobOfferDest = ".\src\components\dashboard\JobOfferContent.tsx"

if (-not (Test-Path $pageFile)) {
    Write-Host "ERROR: Could not find $pageFile" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}
if (-not (Test-Path $jobOfferSource)) {
    Write-Host "ERROR: JobOfferContent.tsx not found next to this script." -ForegroundColor Red
    Write-Host "Download JobOfferContent.tsx and place it in the same folder as this script." -ForegroundColor Yellow
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\page.backup-joboffer-$timestamp.tsx"
Copy-Item $pageFile $backupPath
Write-Host "Backup saved to: $backupPath" -ForegroundColor Cyan

Copy-Item $jobOfferSource $jobOfferDest -Force
Write-Host "JobOfferContent.tsx updated at: $jobOfferDest" -ForegroundColor Cyan

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

# ---------- PATCH 1: remove StepGate wrap for Job Offer, use direct Accept/Decline ----------
$old1 = @'
                ) : step.key === 'joboffer' ? (
                  <StepGate stepLabel="Job Offer" isCurrent={isCurrent} onAdvance={onSimulateHrComplete} onWithdraw={onWithdraw}>
                    {() => <JobOfferContent isCurrent={isCurrent} applicantName={applicantName} />}
                  </StepGate>
                ) : step.key === 'requirements' ? (
'@
$new1 = @'
                ) : step.key === 'joboffer' ? (
                  <JobOfferContent isCurrent={isCurrent} applicantName={applicantName} onAccept={onSimulateHrComplete} onDecline={onWithdraw} />
                ) : step.key === 'requirements' ? (
'@
Apply-Patch -Name "1. Job Offer: direct Accept/Decline (no HR gate)" -Old $old1 -New $new1

# ---------- PATCH 2: Initial Interview instructions - mention Teams/face-to-face/Viber ----------
$old2 = "Please wait for a text message from HR regarding your Initial Interview schedule. Make sure your Viber is ready and reachable, as HR will call you there."
$new2 = "Please wait for a message from HR regarding your Initial Interview schedule. Depending on your assigned interviewer, this may be conducted via Microsoft Teams, face-to-face, or a Viber call - make sure your Viber, email, and phone are all reachable so HR can reach you through whichever mode is assigned."
Apply-Patch -Name "2. Initial Interview: mention Teams/face-to-face/Viber" -Old $old2 -New $new2

Set-Content -Path $pageFile -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 2 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED patches (paste this back to Claude):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore page.tsx if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$pageFile' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
