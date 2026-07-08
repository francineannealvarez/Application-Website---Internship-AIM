# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# Nagdadagdag ng "Date Offered / Start Date / Salary Offered" info box sa
# JobModal (yung "View Details" popup ng bawat job posting sa Open Positions).
# Generic mock text lang muna, parehong lalabas sa lahat ng positions.
#
# May backup bago mag-overwrite.

$target = "src\app\page.tsx"

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

if ($content -match "Date Offered") {
    Write-Host "SKIP: mukhang nailagay na dati yung Date Offered section." -ForegroundColor Yellow
    exit 0
}

$old = @'
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#0B2A4A' }}>
              About the Role
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#6B7A8D' }}>
              {job.summary}
            </p>
          </div>

          {[
            { title: 'Key Responsibilities', items: job.responsibilities },
'@

$new = @'
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#0B2A4A' }}>
              About the Role
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#6B7A8D' }}>
              {job.summary}
            </p>
          </div>

          <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}>
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
              <span style={{ color: '#0B2A4A' }}><span className="font-semibold">Date Offered:</span> To be provided upon final approval</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
              <span style={{ color: '#0B2A4A' }}><span className="font-semibold">Start Date:</span> To be discussed upon offer acceptance</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Banknote className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
              <span style={{ color: '#0B2A4A' }}><span className="font-semibold">Salary Offered:</span> Competitive, based on experience and qualifications</span>
            </div>
          </div>

          {[
            { title: 'Key Responsibilities', items: job.responsibilities },
'@

$count = CountOccurrences -Haystack $content -Needle $old
if ($count -eq 1) {
    $content = $content.Replace($old, $new)
    Write-Host "OK: naidagdag yung Date Offered / Start Date / Salary Offered section sa JobModal" -ForegroundColor Green
} elseif ($count -eq 0) {
    Write-Host "MISSING: hindi nahanap yung target block. WALANG na-save na file." -ForegroundColor Red
    Write-Host "I-paste mo sakin itong output:" -ForegroundColor Yellow
    Write-Host "Get-Content 'src\app\page.tsx' -Raw | Select-String -Pattern 'About the Role' -Context 2,10" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "AMBIGUOUS: nahanap ng $count beses. WALANG na-save na file." -ForegroundColor Red
    exit 1
}

Copy-Item $target "$target.bak6" -Force
Set-Content -Path $target -Value $content -NoNewline -Encoding UTF8

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak6" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. Sa Open Positions, i-click yung 'View Details' ng kahit anong job"
Write-Host "  3. Dapat may lumabas na Date Offered / Start Date / Salary Offered sa ilalim ng"
Write-Host "     'About the Role', bago pa yung Key Responsibilities"
