# ============================================================
# apply-pds-autofill-sketch.ps1
# 1. Auto-fills Date Applied & Position Applied For from the
#    application data (read-only, since it's automatic now)
# 2. Adds a residence sketch upload, placed before the
#    Certification & E-Signature section
# ============================================================

$target = ".\src\components\dashboard\PersonalDataSheetContent.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\PersonalDataSheetContent.backup-autofill-$timestamp.tsx"
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

# ---------- PATCH 1: import readDemoApplication ----------
$old1 = @'
'use client';

import { useState, useRef, useEffect } from 'react';
'@
$new1 = @'
'use client';

import { useState, useRef, useEffect } from 'react';
import { readDemoApplication } from '@/lib/demo-session';
'@
Apply-Patch -Name "1. Import readDemoApplication" -Old $old1 -New $new1

# ---------- PATCH 2: import Upload icon ----------
$old2 = @'
import {
  ChevronDown, Check, Clock, AlertCircle, User, Users, GraduationCap,
  Briefcase, Phone, Shield, HeartPulse, ClipboardList, PenLine, Info
} from 'lucide-react';
'@
$new2 = @'
import {
  ChevronDown, Check, Clock, AlertCircle, User, Users, GraduationCap,
  Briefcase, Phone, Shield, HeartPulse, ClipboardList, PenLine, Info, Upload
} from 'lucide-react';
'@
Apply-Patch -Name "2. Import Upload icon" -Old $old2 -New $new2

# ---------- PATCH 3: add sketch upload state (after signature state) ----------
$old3 = @'
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const handleSignatureFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSignatureImage(reader.result as string);
    reader.readAsDataURL(file);
  };
'@
$new3 = @'
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const handleSignatureFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSignatureImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [sketchFileName, setSketchFileName] = useState('');
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const handleSketchFile = (file: File) => {
    setSketchFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setSketchImage(reader.result as string);
    reader.readAsDataURL(file);
  };
'@
Apply-Patch -Name "3. Add residence sketch upload state" -Old $old3 -New $new3

# ---------- PATCH 4: auto-fill useEffect ----------
$old4 = "  const f = (v: string) => v.trim().length > 0;"
$new4 = @'
  useEffect(() => {
    const app = readDemoApplication();
    if (app) {
      if (app.positionTitle) setPositionApplied(app.positionTitle);
      if (app.submittedAt) setDateApplied(app.submittedAt.slice(0, 10));
    }
  }, []);

  const f = (v: string) => v.trim().length > 0;
'@
Apply-Patch -Name "4. Auto-fill Date Applied / Position Applied useEffect" -Old $old4 -New $new4

# ---------- PATCH 5: make Date Applied / Position Applied read-only ----------
$old5 = @'
          <TextField label="Date Applied" type="date" value={dateApplied} onChange={setDateApplied} />
          <Select label="Position Applied For" value={positionApplied} onChange={setPositionApplied}
            options={AVAILABLE_POSITIONS} placeholder="Select from currently available positions" />
'@
$new5 = @'
          <div>
            <Label>Date Applied</Label>
            <div className={inputCls} style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>
              {dateApplied || 'Auto-filled from your application'}
            </div>
          </div>
          <div>
            <Label>Position Applied For</Label>
            <div className={inputCls} style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}>
              {positionApplied || 'Auto-filled from your application'}
            </div>
          </div>
'@
Apply-Patch -Name "5. Date Applied / Position Applied: read-only, auto-filled" -Old $old5 -New $new5

# ---------- PATCH 6: remove old sketch-note-only block ----------
$old6 = @'
      <div className="flex items-start gap-2.5 rounded-xl p-3 text-xs" style={{ backgroundColor: T.bg, color: T.gray }}>
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: T.faint }} />
        <span>A sketch of your residence (going to/from AIMI or your area of assignment) may be requested separately by HR on a hard copy sheet.</span>
      </div>

      {!canSubmit && missingSections.length > 0 && (
'@
$new6 = @'
      {!canSubmit && missingSections.length > 0 && (
'@
Apply-Patch -Name "6. Remove old sketch-note text block" -Old $old6 -New $new6

# ---------- PATCH 7: insert sketch upload before Certification section ----------
$old7 = '<Section id="certify" icon={PenLine} title="Certification & E-Signature" subtitle="Required before you can submit" openId={openId} setOpenId={setOpenId}>'
$new7 = @'
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
Apply-Patch -Name "7. Insert residence sketch upload before Certification section" -Old $old7 -New $new7

Set-Content -Path $target -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 7 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED patches (paste this back to Claude):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
