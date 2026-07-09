# ============================================================
# apply-pds-refinements.ps1
# 1. Makes the residence sketch upload small/compact, placed
#    side-by-side with the E-Signature upload inside the
#    Certification & E-Signature section (removes any earlier
#    large standalone sketch block).
# 2. Moves "Why did you take up this course?" to right after
#    the College row (instead of after all education levels).
# Safe to run whether or not you already applied the earlier
# sketch-upload script - it detects the current state.
# ============================================================

$target = ".\src\components\dashboard\PersonalDataSheetContent.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\PersonalDataSheetContent.backup-refine-$timestamp.tsx"
Copy-Item $target $backupPath
Write-Host "Backup saved to: $backupPath" -ForegroundColor Cyan

$content = Get-Content -Path $target -Raw
$failedPatches = @()
$appliedCount = 0

function Apply-Patch {
    param([string]$Name, [string]$Old, [string]$New)
    if ($content.Contains($Old)) {
        $script:content = $content.Replace($Old, $New)
        Write-Host "  [OK] $Name" -ForegroundColor Green
        $script:appliedCount++
    } else {
        Write-Host "  [SKIPPED - pattern not found] $Name" -ForegroundColor Yellow
        $script:failedPatches += $Name
    }
}

Write-Host "`nApplying patches..." -ForegroundColor Cyan

# ---------- GUARD: only add sketch state if not already present ----------
$hasSketchState = $content.Contains('const [sketchImage, setSketchImage]')
if (-not $hasSketchState) {
    $oldState = @'
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const handleSignatureFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSignatureImage(reader.result as string);
    reader.readAsDataURL(file);
  };
'@
    $newState = @'
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const handleSignatureFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSignatureImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const handleSketchFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSketchImage(reader.result as string);
    reader.readAsDataURL(file);
  };
'@
    Apply-Patch -Name "1. Add sketch upload state (was missing)" -Old $oldState -New $newState
} else {
    Write-Host "  [SKIP] 1. Sketch state already exists, no need to add" -ForegroundColor Gray
}

