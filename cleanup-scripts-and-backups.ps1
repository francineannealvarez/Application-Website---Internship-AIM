<#
  cleanup-scripts-and-backups.ps1
  Inililipat (hindi binubura) ang mga one-time na patch scripts,
  backup .tsx files, at dump .txt files papunta sa "archive" folder,
  para malinis ang project mo bago mag-push.

  StepGate.tsx sa src/components/dashboard ay HINDI galaw dito -
  kailangan pa rin yun, bahagi na ng app.
#>

$root = Get-Location
$archive = Join-Path $root "archive"
$scriptsArchive = Join-Path $archive "one-time-scripts"
$backupsArchive = Join-Path $archive "backups"
$dumpsArchive = Join-Path $archive "dumps"

New-Item -ItemType Directory -Force -Path $scriptsArchive | Out-Null
New-Item -ItemType Directory -Force -Path $backupsArchive | Out-Null
New-Item -ItemType Directory -Force -Path $dumpsArchive | Out-Null

$movedCount = 0

# ---- 1. One-time PowerShell/JS patch scripts (root level only) ----
$scriptPatterns = @(
    "apply-*.ps1",
    "fix-*.ps1",
    "strip-*.js",
    "cleanup.ps1"
)
foreach ($pattern in $scriptPatterns) {
    Get-ChildItem -Path $root -File -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "Archiving script: $($_.Name)"
        Move-Item -Path $_.FullName -Destination $scriptsArchive -Force
        $movedCount++
    }
}

# ---- 2. Timestamped backup .tsx files (root level only) ----
$backupPatterns = @(
    "page.backup-*.tsx",
    "PersonalDataSheetContent.backup-*.tsx",
    "landingpage.backup-*.tsx"
)
foreach ($pattern in $backupPatterns) {
    Get-ChildItem -Path $root -File -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "Archiving backup: $($_.Name)"
        Move-Item -Path $_.FullName -Destination $backupsArchive -Force
        $movedCount++
    }
}

# ---- 3. Dump/debug .txt files (root level only) ----
$dumpPatterns = @(
    "*_dump.txt",
    "*dump*.txt"
)
foreach ($pattern in $dumpPatterns) {
    Get-ChildItem -Path $root -File -Filter $pattern -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "Archiving dump file: $($_.Name)"
        Move-Item -Path $_.FullName -Destination $dumpsArchive -Force
        $movedCount++
    }
}

Write-Host ""
if ($movedCount -eq 0) {
    Write-Host "Wala nang nakitang matching files - malinis na pala ang root mo." -ForegroundColor Green
} else {
    Write-Host "Tapos na! $movedCount files ang inilipat papunta sa '$archive'." -ForegroundColor Green
}
Write-Host "Kapag sigurado ka na okay lahat (walang nasira), pwede mo nang burahin ang buong 'archive' folder." -ForegroundColor Yellow
Write-Host "Tip: idagdag mo rin ang 'archive/' sa .gitignore mo kung ayaw mong ma-track ito ni git." -ForegroundColor Gray
