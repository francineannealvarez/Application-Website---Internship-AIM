<#
  fix-logout-redirect.ps1

  Ano ginagawa nito:
  - Pinapalitan ang callbackUrl ng signOut() mula '/login' papunta sa '/' (landing page)
  - Ginagawa ito sa dalawang file:
      1. src\app\dashboard\page.tsx      (applicant dashboard)
      2. src\app\hr\dashboard\page.tsx   (HR dashboard)
  - Pagkatapos nito, pag-click ng "Logout" ay babalik na sa landing page imbes na sa /login

  PAANO GAMITIN:
  1. I-download ang file na ito papunta sa root ng project mo (kasama ng package.json)
  2. Buksan ang PowerShell sa loob ng project folder mo, tapos i-run:
       powershell -ExecutionPolicy Bypass -File .\fix-logout-redirect.ps1
#>

$ProjectRoot = Get-Location

$files = @(
    "src\app\dashboard\page.tsx",
    "src\app\hr\dashboard\page.tsx"
)

$oldText = "callbackUrl: '/login'"
$newText = "callbackUrl: '/'"

$anyError = $false

foreach ($rel in $files) {
    $path = Join-Path $ProjectRoot $rel

    if (-not (Test-Path $path)) {
        Write-Host "ERROR: Hindi nahanap ang file: $path" -ForegroundColor Red
        $anyError = $true
        continue
    }

    $content = Get-Content $path -Raw

    if ($content -match [regex]::Escape($newText)) {
        Write-Host "SKIP: $rel -- mukhang na-patch na (may '/' na callbackUrl)." -ForegroundColor Yellow
        continue
    }

    if ($content -notmatch [regex]::Escape($oldText)) {
        Write-Host "ERROR: Hindi nahanap ang '$oldText' sa $rel. Baka naiba na ang file. Wala munang binago dito." -ForegroundColor Red
        $anyError = $true
        continue
    }

    # Backup muna
    $backupPath = "$path.bak"
    Copy-Item -Path $path -Destination $backupPath -Force

    $newContent = $content.Replace($oldText, $newText)
    Set-Content -Path $path -Value $newContent -NoNewline

    Write-Host "OK: $rel -- pinalitan ang callbackUrl papunta sa '/' (backup: $backupPath)" -ForegroundColor Green
}

Write-Host ""
if ($anyError) {
    Write-Host "May mga file na hindi na-patch dahil sa error sa itaas. Suriin muna bago mag-restart." -ForegroundColor Yellow
} else {
    Write-Host "===== TAPOS NA =====" -ForegroundColor Cyan
    Write-Host "Sunod na hakbang:" -ForegroundColor White
    Write-Host "  1. I-restart ang dev server mo (Ctrl+C, tapos: npm run dev)" -ForegroundColor White
    Write-Host "  2. Mag-login, tapos i-click ang 'Logout'" -ForegroundColor White
    Write-Host "  3. Dapat babalik ka sa landing page ('/') imbes na sa /login" -ForegroundColor White
}
