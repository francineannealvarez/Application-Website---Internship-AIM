# ============================================================
# apply-requirements-upload.ps1
# 1. Removes "4 pcs each" from the ID Pictures note (single upload)
# 2. Adds Icons to Additional Requirements items (prev employer, BDO)
# 3. Adds offset constants so all requirement docs share one
#    docStatuses/docFiles array
# 4. Renders Additional Requirements items with the same
#    upload-capable RequirementRow used in the main list
# ============================================================

$target = ".\src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\page.backup-requpload-$timestamp.tsx"
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

# ---------- PATCH A: remove "4 pcs each" from ID Pictures note ----------
$oldA = "  { label: 'ID Pictures (1x1 & 2x2)', note: '4 pcs each, white background', Icon: CreditCard },"
$newA = "  { label: 'ID Pictures (1x1 & 2x2)', note: 'White background', Icon: CreditCard },"
Apply-Patch -Name "A. Remove piece-count from ID Pictures note" -Old $oldA -New $newA

# ---------- PATCH B: add Icons to REQUIREMENTS_PREV_EMPLOYER ----------
$oldB = @'
const REQUIREMENTS_PREV_EMPLOYER = [
  { label: 'BIR Form 2316', note: 'From your previous employer' },
  { label: 'Certificate of Employment', note: 'From your previous employer' },
  { label: 'Latest Pay Slip', note: 'At least 1 month, from your previous employer' },
  {
    label: 'SSS / Pag-IBIG Loan Status Form',
    note: 'If with an existing SSS/Pag-IBIG loan: submit an updated Statement of Account (photocopy) with your payment arrangement. If without a loan: submit the printed online status confirming you have no existing loan.'
  },
];
'@
$newB = @'
const REQUIREMENTS_PREV_EMPLOYER = [
  { label: 'BIR Form 2316', note: 'From your previous employer', Icon: FileText },
  { label: 'Certificate of Employment', note: 'From your previous employer', Icon: FileText },
  { label: 'Latest Pay Slip', note: 'At least 1 month, from your previous employer', Icon: FileText },
  {
    label: 'SSS / Pag-IBIG Loan Status Form',
    note: 'If with an existing SSS/Pag-IBIG loan: submit an updated Statement of Account (photocopy) with your payment arrangement. If without a loan: submit the printed online status confirming you have no existing loan.',
    Icon: Hash
  },
];
'@
Apply-Patch -Name "B. Add Icons to REQUIREMENTS_PREV_EMPLOYER" -Old $oldB -New $newB

# ---------- PATCH C: add Icons to REQUIREMENTS_BDO + offset constants ----------
$oldC = @'
const REQUIREMENTS_BDO = [
  { label: '1x1 ID Picture', note: '2 pcs' },
  { label: 'Photocopy of 2 Different Government-Issued IDs', note: 'Or an original Police Clearance' },
];
'@
$newC = @'
const REQUIREMENTS_BDO = [
  { label: '1x1 ID Picture', note: 'White background', Icon: CreditCard },
  { label: 'Photocopy of 2 Different Government-Issued IDs', note: 'Or an original Police Clearance', Icon: Shield },
];

const REQUIREMENTS_PREV_EMPLOYER_START = REQUIREMENTS_MAIN.length;
const REQUIREMENTS_BDO_START = REQUIREMENTS_MAIN.length + REQUIREMENTS_PREV_EMPLOYER.length;
const REQUIREMENTS_TOTAL = REQUIREMENTS_MAIN.length + REQUIREMENTS_PREV_EMPLOYER.length + REQUIREMENTS_BDO.length;
'@
Apply-Patch -Name "C. Add Icons to REQUIREMENTS_BDO + offset constants" -Old $oldC -New $newC

# ---------- PATCH D: render Additional Requirements with upload ----------
$oldD = @'
      <ReqCollapsible title="Additional Requirements - If You Previously Worked Elsewhere" subtitle="Only applicable if you have prior employment">
        <div className="space-y-2">
          {REQUIREMENTS_PREV_EMPLOYER.map((r, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F7F9FA' }}>
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#9BAAB8' }} />
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color: '#0B2A4A' }}>{r.label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>{r.note}</div>
              </div>
            </div>
          ))}
        </div>
      </ReqCollapsible>

      <ReqCollapsible title="Additional Requirements - BDO Payroll Account Application" subtitle="Only applicable when opening a BDO account">
        <div className="space-y-2">
          {REQUIREMENTS_BDO.map((r, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F7F9FA' }}>
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#9BAAB8' }} />
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color: '#0B2A4A' }}>{r.label}</div>
                <div className="text-xs mt-0.5" style={{ color: '#6B7A8D' }}>{r.note}</div>
              </div>
            </div>
          ))}
        </div>
      </ReqCollapsible>
'@
$newD = @'
      <ReqCollapsible title="Additional Requirements - If You Previously Worked Elsewhere" subtitle="Only applicable if you have prior employment">
        <div className="space-y-2">
          {REQUIREMENTS_PREV_EMPLOYER.map((r, idx) => {
            const globalIdx = REQUIREMENTS_PREV_EMPLOYER_START + idx;
            return (
              <RequirementRow key={idx} label={r.label} note={r.note} Icon={r.Icon}
                status={docStatuses[globalIdx]} file={docFiles[globalIdx]} onUpload={(file) => onDocUpload(globalIdx, file)} />
            );
          })}
        </div>
      </ReqCollapsible>

      <ReqCollapsible title="Additional Requirements - BDO Payroll Account Application" subtitle="Only applicable when opening a BDO account">
        <div className="space-y-2">
          {REQUIREMENTS_BDO.map((r, idx) => {
            const globalIdx = REQUIREMENTS_BDO_START + idx;
            return (
              <RequirementRow key={idx} label={r.label} note={r.note} Icon={r.Icon}
                status={docStatuses[globalIdx]} file={docFiles[globalIdx]} onUpload={(file) => onDocUpload(globalIdx, file)} />
            );
          })}
        </div>
      </ReqCollapsible>
'@
Apply-Patch -Name "D. Render Additional Requirements with upload capability" -Old $oldD -New $newD

# ---------- PATCH E: resize docStatuses/docFiles state ----------
$oldE = @'
  const [docStatuses, setDocStatuses] = useState<DocStatus[]>(Array(REQUIREMENTS_MAIN.length).fill('Pending'));
  const [docFiles, setDocFiles] = useState<(StoredReqFile | null)[]>(Array(REQUIREMENTS_MAIN.length).fill(null));
'@
$newE = @'
  const [docStatuses, setDocStatuses] = useState<DocStatus[]>(Array(REQUIREMENTS_TOTAL).fill('Pending'));
  const [docFiles, setDocFiles] = useState<(StoredReqFile | null)[]>(Array(REQUIREMENTS_TOTAL).fill(null));
'@
Apply-Patch -Name "E. Resize docStatuses/docFiles state" -Old $oldE -New $newE

# ---------- PATCH F: update the "all submitted" reset on completion ----------
$oldF = @'
      if (next === steps.length) {
        setDocStatuses(Array(REQUIREMENTS_MAIN.length).fill('Submitted'));
        setCongratsOpen(true);
      }
'@
$newF = @'
      if (next === steps.length) {
        setDocStatuses(Array(REQUIREMENTS_TOTAL).fill('Submitted'));
        setCongratsOpen(true);
      }
'@
Apply-Patch -Name "F. Update completion reset to new total" -Old $oldF -New $newF

Set-Content -Path $target -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 6 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED patches (paste this back to Claude):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
