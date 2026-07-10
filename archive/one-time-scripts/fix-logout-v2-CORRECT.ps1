# ============================================================
# fix-logout-redirect.ps1
# 1. Makes Logout reliably redirect to the landing page ("/"),
#    even in demo mode (where NextAuth signOut() has nothing
#    to sign out of, so it silently did nothing before).
# 2. Changes the "not logged in" auto-redirect to go to the
#    landing page ("/") instead of the old /login route.
# ============================================================

$target = ".\src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\page.backup-logoutfix-$timestamp.tsx"
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

# ---------- PATCH 1: unauthenticated redirect -> landing page ----------
$old1 = @'
  useEffect(() => {
    if (status === 'unauthenticated' && !demoUser) {
      router.push('/login');
    }
  }, [status, demoUser, router]);
'@
$new1 = @'
  useEffect(() => {
    if (status === 'unauthenticated' && !demoUser) {
      router.push('/');
    }
  }, [status, demoUser, router]);
'@
Apply-Patch -Name "1. Unauthenticated redirect: /login -> / (landing page)" -Old $old1 -New $new1

# ---------- PATCH 2: Logout button - reliable redirect ----------
$old2 = @'
            <button onClick={() => { clearDemoUser(); void signOut({ callbackUrl: '/' }); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
'@
$new2 = @'
            <button onClick={async () => {
              clearDemoUser();
              if (session) {
                await signOut({ redirect: false });
              }
              router.push('/');
            }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
'@
Apply-Patch -Name "2. Logout button: always redirect to landing page reliably" -Old $old2 -New $new2

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
