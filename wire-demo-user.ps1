# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# Idinadagdag nito yung writeDemoUser() call pagkatapos mag-submit ng
# application form, para makita yung "Welcome back" dashboard imbes na
# ma-redirect pabalik sa /login. May backup bago mag-overwrite.

$target = "src\app\apply\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito. Siguraduhing nasa project root ka." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw

$importOld = 'import { Inter } from "next/font/google";'
$importNew = 'import { Inter } from "next/font/google";' + "`r`n" + 'import { writeDemoUser } from "@/lib/demo-session";'

$handleSubmitOld = @'
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };
'@

$handleSubmitNew = @'
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    writeDemoUser({ id: "2", name: form.fullName, email: form.email, role: "APPLICANT" });
    setSubmitted(true);
  };
'@

if ($content -notmatch [regex]::Escape($importOld)) {
    Write-Host "Hindi nahanap yung import line -- baka naiba na yung file. I-paste mo sakin yung unang 20 lines ng file." -ForegroundColor Yellow
    exit 1
}

if ($content -notmatch [regex]::Escape($handleSubmitOld)) {
    Write-Host "Hindi nahanap yung handleSubmit function -- baka naiba na yung file." -ForegroundColor Yellow
    Write-Host "I-run mo: Get-Content 'src\app\apply\page.tsx' -Raw | Select-String -Pattern 'handleSubmit' -Context 0,6" -ForegroundColor Yellow
    exit 1
}

if ($content -match "writeDemoUser") {
    Write-Host "Mukhang nailagay na yung writeDemoUser dati. Wala nang gagawin." -ForegroundColor Yellow
    exit 0
}

Copy-Item $target "$target.bak" -Force

$newContent = $content.Replace($importOld, $importNew).Replace($handleSubmitOld, $handleSubmitNew)
Set-Content -Path $target -Value $newContent -NoNewline

Write-Host "OK: na-wire up na yung writeDemoUser sa apply/page.tsx (backup: $target.bak)" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. Mag-apply, mag-submit, click 'Go to My Dashboard'"
Write-Host "  3. Dapat makita mo na yung 'Welcome back' dashboard, hindi na babalik sa login"
