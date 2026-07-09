# ============================================================
# apply-pds-fixes2.ps1
# 1. Adds "Exact Address" field to Character References
# 2. Moves Trainings/Activities/Special Skills from Education
#    to Other Information & Declarations
# 3. Changes Employment Duration to From/To date fields
# ============================================================

$target = ".\src\components\dashboard\PersonalDataSheetContent.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\PersonalDataSheetContent.backup-fixes2-$timestamp.tsx"
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

# ---------- PATCH 1: RefRow type - add address ----------
$old1 = "type RefRow = { name: string; occupation: string; telephone: string };"
$new1 = "type RefRow = { name: string; occupation: string; telephone: string; address: string };"
Apply-Patch -Name "1. RefRow type: add address field" -Old $old1 -New $new1

# ---------- PATCH 2: emptyRef - add address ----------
$old2 = "const emptyRef: RefRow = { name: '', occupation: '', telephone: '' };"
$new2 = "const emptyRef: RefRow = { name: '', occupation: '', telephone: '', address: '' };"
Apply-Patch -Name "2. emptyRef: add address field" -Old $old2 -New $new2

# ---------- PATCH 3: charRefs validation - require address ----------
$old3 = "  if (!naCharRefs) check('References & Emergency Contact', 'Character References (or mark N/A)', charRefs.every((r) => f(r.name) && f(r.occupation) && f(r.telephone)));"
$new3 = "  if (!naCharRefs) check('References & Emergency Contact', 'Character References (or mark N/A)', charRefs.every((r) => f(r.name) && f(r.occupation) && f(r.telephone) && f(r.address)));"
Apply-Patch -Name "3. Character References validation: require address" -Old $old3 -New $new3

# ---------- PATCH 4: Character References fields - add address column ----------
$old4 = @'
        <NARepeatingSection label="Character References" na={naCharRefs} setNa={setNaCharRefs}
          rows={charRefs} setRows={setCharRefs} empty={emptyRef}
          fields={[{ key: 'name', label: 'Name' }, { key: 'occupation', label: 'Occupation' }, { key: 'telephone', label: 'Telephone Number' }]} />
'@
$new4 = @'
        <NARepeatingSection label="Character References" na={naCharRefs} setNa={setNaCharRefs}
          rows={charRefs} setRows={setCharRefs} empty={emptyRef}
          fields={[{ key: 'name', label: 'Name' }, { key: 'occupation', label: 'Occupation' }, { key: 'telephone', label: 'Telephone Number' }, { key: 'address', label: 'Exact Address' }]} />
'@
Apply-Patch -Name "4. Character References: add address field to UI" -Old $old4 -New $new4

# ---------- PATCH 5: remove Trainings/Activities/Skills from Education ----------
$old5 = @'
        <NARepeatingSection label="Trainings and Seminars Attended" na={naTrainings} setNa={setNaTrainings}
          rows={trainings} setRows={setTrainings} empty={emptySimpleRow}
          fields={[{ key: 'title', label: 'Title/Topic' }, { key: 'place', label: 'Company' }, { key: 'dates', label: 'Inclusive Dates' }]} />

        <NARepeatingSection label="Activities (School, Community, and Professional Organizations)" na={naActivities} setNa={setNaActivities}
          rows={activities} setRows={setActivities} empty={emptySimpleRow}
          fields={[{ key: 'title', label: 'Organization/Club' }, { key: 'place', label: 'Position(s) Held' }, { key: 'dates', label: 'Inclusive Dates' }]} />

        <TextArea label="Special Skills, Qualifications, Talents and Hobbies" value={specialSkills} onChange={setSpecialSkills} rows={2} />
      </Section>
'@
$new5 = @'
      </Section>
'@
Apply-Patch -Name "5. Remove Trainings/Activities/Skills from Education section" -Old $old5 -New $new5

# ---------- PATCH 6: add Trainings/Activities/Skills to Other Info section ----------
$old6 = @'
      <Section id="declarations" icon={Shield} title="Other Information & Declarations" subtitle="Loans, legal history, health, smoking" openId={openId} setOpenId={setOpenId}>
        <YesNo label="Do you have any outstanding loans?" value={outstandingLoans} onChange={setOutstandingLoans} detailValue={outstandingLoansDetail} onDetailChange={setOutstandingLoansDetail} />
