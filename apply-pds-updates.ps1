# ============================================================
# apply-pds-updates.ps1
# Auto-applies 4 changes to PersonalDataSheetContent.tsx:
#   1. Scroll-to-top fix when switching sections
#   2. Photo upload (with preview + confirm/replace)
#   3. E-signature image upload (with preview + replace)
#   4. Work experience default set to 3 companies (matches PDF)
#
# SAFE TO RUN: makes a timestamped backup copy before editing.
# Run this from the ROOT of your project (where package.json is).
# ============================================================

$target = ".\src\components\dashboard\PersonalDataSheetContent.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}

# --- Backup first ---
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\PersonalDataSheetContent.backup-$timestamp.tsx"
Copy-Item $target $backupPath
Write-Host "Backup saved to: $backupPath" -ForegroundColor Cyan

$content = Get-Content -Path $target -Raw

$failedPatches = @()
$appliedCount = 0

function Apply-Patch {
    param(
        [string]$Name,
        [string]$Old,
        [string]$New
    )
    $script:content_ref = $content
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

# ---------- PATCH 1a: import useRef, useEffect ----------
$old1a = "import { useState } from 'react';"
$new1a = "import { useState, useRef, useEffect } from 'react';"
Apply-Patch -Name "1a. Import useRef/useEffect" -Old $old1a -New $new1a

# ---------- PATCH 1b: Section auto-scroll ----------
$old1b = @'
function Section({ id, icon: Icon, title, subtitle, openId, setOpenId, children }: {
  id: string; icon: React.ElementType; title: string; subtitle: string;
  openId: string | null; setOpenId: (id: string | null) => void; children: React.ReactNode;
}) {
  const isOpen = openId === id;
  return (
    <div className="rounded-xl overflow-hidden" style={{}}>
'@
$new1b = @'
function Section({ id, icon: Icon, title, subtitle, openId, setOpenId, children }: {
  id: string; icon: React.ElementType; title: string; subtitle: string;
  openId: string | null; setOpenId: (id: string | null) => void; children: React.ReactNode;
}) {
  const isOpen = openId === id;
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [isOpen]);

  return (
    <div ref={sectionRef} className="rounded-xl overflow-hidden" style={{}}>
'@
Apply-Patch -Name "1b. Section auto-scroll-to-top" -Old $old1b -New $new1b

# ---------- PATCH 2a: photo state ----------
$old2a = "  const [healthIssues, setHealthIssues] = useState('');"
$new2a = @'
  const [healthIssues, setHealthIssues] = useState('');

  // -- Photo --
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const handlePhotoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result as string); setPhotoConfirmed(false); };
    reader.readAsDataURL(file);
  };
'@
Apply-Patch -Name "2a. Photo upload state" -Old $old2a -New $new2a

# ---------- PATCH 2b: photo validation check ----------
$old2b = "  check('Basic & Contact Information', 'Date Applied', f(dateApplied));"
$new2b = @'
  check('Basic & Contact Information', 'Photo (2x2 ID picture)', !!photo && photoConfirmed);
  check('Basic & Contact Information', 'Date Applied', f(dateApplied));
'@
Apply-Patch -Name "2b. Photo required-field check" -Old $old2b -New $new2b

# ---------- PATCH 2c: photo UI block ----------
$old2c = @'
      <Section id="basic" icon={User} title="Basic & Contact Information" subtitle="Name, address, birth details, government IDs" openId={openId} setOpenId={setOpenId}>
        <div className="grid grid-cols-2 gap-3">
'@
$new2c = @'
      <div className="rounded-xl p-4 flex items-center gap-4" style={{ backgroundColor: T.cyanBg }}>
        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 flex items-center justify-center shrink-0 bg-white" style={{ borderColor: T.cyanBorder }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Applicant 2x2 photo" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8" style={{ color: T.faint }} />
          )}
        </div>
        <div className="flex-1">
          <Label>2x2 ID Photo</Label>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePhotoFile(file); }} />
          {!photo ? (
            <button type="button" onClick={() => photoInputRef.current?.click()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-white" style={{ color: T.cyan, borderColor: T.cyanBorder }}>
              Upload Photo
            </button>
          ) : photoConfirmed ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                <Check className="w-3 h-3" /> Photo confirmed
              </span>
              <button type="button" onClick={() => photoInputRef.current?.click()} className="text-xs font-medium hover:underline" style={{ color: T.gray }}>Replace</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPhotoConfirmed(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: T.cyan }}>
                Use this photo
              </button>
              <button type="button" onClick={() => { setPhoto(null); setPhotoConfirmed(false); }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white hover:bg-black/5" style={{ color: T.gray }}>
                x
              </button>
            </div>
          )}
        </div>
      </div>

      <Section id="basic" icon={User} title="Basic & Contact Information" subtitle="Name, address, birth details, government IDs" openId={openId} setOpenId={setOpenId}>
        <div className="grid grid-cols-2 gap-3">
'@
Apply-Patch -Name "2c. Photo upload UI block" -Old $old2c -New $new2c

# ---------- PATCH 3a: signature state ----------
$old3a = @'
  const [certify, setCertify] = useState(false);
  const [eSignature, setESignature] = useState('');
'@
$new3a = @'
  const [certify, setCertify] = useState(false);
  const [eSignature, setESignature] = useState('');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const handleSignatureFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setSignatureImage(reader.result as string);
    reader.readAsDataURL(file);
  };
'@
Apply-Patch -Name "3a. Signature upload state" -Old $old3a -New $new3a

# ---------- PATCH 3b: signature validation check ----------
$old3b = @'
  check('Certification & E-Signature', 'Certification checkbox', certify);
  check('Certification & E-Signature', "Applicant's Signature", f(eSignature));
'@
$new3b = @'
  check('Certification & E-Signature', 'Certification checkbox', certify);
  check('Certification & E-Signature', "Applicant's Signature", f(eSignature));
  check('Certification & E-Signature', "Uploaded Signature Image", !!signatureImage);
'@
Apply-Patch -Name "3b. Signature required-field check" -Old $old3b -New $new3b

# ---------- PATCH 3c: signature UI block ----------
$old3c = @'
        <Checkbox label="I certify that the above information is true and correct to the best of my knowledge." checked={certify} onChange={setCertify} />
        <TextField label="Applicant's Signature (type your full name as e-signature)" value={eSignature} onChange={setESignature} placeholder="Juan Dela Cruz" />
      </Section>
'@
$new3c = @'
        <Checkbox label="I certify that the above information is true and correct to the best of my knowledge." checked={certify} onChange={setCertify} />
        <TextField label="Applicant's Signature (type your full name as e-signature)" value={eSignature} onChange={setESignature} placeholder="Juan Dela Cruz" />

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
Apply-Patch -Name "3c. Signature upload UI block" -Old $old3c -New $new3c

# ---------- PATCH 4: default 3 companies (matches PDF "at least 3") ----------
$old4 = "  const [jobs, setJobs] = useState<JobRow[]>([emptyJob, emptyJob]);"
$new4 = "  const [jobs, setJobs] = useState<JobRow[]>([emptyJob, emptyJob, emptyJob]);"
Apply-Patch -Name "4. Default to 3 companies (match PDF)" -Old $old4 -New $new4

# ---------- Save ----------
Set-Content -Path $target -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 8 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nThe following patches were SKIPPED (file content didn't match exactly," -ForegroundColor Yellow
    Write-Host "probably because the file was edited since this script was written):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host "`nPaste this whole message + the skipped patch names back to Claude for a fix." -ForegroundColor Yellow
}
Write-Host "`nIf anything looks wrong, restore with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
