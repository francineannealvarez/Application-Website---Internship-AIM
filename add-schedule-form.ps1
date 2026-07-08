# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# Nagdadagdag ng maliit na "Save Schedule" form sa loob ng Initial Interview /
# Department Interview step -- may Date at Time input plus Save button, na
# pag pinindot ay agad na-sasave gamit yung schedule-store.ts at
# ipinapakita agad sa screen. Walang browser console/JavaScript typing na
# kailangan -- click lang sa button gaya ng normal na paggamit ng site.
#
# May backup bago mag-overwrite.

$target = "src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw

if ($content -match "handleSaveSchedule") {
    Write-Host "SKIP: mukhang nailagay na dati yung schedule form." -ForegroundColor Yellow
    exit 0
}

function CountOccurrences {
    param([string]$Haystack, [string]$Needle)
    if ($Needle.Length -eq 0) { return 0 }
    $count = 0
    $idx = 0
    while (($idx = $Haystack.IndexOf($Needle, $idx)) -ge 0) { $count++; $idx += $Needle.Length }
    return $count
}

$failures = @()

# 1. Update import to also bring in writeStepSchedule
$oldImport = "import { readStepSchedule, type StepSchedule } from '@/lib/schedule-store';"
$newImport = "import { readStepSchedule, writeStepSchedule, type StepSchedule } from '@/lib/schedule-store';"
$c1 = CountOccurrences -Haystack $content -Needle $oldImport
if ($c1 -eq 1) {
    $content = $content.Replace($oldImport, $newImport)
    Write-Host "OK: na-update yung import (naidagdag writeStepSchedule)" -ForegroundColor Green
} else {
    Write-Host "MISSING/AMBIGUOUS: import line (nahanap ng $c1)" -ForegroundColor Red
    $failures += "import line"
}

# 2. Replace StepDetailContent to add the editable schedule form
$oldFn = @'
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

$newFn = @'
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

$c2 = CountOccurrences -Haystack $content -Needle $oldFn
if ($c2 -eq 1) {
    $content = $content.Replace($oldFn, $newFn)
    Write-Host "OK: naidagdag yung Save Schedule form" -ForegroundColor Green
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

Copy-Item $target "$target.bak7" -Force
Set-Content -Path $target -Value $content -NoNewline -Encoding UTF8

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak7" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. Sa Hiring Process, i-click yung 'Initial Interview'"
Write-Host "  3. Makikita mo na yung Date/Time input fields -- i-type mo lang halimbawa 'July 20, 2026'"
Write-Host "     at '10:00 AM', tapos i-click yung 'Save Schedule' button"
Write-Host "  4. Dapat agad magpalit yung display sa itaas mula 'Schedule to be announced by HR'"
Write-Host "     papunta sa totoong petsa/oras -- walang console/JavaScript na kailangan"
