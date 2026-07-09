# ============================================================
# fix-radio-visibility.ps1
# Adds a visible border to radio-style circles (Civil Status,
# Yes/No, Checkbox) so unselected options are visible, not just
# a blank space until clicked.
# ============================================================

$target = ".\src\components\dashboard\PersonalDataSheetContent.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\PersonalDataSheetContent.backup-radiofix-$timestamp.tsx"
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

# ---------- PATCH A: YesNo component circle ----------
$oldA = @'
            <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{  backgroundColor: value === opt ? T.cyan : 'transparent' }}>
              {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
'@
$newA = @'
            <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2"
              style={{ backgroundColor: value === opt ? T.cyan : 'transparent', borderColor: value === opt ? T.cyan : T.faint }}>
              {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
'@
Apply-Patch -Name "A. YesNo radio circle border" -Old $oldA -New $newA

# ---------- PATCH B: Checkbox component box ----------
$oldB = @'
      <span className="w-4 h-4 rounded flex items-center justify-center shrink-0"
        style={{  backgroundColor: checked ? T.cyan : 'transparent' }}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </span>
'@
$newB = @'
      <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 border-2"
        style={{ backgroundColor: checked ? T.cyan : 'transparent', borderColor: checked ? T.cyan : T.faint }}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </span>
'@
Apply-Patch -Name "B. Checkbox box border" -Old $oldB -New $newB

# ---------- PATCH C: Civil Status circle ----------
$oldC = @'
                <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{  backgroundColor: civilStatus === s ? T.cyan : 'transparent' }}>
                  {civilStatus === s && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
'@
$newC = @'
                <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2" style={{ backgroundColor: civilStatus === s ? T.cyan : 'transparent', borderColor: civilStatus === s ? T.cyan : T.faint }}>
                  {civilStatus === s && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
'@
Apply-Patch -Name "C. Civil Status radio circle border" -Old $oldC -New $newC

Set-Content -Path $target -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 3 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED patches (paste this back to Claude):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
