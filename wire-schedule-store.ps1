# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# BEFORE running this: copy schedule-store.ts (downloaded separately) into
#   src\lib\schedule-store.ts
#
# Ginagawang basahin muna ni StepDetailContent yung stored schedule (mula sa
# bagong schedule-store.ts) bago mag-fallback sa hardcoded STEP_DETAILS
# date/time. Hindi ginagalaw yung venue/platform/instructions.
#
# May backup bago mag-overwrite.

$target = "src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "src\lib\schedule-store.ts")) {
    Write-Host "ERROR: Wala kang src\lib\schedule-store.ts. I-copy muna yung na-download na file doon bago i-run ito." -ForegroundColor Red
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

if ($content -match "readStepSchedule") {
    Write-Host "SKIP: mukhang nailagay na dati yung schedule-store wiring." -ForegroundColor Yellow
    exit 0
}

$failures = @()

# 1. Add import after the BackgroundCheckContent import
$oldImport = "import BackgroundCheckContent from '@/components/dashboard/BackgroundCheckContent';"
$newImport = "import BackgroundCheckContent from '@/components/dashboard/BackgroundCheckContent';`nimport { readStepSchedule, type StepSchedule } from '@/lib/schedule-store';"
$c1 = CountOccurrences -Haystack $content -Needle $oldImport
if ($c1 -eq 1) {
    $content = $content.Replace($oldImport, $newImport)
    Write-Host "OK: naidagdag yung schedule-store import" -ForegroundColor Green
} else {
    Write-Host "MISSING/AMBIGUOUS: import line (nahanap ng $c1)" -ForegroundColor Red
    $failures += "import line"
}

# 2. Replace the whole StepDetailContent function
$oldFn = @'
function StepDetailContent({ stepIdx, isCurrent }: { stepIdx: number; isCurrent: boolean }) {
  const detail = STEP_DETAILS[stepIdx];
  if (!detail) return null;
  return (
    <div className="space-y-3 pt-3">
      <div className="flex items-center gap-2.5 text-sm text-[#0B2A4A]">
        <Calendar className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
        {detail.date ? (
          <span><span className="font-semibold">{detail.date}</span><span style={{ color: '#6B7A8D' }}> at {detail.time}</span></span>
        ) : (
          <span style={{ color: '#6B7A8D' }}>Schedule to be announced by HR</span>
        )}
      </div>
      {detail.venue ? (
        <div className="flex items-start gap-2.5 text-sm text-[#0B2A4A]"><MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} /><span>{detail.venue}</span></div>
      ) : detail.platform ? (
        <div className="flex items-center gap-2.5 text-sm"><Link2 className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} /><a href={detail.platform} target="_blank" rel="noreferrer" className="hover:underline truncate" style={{ color: '#12B6D6' }}>{detail.platform}</a></div>
      ) : null}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-sm text-amber-800">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><span>{detail.instructions}</span>
      </div>
      {isCurrent && (
        <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC', color: '#6B7A8D' }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: '#9BAAB8' }} /><span>Awaiting HR confirmation. HR will mark this step as complete once finished.</span>
        </div>
      )}
    </div>
  );
}
'@

$newFn = @'
function StepDetailContent({ stepIdx, isCurrent }: { stepIdx: number; isCurrent: boolean }) {
  const detail = STEP_DETAILS[stepIdx];
  if (!detail) return null;
  const stepKey = stepIdx === 0 ? 'initial-interview' : 'department-interview';
  const [schedule] = useState<StepSchedule | null>(() => (typeof window !== 'undefined' ? readStepSchedule(stepKey) : null));
  const displayDate = schedule?.date ?? detail.date;
  const displayTime = schedule?.time ?? detail.time;
  return (
    <div className="space-y-3 pt-3">
      <div className="flex items-center gap-2.5 text-sm text-[#0B2A4A]">
        <Calendar className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
        {displayDate ? (
          <span><span className="font-semibold">{displayDate}</span><span style={{ color: '#6B7A8D' }}> at {displayTime}</span></span>
        ) : (
          <span style={{ color: '#6B7A8D' }}>Schedule to be announced by HR</span>
        )}
      </div>
      {detail.venue ? (
        <div className="flex items-start gap-2.5 text-sm text-[#0B2A4A]"><MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#12B6D6' }} /><span>{detail.venue}</span></div>
      ) : detail.platform ? (
        <div className="flex items-center gap-2.5 text-sm"><Link2 className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} /><a href={detail.platform} target="_blank" rel="noreferrer" className="hover:underline truncate" style={{ color: '#12B6D6' }}>{detail.platform}</a></div>
      ) : null}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-sm text-amber-800">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><span>{detail.instructions}</span>
      </div>
      {isCurrent && (
        <div className="flex items-center gap-2.5 rounded-xl p-3.5 text-sm" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC', color: '#6B7A8D' }}>
          <Clock className="w-4 h-4 shrink-0" style={{ color: '#9BAAB8' }} /><span>Awaiting HR confirmation. HR will mark this step as complete once finished.</span>
        </div>
      )}
    </div>
  );
}
'@

$c2 = CountOccurrences -Haystack $content -Needle $oldFn
if ($c2 -eq 1) {
    $content = $content.Replace($oldFn, $newFn)
    Write-Host "OK: na-update yung StepDetailContent function" -ForegroundColor Green
} else {
    Write-Host "MISSING/AMBIGUOUS: StepDetailContent function (nahanap ng $c2)" -ForegroundColor Red
    $failures += "StepDetailContent function"
}

if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "WALANG na-save na file dahil sa $($failures.Count) hindi na-apply na pagbabago:" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "I-paste mo sakin itong output." -ForegroundColor Yellow
    exit 1
}

Copy-Item $target "$target.bak6" -Force
Set-Content -Path $target -Value $content -NoNewline -Encoding UTF8

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak6" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. Habang wala pang HR-side UI, pwede mo munang subukan sa browser console (F12):"
Write-Host "     localStorage.setItem('hiringSchedule_initial-interview', JSON.stringify({date: 'July 20, 2026', time: '10:00 AM'}))"
Write-Host "  3. I-refresh yung dashboard -- dapat lumabas na yung totoong petsa/oras"
