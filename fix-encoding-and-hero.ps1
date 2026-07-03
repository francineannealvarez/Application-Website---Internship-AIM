# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# 1. Inaayos LAHAT ng corrupted/mojibake characters sa file (em dash, ellipsis,
#    middle dot, diamond bullet, copyright, atbp.) gamit ang encoding
#    round-trip fix -- generic, saklaw lahat sa isang pass.
# 2. Tinatanggal yung "Create an Account" button sa hero section (Apply Now
#    na lang ang matitira).
#
# May backup bago mag-overwrite. Sini-save gamit ang UTF-8 NA WALANG BOM
# para hindi na maulit yung encoding issue sa susunod.

$target = "src\app\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito." -ForegroundColor Red
    exit 1
}

# Read as UTF8 to get the current (possibly mojibake) string correctly
$content = Get-Content $target -Raw -Encoding UTF8

# --- Step 1: Fix mojibake via encoding round-trip ---
# The corruption happened because original UTF-8 bytes got misread as
# Windows-1252 and re-saved as UTF-8. To reverse: encode the current
# (mojibake) string as Windows-1252 bytes, then decode those bytes as UTF-8.
$cp1252 = [System.Text.Encoding]::GetEncoding(1252)
$utf8 = [System.Text.Encoding]::UTF8

$beforeSample = $content.Substring(0, [Math]::Min(50, $content.Length))
$fixedBytes = $cp1252.GetBytes($content)
$fixedContent = $utf8.GetString($fixedBytes)

# Sanity check: count how many mojibake sequences remain before/after
$beforeCount = ([regex]::Matches($content, [char]0x00E2)).Count
$afterCount = ([regex]::Matches($fixedContent, [char]0x00E2)).Count

Write-Host "Mojibake markers bago i-fix: $beforeCount" -ForegroundColor Cyan
Write-Host "Mojibake markers pagkatapos i-fix: $afterCount" -ForegroundColor Cyan

if ($afterCount -gt 0 -and $afterCount -ge $beforeCount) {
    Write-Host "WARNING: mukhang hindi bumaba yung corruption count. Hindi ko isa-save, i-paste mo sakin itong output." -ForegroundColor Red
    exit 1
}

$content = $fixedContent
Write-Host "OK: na-fix yung character encoding" -ForegroundColor Green

# --- Step 2: Remove the "Create an Account" hero button ---
$buttonPattern = "<button[\s\S]{0,80}?onClick=\{\(\) => setAuthMode\('register'\)\}[\s\S]*?Create an Account\s*</button>\s*"
$m = [regex]::Matches($content, $buttonPattern, 'Singleline')
if ($m.Count -eq 1) {
    $content = [regex]::Replace($content, $buttonPattern, "", 'Singleline')
    Write-Host "OK: tinanggal yung Create an Account button sa hero" -ForegroundColor Green
} elseif ($m.Count -eq 0) {
    Write-Host "MISSING: hindi nahanap yung Create an Account button -- baka tinanggal na dati, o naiba na yung file." -ForegroundColor Yellow
} else {
    Write-Host "AMBIGUOUS: nahanap ng $($m.Count) beses -- ski-skip para hindi masira." -ForegroundColor Yellow
}

Copy-Item $target "$target.bak5" -Force

# Write without BOM to avoid re-triggering encoding issues
[System.IO.File]::WriteAllText((Resolve-Path $target), $content, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak5" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. I-refresh yung landing page -- dapat tama na yung mga tuldok/dash characters"
Write-Host "  3. Sa hero, dapat 'Apply Now' na lang ang button, wala nang 'Create an Account'"