'@
$new6 = @'
      <Section id="declarations" icon={Shield} title="Other Information & Declarations" subtitle="Trainings, activities, skills, loans, legal history, health, smoking" openId={openId} setOpenId={setOpenId}>
        <NARepeatingSection label="Trainings and Seminars Attended" na={naTrainings} setNa={setNaTrainings}
          rows={trainings} setRows={setTrainings} empty={emptySimpleRow}
          fields={[{ key: 'title', label: 'Title/Topic' }, { key: 'place', label: 'Company' }, { key: 'dates', label: 'Inclusive Dates' }]} />

        <NARepeatingSection label="Activities (School, Community, and Professional Organizations)" na={naActivities} setNa={setNaActivities}
          rows={activities} setRows={setActivities} empty={emptySimpleRow}
          fields={[{ key: 'title', label: 'Organization/Club' }, { key: 'place', label: 'Position(s) Held' }, { key: 'dates', label: 'Inclusive Dates' }]} />

        <TextArea label="Special Skills, Qualifications, Talents and Hobbies" value={specialSkills} onChange={setSpecialSkills} rows={2} />

        <YesNo label="Do you have any outstanding loans?" value={outstandingLoans} onChange={setOutstandingLoans} detailValue={outstandingLoansDetail} onDetailChange={setOutstandingLoansDetail} />
'@
Apply-Patch -Name "6. Add Trainings/Activities/Skills to Other Information section" -Old $old6 -New $new6

# ---------- PATCH 7: JobRow type - split employmentDuration into From/To ----------
$old7 = @'
type JobRow = {
  company: string; position: string; lastSalary: string; allowances: string; bonus: string; otherBenefits: string;
  majorFunctions: string; accomplishments: string; reasonForLeaving: string; immediateSuperior: string;
  employmentDuration: string; contactNo: string;
};
'@
$new7 = @'
type JobRow = {
  company: string; position: string; lastSalary: string; allowances: string; bonus: string; otherBenefits: string;
  majorFunctions: string; accomplishments: string; reasonForLeaving: string; immediateSuperior: string;
  employmentDurationFrom: string; employmentDurationTo: string; contactNo: string;
};
'@
Apply-Patch -Name "7. JobRow type: split employmentDuration into From/To" -Old $old7 -New $new7

# ---------- PATCH 8: emptyJob - split employmentDuration ----------
$old8 = @'
const emptyJob: JobRow = {
  company: '', position: '', lastSalary: '', allowances: '', bonus: '', otherBenefits: '',
  majorFunctions: '', accomplishments: '', reasonForLeaving: '', immediateSuperior: '', employmentDuration: '', contactNo: ''
};
'@
$new8 = @'
const emptyJob: JobRow = {
  company: '', position: '', lastSalary: '', allowances: '', bonus: '', otherBenefits: '',
  majorFunctions: '', accomplishments: '', reasonForLeaving: '', immediateSuperior: '', employmentDurationFrom: '', employmentDurationTo: '', contactNo: ''
};
'@
Apply-Patch -Name "8. emptyJob: split employmentDuration" -Old $old8 -New $new8

# ---------- PATCH 9: Work Experience validation - use From/To ----------
$old9 = @'
    check('Work Experience', 'Each company (or mark N/A if no experience)',
      jobs.every((j) => f(j.company) && f(j.position) && f(j.lastSalary) && f(j.majorFunctions) && f(j.accomplishments) && f(j.reasonForLeaving) && f(j.immediateSuperior) && f(j.employmentDuration) && f(j.contactNo)));
'@
$new9 = @'
    check('Work Experience', 'Each company (or mark N/A if no experience)',
      jobs.every((j) => f(j.company) && f(j.position) && f(j.lastSalary) && f(j.majorFunctions) && f(j.accomplishments) && f(j.reasonForLeaving) && f(j.immediateSuperior) && f(j.employmentDurationFrom) && f(j.employmentDurationTo) && f(j.contactNo)));
'@
Apply-Patch -Name "9. Work Experience validation: use From/To dates" -Old $old9 -New $new9

# ---------- PATCH 10: Work Experience UI - From/To date inputs ----------
$old10 = @'
                <div className="grid grid-cols-2 gap-2">
                  <input value={job.employmentDuration} onChange={(e) => updateJob(idx, { employmentDuration: e.target.value })} placeholder="Employment Duration" className={inputCls + ' text-xs'} style={inputStyle} />
                  <input value={job.contactNo} onChange={(e) => updateJob(idx, { contactNo: e.target.value })} placeholder="Contact No." className={inputCls + ' text-xs'} style={inputStyle} />
                </div>
'@
$new10 = @'
                <div>
                  <Label>Employment Duration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={job.employmentDurationFrom} onChange={(e) => updateJob(idx, { employmentDurationFrom: e.target.value })} className={inputCls + ' text-xs'} style={inputStyle} />
                    <input type="date" value={job.employmentDurationTo} onChange={(e) => updateJob(idx, { employmentDurationTo: e.target.value })} className={inputCls + ' text-xs'} style={inputStyle} />
                  </div>
                </div>
                <input value={job.contactNo} onChange={(e) => updateJob(idx, { contactNo: e.target.value })} placeholder="Contact No." className={inputCls + ' text-xs w-full'} style={inputStyle} />
'@
Apply-Patch -Name "10. Work Experience UI: From/To date inputs" -Old $old10 -New $new10

Set-Content -Path $target -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 10 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED patches (paste this back to Claude):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
