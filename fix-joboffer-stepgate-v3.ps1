<#
  fix-joboffer-stepgate-v3.ps1
  Regex-based (hindi literal string match), kaya hindi na
  apektado kahit nag-iba ang spacing/line breaks sa paligid.
  Tinatanggal ang StepGate wrapper sa Job Offer step at
  ginagawang direct Accept/Decline.
#>

$target = ".\src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\page.backup-joboffer-v3-$timestamp.tsx"
Copy-Item $target $backupPath
Write-Host "Backup saved to: $backupPath" -ForegroundColor Cyan

$content = Get-Content -Path $target -Raw

$pattern = '<StepGate\s+stepLabel="Job Offer"[\s\S]*?</StepGate>'
$replacement = '<JobOfferContent isCurrent={isCurrent} applicantName={applicantName} onAccept={onSimulateHrComplete} onDecline={onWithdraw} />'

$regexMatches = [regex]::Matches($content, $pattern)

if ($regexMatches.Count -eq 0) {
    Write-Host "[SKIPPED] Walang nahanap na StepGate block para sa Job Offer." -ForegroundColor Yellow
    Write-Host "Baka may naiba pang laman. Paste mo ulit dito ang Job Offer section para makita natin." -ForegroundColor Yellow
} elseif ($regexMatches.Count -gt 1) {
    Write-Host "[WARNING] May $($regexMatches.Count) na tugma - hindi unique. Walang binago para ligtas." -ForegroundColor Red
    Write-Host "I-paste mo yung buong Job Offer section sa akin." -ForegroundColor Red
} else {
    $content = [regex]::Replace($content, $pattern, $replacement)
    Set-Content -Path $target -Value $content -NoNewline
    Write-Host "[OK] Job Offer: StepGate wrapper removed, now uses direct Accept/Decline." -ForegroundColor Green
}

Write-Host "`nRestore if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
