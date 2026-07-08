$path = "src\app\page.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Fix mojibake middle dot: "A-circumflex + middle-dot-mojibake" -> real middle dot
$moji = [string]([char]0x00C2) + [string]([char]0x00B7)
$content = $content.Replace($moji, [string][char]0x00B7)

# Normalize line endings for exact block matching
$content = $content -replace "`r`n", "`n"

$oldBlock = @'
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
'@

$newBlock = @'
          <div className="rounded-xl p-4 space-y-2.5" style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}>
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
              <span style={{ color: '#0B2A4A' }}><span className="font-semibold">Date Offered:</span> {job.dateOffered || 'To be provided upon final approval'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
              <span style={{ color: '#0B2A4A' }}><span className="font-semibold">Start Date:</span> {job.startDate || 'To be discussed upon offer acceptance'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Banknote className="w-4 h-4 shrink-0" style={{ color: '#12B6D6' }} />
              <span style={{ color: '#0B2A4A' }}><span className="font-semibold">Salary Offered:</span> {job.salaryOffered || 'Competitive, based on experience and qualifications'}</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#0B2A4A' }}>
              About the Role
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#6B7A8D' }}>
              {job.summary}
            </p>
          </div>
'@

$oldBlock = $oldBlock -replace "`r`n", "`n"
$newBlock = $newBlock -replace "`r`n", "`n"

if ($content.Contains($oldBlock)) {
    $content = $content.Replace($oldBlock, $newBlock)
    Write-Host "SUCCESS: Offer box moved above About the Role, now using real mock data."
} else {
    Write-Host "WARNING: exact block not found. No changes made to that section."
}

[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Done."
