# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# Pinapalitan nito yung date/time block sa StepDetailContent para laging
# lumabas ang schedule line -- magpapakita ng "Schedule to be announced by
# HR" placeholder kapag walang petsa pa, at automatic magpapalit sa totoong
# date/time kapag na-update na ni HR yung values sa STEP_DETAILS array.
# Hindi ginagalaw yung instructions/notes text.
#
# May backup bago mag-overwrite.

$target = "src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw

function CountOccurrences {
    param([string]$Haystack, [string]$Needle)
    if ($Needle.Length -eq 0) { return 0 }
    $count = 0
    $idx = 0
    while (($idx = $Haystack.IndexOf($Needle, $idx)) -ge 0) { $count++; $idx += $Needle.Length }
    return $count
}

if ($content -match "Schedule to be announced by HR") {
    Write-Host "SKIP: mukhang nailagay na dati yung schedule placeholder." -ForegroundColor Yellow
    exit 0
}

$old = @'
      {detail.date && (
        <div className="flex items-center gap-2.5 text-sm text-[#0B2A4A]">
          <Calendar className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
          <span><span className="font-semibold">{detail.date}</span><span style={{ color: '#6B7A8D' }}> at {detail.time}</span></span>
        </div>
      )}
'@

$new = @'
      <div className="flex items-center gap-2.5 text-sm text-[#0B2A4A]">
        <Calendar className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
        {detail.date ? (
          <span><span className="font-semibold">{detail.date}</span><span style={{ color: '#6B7A8D' }}> at {detail.time}</span></span>
        ) : (
          <span style={{ color: '#6B7A8D' }}>Schedule to be announced by HR</span>
        )}
      </div>
'@

$count = CountOccurrences -Haystack $content -Needle $old
if ($count -eq 1) {
    $content = $content.Replace($old, $new)
    Write-Host "OK: naidagdag na yung schedule placeholder" -ForegroundColor Green
} elseif ($count -eq 0) {
    Write-Host "MISSING: hindi nahanap yung date block. WALANG na-save na file." -ForegroundColor Red
    Write-Host "I-paste mo sakin itong output:" -ForegroundColor Yellow
    Write-Host "Get-Content `"src\app\dashboard\page.tsx`" -Raw | Select-String -Pattern 'detail.date' -Context 2,4" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "AMBIGUOUS: nahanap ng $count beses. WALANG na-save na file." -ForegroundColor Red
    exit 1
}

Copy-Item $target "$target.bak5" -Force
Set-Content -Path $target -Value $content -NoNewline -Encoding UTF8

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak5" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. Sa Hiring Process, i-click yung 'Initial Interview' -- dapat may 'Schedule to be"
Write-Host "     announced by HR' na line na ngayon, bago pa yung yellow notes banner"
Write-Host ""
Write-Host "Para lagyan ni HR ng totoong petsa/oras sa hinaharap, i-edit lang yung STEP_DETAILS"
Write-Host "array sa taas ng file (yung entry na may index 0, para sa Initial Interview):"
Write-Host "  date: 'July 20, 2026', time: '10:00 AM'"