# ---------- Remove old large standalone sketch block (if it exists) ----------
$oldBigBlock = @'
<div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: T.bg }}>
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: T.faint }} />
          <div>
            <Label>Sketch of Your Residence (going to/from AIMI or your area of assignment)</Label>
            <p className="text-xs mt-0.5" style={{ color: T.gray }}>Draw this on paper and upload a photo, or HR may request a hard copy separately.</p>
          </div>
        </div>
        <input ref={sketchInputRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleSketchFile(file); }} />
        {!sketchImage ? (
          <button type="button" onClick={() => sketchInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-1.5 py-6 rounded-xl border-2 border-dashed hover:bg-black/[0.02] transition-colors">
            <Upload className="w-5 h-5" style={{ color: T.faint }} />
            <span className="text-xs font-medium" style={{ color: T.gray }}>Upload a photo of your residence sketch</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sketchImage} alt="Residence sketch" className="h-20 object-contain rounded" />
            <div className="flex-1 min-w-0 text-xs truncate" style={{ color: T.gray }}>{sketchFileName}</div>
            <button type="button" onClick={() => { setSketchImage(null); setSketchFileName(''); }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white hover:bg-black/5 shrink-0" style={{ color: T.gray }}>
              x
            </button>
          </div>
        )}
      </div>

      <Section id="certify" icon={PenLine} title="Certification & E-Signature" subtitle="Required before you can submit" openId={openId} setOpenId={setOpenId}>
'@
$newBigBlock = '<Section id="certify" icon={PenLine} title="Certification & E-Signature" subtitle="Required before you can submit" openId={openId} setOpenId={setOpenId}>'
Apply-Patch -Name "2. Remove old large standalone sketch block (if present)" -Old $oldBigBlock -New $newBigBlock

# ---------- Remove old note-only text (original, if autofill script never ran) ----------
$oldNote = @'
      <div className="flex items-start gap-2.5 rounded-xl p-3 text-xs" style={{ backgroundColor: T.bg, color: T.gray }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: T.faint }} />
        <span>A sketch of your residence (going to/from AIMI or your area of assignment) may be requested separately by HR on a hard copy sheet.</span>
      </div>

      {!canSubmit && missingSections.length > 0 && (
'@
$newNote = '      {!canSubmit && missingSections.length > 0 && ('
Apply-Patch -Name "3. Remove old note-only text block (if present)" -Old $oldNote -New $newNote

# ---------- Integrate compact sketch upload beside signature upload ----------
$oldCert = @'
        <div>
          <Label>Upload your Signature (image of your handwritten signature)</Label>
          <input ref={signatureInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleSignatureFile(file); }} />
          {!signatureImage ? (
            <button type="button" onClick={() => signatureInputRef.current?.click()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ color: T.cyan, borderColor: T.cyanBorder }}>
              Upload Signature
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-16 px-3 rounded-lg border flex items-center bg-white" style={{ borderColor: T.cyanBorder }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={signatureImage} alt="Uploaded signature" className="h-12 object-contain" />
              </div>
              <button type="button" onClick={() => signatureInputRef.current?.click()} className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Replace</button>
              <button type="button" onClick={() => setSignatureImage(null)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-black/5" style={{ color: T.gray }}>
                x
              </button>
            </div>
          )}
        </div>
      </Section>
'@
$newCert = @'
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label>Upload your Signature (image of your handwritten signature)</Label>
            <input ref={signatureInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleSignatureFile(file); }} />
            {!signatureImage ? (
              <button type="button" onClick={() => signatureInputRef.current?.click()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ color: T.cyan, borderColor: T.cyanBorder }}>
                Upload Signature
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-16 px-3 rounded-lg border flex items-center bg-white" style={{ borderColor: T.cyanBorder }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureImage} alt="Uploaded signature" className="h-12 object-contain" />
                </div>
                <button type="button" onClick={() => signatureInputRef.current?.click()} className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Replace</button>
                <button type="button" onClick={() => setSignatureImage(null)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-black/5" style={{ color: T.gray }}>
                  x
                </button>
              </div>
            )}
          </div>

          <div className="flex-1">
            <Label>Sketch of Your Residence (optional)</Label>
            <input ref={sketchInputRef} type="file" accept="image/*,.pdf" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleSketchFile(file); }} />
            {!sketchImage ? (
              <button type="button" onClick={() => sketchInputRef.current?.click()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border" style={{ color: T.cyan, borderColor: T.cyanBorder }}>
                Upload Sketch
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-16 px-3 rounded-lg border flex items-center bg-white" style={{ borderColor: T.cyanBorder }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sketchImage} alt="Residence sketch" className="h-12 object-contain" />
                </div>
                <button type="button" onClick={() => sketchInputRef.current?.click()} className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Replace</button>
                <button type="button" onClick={() => setSketchImage(null)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-black/5" style={{ color: T.gray }}>
                  x
                </button>
              </div>
            )}
          </div>
        </div>
      </Section>
'@
Apply-Patch -Name "4. Integrate compact sketch upload beside E-Signature" -Old $oldCert -New $newCert

# ---------- Move "Why did you take up this course?" after College row ----------
$oldEdu = @'
        {[
          { label: 'Elementary', state: eduElementary, set: setEduElementary },
          { label: 'Secondary', state: eduSecondary, set: setEduSecondary },
          { label: 'College', state: eduCollege, set: setEduCollege },
          { label: 'Post-Graduate', state: eduPostGrad, set: setEduPostGrad },
          { label: 'Vocational', state: eduVocational, set: setEduVocational },
        ].map(({ label, state, set }) => {
          const isNA = naEduLevels.includes(label);
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <Label>{label}</Label>
                <Checkbox label="N/A" checked={isNA} onChange={(checked) => {
                  setNaEduLevels((prev) => checked ? [...prev, label] : prev.filter((l) => l !== label));
                  if (checked) set({ school: '', years: '', degree: '', honors: '' });
                }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input value={state.school} disabled={isNA} onChange={(e) => set({ ...state, school: e.target.value })} placeholder="School and Address" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                <input value={state.years} disabled={isNA} onChange={(e) => set({ ...state, years: e.target.value })} placeholder="Years Attended (from–to)" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                <input value={state.degree} disabled={isNA} onChange={(e) => set({ ...state, degree: e.target.value })} placeholder="Degree/Major" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                <input value={state.honors} disabled={isNA} onChange={(e) => set({ ...state, honors: e.target.value })} placeholder="Academic Honors" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
              </div>
            </div>
          );
        })}
        {showWhyTookCourse && (
          <TextArea label="Why did you take up this course?" value={whyTookCourse} onChange={setWhyTookCourse} rows={2} />
        )}
'@
$newEdu = @'
        {[
          { label: 'Elementary', state: eduElementary, set: setEduElementary },
          { label: 'Secondary', state: eduSecondary, set: setEduSecondary },
          { label: 'College', state: eduCollege, set: setEduCollege },
          { label: 'Post-Graduate', state: eduPostGrad, set: setEduPostGrad },
          { label: 'Vocational', state: eduVocational, set: setEduVocational },
        ].map(({ label, state, set }) => {
          const isNA = naEduLevels.includes(label);
          return (
            <div key={label} className="contents">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>{label}</Label>
                  <Checkbox label="N/A" checked={isNA} onChange={(checked) => {
                    setNaEduLevels((prev) => checked ? [...prev, label] : prev.filter((l) => l !== label));
                    if (checked) set({ school: '', years: '', degree: '', honors: '' });
                  }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input value={state.school} disabled={isNA} onChange={(e) => set({ ...state, school: e.target.value })} placeholder="School and Address" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                  <input value={state.years} disabled={isNA} onChange={(e) => set({ ...state, years: e.target.value })} placeholder="Years Attended (from–to)" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                  <input value={state.degree} disabled={isNA} onChange={(e) => set({ ...state, degree: e.target.value })} placeholder="Degree/Major" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                  <input value={state.honors} disabled={isNA} onChange={(e) => set({ ...state, honors: e.target.value })} placeholder="Academic Honors" className={inputCls + ' text-xs disabled:opacity-40'} style={inputStyle} />
                </div>
              </div>
              {label === 'College' && showWhyTookCourse && (
                <TextArea label="Why did you take up this course?" value={whyTookCourse} onChange={setWhyTookCourse} rows={2} />
              )}
            </div>
          );
        })}
'@
Apply-Patch -Name "5. Move Why-took-course question after College row" -Old $oldEdu -New $newEdu

Set-Content -Path $target -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED (some of these are expected - see notes above):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
