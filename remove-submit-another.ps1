# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# Tatanggalin nito yung "Submit Another Application" button sa success screen
# ng src\app\apply\page.tsx. May backup na kinukuha muna bago mag-overwrite.

$target = "src\app\apply\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito. Siguraduhing nasa project root ka." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw

if ($content -notmatch "Submit Another Application") {
    Write-Host "Hindi nahanap yung 'Submit Another Application' sa file -- baka tinanggal na, o iba ang laman ngayon." -ForegroundColor Yellow
    exit 0
}

# Match the whole <button ...> ... Submit Another Application ... </button> block
$pattern = '(?s)\s*<button\s[^>]*>\s*\{ setSubmitted\(false\)[\s\S]*?Submit Another Application\s*</button>'

if ($content -notmatch $pattern) {
    Write-Host "Nakita yung text pero hindi ma-match yung buong <button> block automatically." -ForegroundColor Yellow
    Write-Host "Kailangan mo na lang manual na tanggalin, o i-paste dito sa akin yung 100 lines sa paligid ng 'Submit Another Application' para tulungan kita." -ForegroundColor Yellow
    exit 1
}

Copy-Item $target "$target.bak" -Force

$newContent = [regex]::Replace($content, $pattern, '')
Set-Content -Path $target -Value $newContent -NoNewline

Write-Host "OK: tinanggal ang 'Submit Another Application' button (backup: $target.bak)" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. Mag-apply at mag-submit ulit -- dapat wala nang 'Submit Another Application' sa success screen"
