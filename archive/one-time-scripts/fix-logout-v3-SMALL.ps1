<#
  fix-logout-v3-SMALL.ps1
  Mas maliit at specific na patches (hindi na apektado ng
  reformatting ng className o ibang whitespace sa paligid).
#>

$target = ".\src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\page.backup-logoutfix-v3-$timestamp.tsx"
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

# ---------- PATCH 1: redirect target only (tiny, single line) ----------
$old1 = "router.push('/login');"
$new1 = "router.push('/');"
Apply-Patch -Name "1. Redirect: /login -> /" -Old $old1 -New $new1

# ---------- PATCH 2: onClick handler only (no className dependency) ----------
$old2 = "onClick={() => { clearDemoUser(); void signOut({ callbackUrl: '/' }); }}"
$new2 = "onClick={async () => { clearDemoUser(); if (session) { await signOut({ redirect: false }); } router.push('/'); }}"
Apply-Patch -Name "2. Logout onClick: reliable redirect" -Old $old2 -New $new2

Set-Content -Path $target -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 2 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED (paste this back to Claude):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
