# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# 1. Inaayos LAHAT ng corrupted/mojibake characters sa buong file (em dash,
#    atbp.) gamit ang encoding round-trip fix -- isang pass, saklaw lahat.
# 2. Pinapalitan yung "Department Interview" label ng "Interview" lang
#    (parehong sa HIRING_STEPS at sa Proceed modal text).
# 3. Nagdadagdag ng "Face-to-Face" / "Online" badge na awtomatikong lalabas
#    base sa venue (physical) o platform (online link) na nilagay sa data.
#
# May backup bago mag-overwrite. Sini-save gamit ang UTF-8 na walang BOM.

$target = "src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw -Encoding UTF8
$failures = @()

function CountOccurrences {
    param([string]$Haystack, [string]$Needle)
    if ($Needle.Length -eq 0) { return 0 }
    $count = 0
    $idx = 0
    while (($idx = $Haystack.IndexOf($Needle, $idx)) -ge 0) { $count++; $idx += $Needle.Length }
    return $count
}

# --- Step 1: Fix mojibake via encoding round-trip ---
$cp1252 = [System.Text.Encoding]::GetEncoding(1252)
$utf8 = [System.Text.Encoding]::UTF8

$beforeCount = ([regex]::Matches($content, [char]0x00E2)).Count
if ($beforeCount -gt 0) {
    $fixedBytes = $cp1252.GetBytes($content)
    $fixedContent = $utf8.GetString($fixedBytes)
    $afterCount = ([regex]::Matches($fixedContent, [char]0x00E2)).Count

    Write-Host "Mojibake markers bago i-fix: $beforeCount" -ForegroundColor Cyan
    Write-Host "Mojibake markers pagkatapos i-fix: $afterCount" -ForegroundColor Cyan

    if ($afterCount -ge $beforeCount) {
        Write-Host "WARNING: hindi bumaba yung corruption count. Hindi ko isa-save, i-paste mo sakin itong output." -ForegroundColor Red
        exit 1
    }
    $content = $fixedContent
    Write-Host "OK: na-fix yung character encoding" -ForegroundColor Green
} else {
    Write-Host "SKIP: walang mojibake markers na nahanap, malinis na yung encoding." -ForegroundColor Yellow
}

# --- Step 2: Rename "Department Interview" to "Interview" ---
$old2a = "{ label: 'Department Interview', sublabel: 'With Department Head', Icon: Users },"
$new2a = "{ label: 'Interview', sublabel: 'With Department Head', Icon: Users },"
$c2a = CountOccurrences -Haystack $content -Needle $old2a
if ($c2a -eq 1) {
    $content = $content.Replace($old2a, $new2a)
    Write-Host "OK: pinalitan yung HIRING_STEPS label -> 'Interview'" -ForegroundColor Green
} else {
    Write-Host "MISSING/AMBIGUOUS: HIRING_STEPS label (nahanap ng $c2a)" -ForegroundColor Red
    $failures += "HIRING_STEPS label"
}

$old2b = '<strong className="text-[#0B2A4A]">Department Interview</strong>'
$new2b = '<strong className="text-[#0B2A4A]">Interview</strong>'
$c2b = CountOccurrences -Haystack $content -Needle $old2b
if ($c2b -eq 1) {
    $content = $content.Replace($old2b, $new2b)
    Write-Host "OK: pinalitan yung Proceed modal text -> 'Interview'" -ForegroundColor Green
} else {
    Write-Host "MISSING/AMBIGUOUS: Proceed modal text (nahanap ng $c2b)" -ForegroundColor Red
    $failures += "Proceed modal text"
}

# --- Step 3: Add Face-to-Face / Online badges ---
$old3 = @'
      {detail.venue ? (
        <div className="flex items-start gap-2.5 text-sm text-[#0B2A4A]"><MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} /><span>{detail.venue}</span></div>
      ) : detail.platform ? (
        <div className="flex items-center gap-2.5 text-sm"><Link2 className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} /><a href={detail.platform} target="_blank" rel="noreferrer" className="hover:underline truncate" style={{ color: '#12B6D6' }}>{detail.platform}</a></div>
      ) : null}
'@

$new3 = @'
      {detail.venue ? (
        <div className="flex items-start gap-2.5 text-sm text-[#0B2A4A]">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
          <span>
            <span className="inline-block mr-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF9FB', color: '#12B6D6' }}>Face-to-Face</span>
            {detail.venue}
          </span>
        </div>
      ) : detail.platform ? (
        <div className="flex items-start gap-2.5 text-sm">
          <Link2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
          <span>
            <span className="inline-block mr-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF9FB', color: '#12B6D6' }}>Online</span>
            <a href={detail.platform} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: '#12B6D6' }}>{detail.platform}</a>
          </span>
        </div>
      ) : null}
'@

$c3 = CountOccurrences -Haystack $content -Needle $old3
if ($c3 -eq 1) {
    $content = $content.Replace($old3, $new3)
    Write-Host "OK: naidagdag yung Face-to-Face / Online badges" -ForegroundColor Green
} else {
    Write-Host "MISSING/AMBIGUOUS: venue/platform block (nahanap ng $c3)" -ForegroundColor Red
    $failures += "venue/platform block"
}

if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "May $($failures.Count) hindi na-apply na pagbabago:" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "WALANG na-save na file. I-paste mo sakin itong output." -ForegroundColor Yellow
    exit 1
}

Copy-Item $target "$target.bak9" -Force
[System.IO.File]::WriteAllText((Resolve-Path $target), $content, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak9" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. I-refresh yung dashboard -- dapat 'Interview' na lang yung label, tama na yung"
Write-Host "     mga dash/tuldok characters, at may 'Face-to-Face' o 'Online' badge na sa"
Write-Host "     Initial Interview at Interview steps"
Write-Host ""
Write-Host "Para palitan sa hinaharap kung Face-to-Face o Online ang isang step, i-edit lang"
Write-Host "yung STEP_DETAILS array: lagyan ng address yung 'venue' field para Face-to-Face,"
Write-Host "o lagyan ng link yung 'platform' field para Online (isa lang dapat may value)."
