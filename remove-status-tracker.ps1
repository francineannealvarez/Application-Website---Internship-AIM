# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# Tinatanggal nito yung buong "Application Tracking" (Status Tracker) section
# sa landing page, pati yung mga constants/state na ginagamit lang doon
# (STATUS_STEPS, activeStatus). May backup bago mag-overwrite.

$target = "src\app\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw
$failures = @()

function DoReplaceLiteral {
    param([string]$Old, [string]$New, [string]$LabelName)
    $count = 0
    $idx = 0
    while (($idx = $script:content.IndexOf($Old, $idx)) -ge 0) { $count++; $idx += $Old.Length }
    if ($count -eq 1) {
        $script:content = $script:content.Replace($Old, $New)
        Write-Host "OK: $LabelName" -ForegroundColor Green
    } elseif ($count -eq 0) {
        Write-Host "MISSING: $LabelName (hindi nahanap)" -ForegroundColor Red
        $script:failures += $LabelName
    } else {
        Write-Host "UNEXPECTED COUNT: $LabelName (nahanap ng $count)" -ForegroundColor Yellow
        $script:failures += $LabelName
    }
}

function DoReplaceRegex {
    param([string]$Pattern, [string]$New, [string]$LabelName)
    $m = [regex]::Matches($script:content, $Pattern, 'Singleline')
    if ($m.Count -eq 1) {
        $script:content = [regex]::Replace($script:content, $Pattern, $New, 'Singleline')
        Write-Host "OK: $LabelName" -ForegroundColor Green
    } elseif ($m.Count -eq 0) {
        Write-Host "MISSING: $LabelName (hindi nahanap)" -ForegroundColor Red
        $script:failures += $LabelName
    } else {
        Write-Host "AMBIGUOUS: $LabelName (nahanap ng $($m.Count))" -ForegroundColor Yellow
        $script:failures += $LabelName
    }
}

if ($content -notmatch "STATUS TRACKER") {
    Write-Host "SKIP: mukhang tinanggal na dati yung Status Tracker section." -ForegroundColor Yellow
    exit 0
}

# 1. Remove the entire Status Tracker section (up to, not including, the ABOUT section comment)
$pattern1 = "\{/\* ── STATUS TRACKER \(illustrative preview\) ── \*/\}[\s\S]*?(?=\{/\* ── ABOUT ── \*/\})"
DoReplaceRegex -Pattern $pattern1 -New "" -LabelName "remove Status Tracker section"

# 2. Remove now-unused STATUS_STEPS constant
$pattern2 = "const STATUS_STEPS = \['Submitted', 'Under Review', 'Result'\];\s*\n"
DoReplaceRegex -Pattern $pattern2 -New "" -LabelName "remove STATUS_STEPS constant"

# 3. Remove now-unused activeStatus state
$pattern3 = "[ \t]*const \[activeStatus\] = useState\(1\);\s*\n"
DoReplaceRegex -Pattern $pattern3 -New "" -LabelName "remove activeStatus state"

if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "May $($failures.Count) hindi na-apply na pagbabago:" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "WALANG na-save na file. I-paste mo sakin itong output para maayos ko." -ForegroundColor Yellow
    exit 1
}

Copy-Item $target "$target.bak4" -Force
Set-Content -Path $target -Value $content -NoNewline

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak4" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. I-refresh yung landing page -- dapat wala nang 'Application Tracking' section,"
Write-Host "     diretso na from 'How It Works' papunta sa 'About Arvin International'"
