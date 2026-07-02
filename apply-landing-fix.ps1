# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# Ipapalit nito yung src\app\page.tsx gamit yung na-download mong bagong page.tsx
# (galing sa Downloads folder). May backup na kinukuha muna bago mag-overwrite.

$target = "src\app\page.tsx"
$source = "$env:USERPROFILE\Downloads\page.tsx"

if (-not (Test-Path $source)) {
    Write-Host "ERROR: Hindi mahanap ang $source. I-download muna yung page.tsx galing sa chat." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito. Siguraduhing nasa project root ka." -ForegroundColor Red
    exit 1
}

Copy-Item $target "$target.bak" -Force
Copy-Item $source $target -Force

Write-Host "OK: pinalitan ang $target (backup: $target.bak)" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. Sa landing page, i-click yung 'Log In' -- dapat pumunta sa /login (totoong login page, walang Demo Mode)"
Write-Host "  3. I-click yung 'Register' o 'Create an Account' -- dapat pumunta sa /register"
Write-Host "  4. Mag-apply, mag-submit, click 'Go to My Dashboard' -- dapat gumana pa rin gaya ng dati"
Write-Host "  5. Sa dashboard, click 'Logout' -- dapat babalik sa landing page ('/')"
