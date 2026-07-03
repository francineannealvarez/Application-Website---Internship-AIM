# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# Idinadagdag lang nito yung ClipboardList sa lucide-react imports.
# I-run mo ito, tapos i-run mo ulit yung add-pds-step-v2.ps1 para sa
# natitirang 9 na pagbabago.

$target = "src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw

if ($content -match "ClipboardList") {
    Write-Host "SKIP: nailagay na dati yung ClipboardList." -ForegroundColor Yellow
    exit 0
}

$count = ([regex]::Matches($content, [regex]::Escape("ClipboardCheck,"))).Count
if ($count -ne 1) {
    Write-Host "ERROR: nahanap ng $count beses yung 'ClipboardCheck,' -- dapat isa lang. Sabihin mo sakin." -ForegroundColor Red
    exit 1
}

Copy-Item $target "$target.bak2" -Force
$content = $content.Replace("ClipboardCheck,", "ClipboardCheck, ClipboardList,")
Set-Content -Path $target -Value $content -NoNewline

Write-Host "OK: naidagdag na yung ClipboardList import. Backup: $target.bak2" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod: i-run mo ulit yung add-pds-step-v2.ps1 para sa natitirang 9 na pagbabago."
