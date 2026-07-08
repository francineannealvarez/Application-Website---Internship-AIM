$path = "src\app\dashboard\page.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Remove now-unused schedule-store import
$content = $content -replace [regex]::Escape("import { readStepSchedule, writeStepSchedule, type StepSchedule } from '@/lib/schedule-store';`r`n"), ""
$content = $content -replace [regex]::Escape("import { readStepSchedule, writeStepSchedule, type StepSchedule } from '@/lib/schedule-store';`n"), ""

# 2. Rename "Department Interview" -> "Interview" (step label)
$content = $content -replace [regex]::Escape("{ label: 'Department Interview', sublabel: 'With Department Head', Icon: Users },"), "{ label: 'Interview', sublabel: 'With Department Head', Icon: Users },"

# 3. Rename in confirmation paragraph
$content = $content -replace [regex]::Escape('<strong className="text-[#0B2A4A]">Department Interview</strong>'), '<strong className="text-[#0B2A4A]">Interview</strong>'

# 4. Fix mojibake dash/quote characters
$content = $content -replace 'â€"', [char]0x2014
$content = $content -replace 'â€™', [char]0x2019
$content = $content -replace 'â€œ', [char]0x201C
$content = $content -replace 'â€"', [char]0x2013
$content = $content -replace 'â”€', '-'

[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Simple replacements done. Now removing editable date/time UI block..."

# Normalize line endings to \n for reliable exact-match replacement
$content = $content -replace "`r`n", "`n"

$oldBlock = @'
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
'@

$newBlock = @'
function StepDetailContent({ stepIdx, isCurrent }: { stepIdx: number; isCurrent: boolean }) {
  const detail = STEP_DETAILS[stepIdx];
  if (!detail) return null;
  const displayDate = detail.date;
  const displayTime = detail.time;

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
'@

# Normalize the here-string block line endings too
$oldBlock = $oldBlock -replace "`r`n", "`n"
$newBlock = $newBlock -replace "`r`n", "`n"

if ($content.Contains($oldBlock)) {
    $content = $content.Replace($oldBlock, $newBlock)
    Write-Host "Block replacement: SUCCESS"
} else {
    Write-Host "Block replacement: NOT FOUND - no changes made to this block. Please check manually."
}

[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "All done."
