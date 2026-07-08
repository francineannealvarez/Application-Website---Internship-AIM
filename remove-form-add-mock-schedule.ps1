# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# 1. Tinatanggal yung "Save Schedule" editable form sa applicant dashboard
#    (dapat HR/Admin lang ang naglalagay ng schedule, hindi applicant).
# 2. Naglalagay ng mock date/time sa STEP_DETAILS para may lumabas na
#    parang totoong schedule na, kahit hardcoded/mock data lang muna.
#
# Yung underlying schedule-store.ts (readStepSchedule/writeStepSchedule)
# hindi ginagalaw -- pwede pang gamitin sa susunod pag na-connect na sa
# totoong HR-side page. Dito lang natin tinanggal yung UI form na mali
# yung lugar (applicant view).
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

$failures = @()

# 1. Revert import back to read-only (remove writeStepSchedule, not needed anymore here)
$oldImport = "import { readStepSchedule, writeStepSchedule, type StepSchedule } from '@/lib/schedule-store';"
$newImport = "import { readStepSchedule, type StepSchedule } from '@/lib/schedule-store';"
$c1 = CountOccurrences -Haystack $content -Needle $oldImport
if ($c1 -eq 1) {
    $content = $content.Replace($oldImport, $newImport)
    Write-Host "OK: na-revert yung import" -ForegroundColor Green
} elseif ($c1 -eq 0) {
    Write-Host "SKIP: mukhang naiba na o wala na yung import na ito (baka OK na)." -ForegroundColor Yellow
} else {
    Write-Host "AMBIGUOUS: import line (nahanap ng $c1)" -ForegroundColor Red
    $failures += "import line"
}

# 2. Remove the editable form from StepDetailContent
$oldFn = @'
function StepDetailContent({ stepIdx, isCurrent }: { stepIdx: number; isCurrent: boolean }) {
  const detail = STEP_DETAILS[stepIdx];
  if (!detail) return null;
  const stepKey = stepIdx === 0 ? 'initial-interview' : 'department-interview';
  const [schedule, setSchedule] = useState<StepSchedule | null>(() => (typeof window !== 'undefined' ? readStepSchedule(stepKey) : null));
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const displayDate = schedule?.date ?? detail.date;
  const displayTime = schedule?.time ?? detail.time;

  const handleSaveSchedule = () => {
    if (!editDate.trim() || !editTime.trim()) return;
    const next: StepSchedule = { date: editDate.trim(), time: editTime.trim() };
    writeStepSchedule(stepKey, next);
    setSchedule(next);
    setEditDate('');
    setEditTime('');
  };

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
      <div className="flex flex-wrap items-end gap-2 rounded-xl p-3" style={{ backgroundColor: '#F7F9FA', border: '1px solid #E5E9EC' }}>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: '#0B2A4A' }}>Date</label>
          <input type="text" value={editDate} onChange={(e) => setEditDate(e.target.value)} placeholder="e.g. July 20, 2026"
            className="px-2.5 py-1.5 text-xs rounded-lg border outline-none" style={{ borderColor: '#E5E9EC', backgroundColor: '#fff', color: '#0B2A4A' }} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: '#0B2A4A' }}>Time</label>
          <input type="text" value={editTime} onChange={(e) => setEditTime(e.target.value)} placeholder="e.g. 10:00 AM"
            className="px-2.5 py-1.5 text-xs rounded-lg border outline-none" style={{ borderColor: '#E5E9EC', backgroundColor: '#fff', color: '#0B2A4A' }} />
        </div>
        <button type="button" onClick={handleSaveSchedule}
          className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 active:scale-95 transition-all" style={{ backgroundColor: '#0B2A4A' }}>
          Save Schedule
        </button>
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
    Write-Host "OK: tinanggal yung Save Schedule form sa applicant view" -ForegroundColor Green
} elseif ($c2 -eq 0) {
    Write-Host "MISSING: hindi nahanap yung StepDetailContent na may form. Baka naiba na yung file." -ForegroundColor Red
    $failures += "StepDetailContent function"
} else {
    Write-Host "AMBIGUOUS: nahanap ng $c2 beses." -ForegroundColor Red
    $failures += "StepDetailContent function"
}

# 3. Add mock date/time for the Initial Interview entry in STEP_DETAILS
$oldDetail = "{ date: null, time: null, venue: null, platform: null, instructions:"
$newDetail = "{ date: 'July 20, 2026', time: '10:00 AM', venue: null, platform: null, instructions:"
$c3 = CountOccurrences -Haystack $content -Needle $oldDetail
if ($c3 -eq 1) {
    $content = $content.Replace($oldDetail, $newDetail)
    Write-Host "OK: naglagay ng mock date/time sa STEP_DETAILS (Initial Interview)" -ForegroundColor Green
} elseif ($c3 -eq 0) {
    Write-Host "SKIP: mukhang meron na palang date/time dito (baka OK na)." -ForegroundColor Yellow
} else {
    Write-Host "AMBIGUOUS: STEP_DETAILS entry (nahanap ng $c3)" -ForegroundColor Red
    $failures += "STEP_DETAILS mock data"
}

if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "WALANG na-save na file dahil sa $($failures.Count) hindi na-apply na pagbabago:" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "I-paste mo sakin itong output." -ForegroundColor Yellow
    exit 1
}

Copy-Item $target "$target.bak8" -Force
Set-Content -Path $target -Value $content -NoNewline -Encoding UTF8

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak8" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. I-click yung 'Initial Interview' -- dapat makita mo na 'July 20, 2026 at 10:00 AM'"
Write-Host "     imbes na 'Schedule to be announced by HR', at wala na yung Save Schedule form"
Write-Host ""
Write-Host "Para baguhin yung mock date/time sa hinaharap, i-edit lang yung STEP_DETAILS array"
Write-Host "sa taas ng dashboard/page.tsx (i-search yung 'July 20, 2026')."
