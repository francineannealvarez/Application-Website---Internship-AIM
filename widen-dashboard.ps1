# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# 1. Pinapalawak yung dashboard container (max-w-6xl -> max-w-7xl, kasing-lapad
#    ng landing page) para mabawasan yung malaking puwang sa gilid sa laptop.
# 2. Pinapalitan yung text-based "ARVIN" logo sa nav ng totoong /logo.png image
#    + parehong label style ng landing page header ("Arvin International
#    Marketing Inc." / "Applicant Portal"), para magmukhang isang cohesive site.
# 3. Ginagawang gradient (kagaya ng landing page icon badges) yung mga flat
#    na icon circle backgrounds.
#
# May backup bago mag-overwrite.

$target = "src\app\dashboard\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito. Siguraduhing nasa project root ka." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw
$original = $content

# --- 1. Nav + logo block -> widened container + real logo image ---
$navOld = @'
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#E5E9EC] shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-[0.2em] text-[#0B2A4A]">ARVIN</span>
            <span className="hidden sm:block text-[11px] border-l pl-2.5 ml-0.5 leading-tight" style={{ color: '#9BAAB8', borderColor: '#E5E9EC' }}>International<br />Marketing Inc.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center ring-2" style={{ backgroundColor: '#EEF9FB', boxShadow: '0 0 0 2px #F7F9FA' }}><User className="w-4 h-4" style={{ color: '#12B6D6' }} /></div>
              <span className="hidden sm:block text-sm font-medium text-[#0B2A4A]">{name}</span>
            </div>
            <button onClick={() => { clearDemoUser(); void signOut({ callbackUrl: '/' }); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">
'@

$navNew = @'
      <nav className="bg-white/90 backdrop-blur-sm border-b border-[#E5E9EC] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Arvin International logo" className="h-9 w-9 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight" style={{ color: '#0B2A4A' }}>Arvin International Marketing Inc.</span>
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#12B6D6' }}>Applicant Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center ring-2" style={{ background: 'linear-gradient(135deg, #EEF9FB 0%, #D6F4FA 100%)', boxShadow: '0 0 0 2px #F7F9FA' }}><User className="w-4 h-4" style={{ color: '#12B6D6' }} /></div>
              <span className="hidden sm:block text-sm font-medium text-[#0B2A4A]">{name}</span>
            </div>
            <button onClick={() => { clearDemoUser(); void signOut({ callbackUrl: '/' }); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
'@

if ($content -match [regex]::Escape($navOld)) {
    $content = $content.Replace($navOld, $navNew)
    Write-Host "OK: na-update yung nav header (logo + widened container)" -ForegroundColor Green
} else {
    Write-Host "SKIP: hindi na-match yung nav block -- baka naiba na yung file dito." -ForegroundColor Yellow
}

# --- 2. Any remaining max-w-6xl -> max-w-7xl (covers the content wrapper) ---
$beforeCount = ([regex]::Matches($content, "max-w-6xl")).Count
$content = $content.Replace("max-w-6xl", "max-w-7xl")
if ($beforeCount -gt 0) {
    Write-Host "OK: pinalitan ang $beforeCount pang max-w-6xl -> max-w-7xl" -ForegroundColor Green
}

# --- 3. Document requirement icon badges -> gradient ---
$docIconOld = '<div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: ' + "'#EEF9FB'" + ' }}><Icon className="w-4 h-4" style={{ color: ' + "'#12B6D6'" + ' }} /></div>'
$docIconNew = '<div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: ' + "'linear-gradient(135deg, #EEF9FB 0%, #D6F4FA 100%)'" + ' }}><Icon className="w-4 h-4" style={{ color: ' + "'#12B6D6'" + ' }} /></div>'

if ($content -match [regex]::Escape($docIconOld)) {
    $content = $content.Replace($docIconOld, $docIconNew)
    Write-Host "OK: na-update yung document requirement icon badges" -ForegroundColor Green
} else {
    Write-Host "SKIP: hindi na-match yung document icon block -- baka naiba na yung file dito." -ForegroundColor Yellow
}

if ($content -eq $original) {
    Write-Host ""
    Write-Host "Walang nagawang pagbabago -- lahat ng target blocks ay hindi na-match." -ForegroundColor Red
    Write-Host "I-paste mo sakin yung buong Get-Content ng file para gawan kita ng bagong script." -ForegroundColor Red
    exit 1
}

Copy-Item $target "$target.bak" -Force
Set-Content -Path $target -Value $content -NoNewline

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. I-refresh yung dashboard -- dapat mas laki na yung laman, tumutugma sa landing page logo/style"
