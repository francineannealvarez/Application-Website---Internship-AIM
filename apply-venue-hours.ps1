# ============================================================
# apply-venue-hours.ps1
# Updates the Submission Venue address and Office Hours text
# in the Requirements step.
# ============================================================

$target = ".\src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\page.backup-venuehours-$timestamp.tsx"
Copy-Item $target $backupPath
Write-Host "Backup saved to: $backupPath" -ForegroundColor Cyan

$content = Get-Content -Path $target -Raw
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

Write-Host "`nApplying patches..." -ForegroundColor Cyan

# ---------- PATCH A: Submission Venue ----------
$oldA = '<div className="text-xs font-semibold uppercase tracking-wide" style={{ color: ''#12B6D6'' }}>Submission Venue</div><div className="text-sm font-bold text-[#0B2A4A] mt-0.5">HR Office, Ground Floor, Arvin HQ, BGC Taguig</div>'
$newA = '<div className="text-xs font-semibold uppercase tracking-wide" style={{ color: ''#12B6D6'' }}>Submission Venue</div><div className="text-sm font-bold text-[#0B2A4A] mt-0.5">Arvin International Marketing Inc. — 18th Floor, Y Tower Building, Corner Coral Way St., Macapagal Ave., Brgy. 76, Pasay City</div>'
Apply-Patch -Name "A. Update Submission Venue address" -Old $oldA -New $newA

# ---------- PATCH B: Office Hours ----------
$oldB = '<div className="text-xs font-semibold uppercase tracking-wide" style={{ color: ''#12B6D6'' }}>Office Hours</div><div className="text-sm font-bold text-[#0B2A4A] mt-0.5">9:00 AM - 5:00 PM, Monday to Friday</div>'
$newB = '<div className="text-xs font-semibold uppercase tracking-wide" style={{ color: ''#12B6D6'' }}>Office Hours</div><div className="text-sm font-bold text-[#0B2A4A] mt-0.5">8:00 AM - 6:00 PM, Monday to Friday</div>'
Apply-Patch -Name "B. Update Office Hours to 8am-6pm" -Old $oldB -New $newB

Set-Content -Path $target -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 2 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED patches (paste this back to Claude):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
