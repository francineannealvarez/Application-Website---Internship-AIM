# Run this from your project root:
#   C:\Users\Yasmin Ivy\Application-Website---Internship-AIM
#
# 1. Ginagawang functional yung Home / Open Positions / How to Apply / Contact
#    nav links (desktop, mobile, at Quick Links sa footer) -- mag-sscroll na
#    sila papunta sa tamang section.
# 2. Nagdadagdag ng "careers@arvinintl.com" sa footer.
# 3. Inaayos yung footer logo -- inaalis yung invert filter (na siyang dahilan
#    kung bakit puro white box lumalabas) at ilalagay sa loob ng white box,
#    parehong paraan na gumagana na sa login/apply pages.
#
# May backup bago mag-overwrite.

$target = "src\app\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Wala kang $target dito." -ForegroundColor Red
    exit 1
}

$content = Get-Content $target -Raw
$failures = @()

function CountOccurrences {
    param([string]$Haystack, [string]$Needle)
    if ($Needle.Length -eq 0) { return 0 }
    $count = 0
    $idx = 0
    while (($idx = $Haystack.IndexOf($Needle, $idx)) -ge 0) { $count++; $idx += $Needle.Length }
    return $count
}

function DoReplaceLiteral {
    param([string]$Old, [string]$New, [string]$LabelName, [int]$ExpectedCount = 1)
    $count = CountOccurrences -Haystack $script:content -Needle $Old
    if ($count -eq $ExpectedCount) {
        $script:content = $script:content.Replace($Old, $New)
        Write-Host "OK: $LabelName" -ForegroundColor Green
    } elseif ($count -eq 0) {
        Write-Host "MISSING: $LabelName (hindi nahanap)" -ForegroundColor Red
        $script:failures += $LabelName
    } else {
        Write-Host "UNEXPECTED COUNT: $LabelName (nahanap ng $count, inaasahan $ExpectedCount)" -ForegroundColor Yellow
        $script:failures += $LabelName
    }
}

function DoReplaceRegex {
    param([string]$Pattern, [string]$New, [string]$LabelName)
    $m = [regex]::Matches($script:content, $Pattern, 'Singleline')
    if ($m.Count -eq 1) {
        $script:content = [regex]::Replace($script:content, $Pattern, $New, 'Singleline')
        Write-Host "OK: $LabelName" -ForegroundColor Green
    } elseif ($m.Count -eq 0) {
        Write-Host "MISSING: $LabelName (hindi nahanap)" -ForegroundColor Red
        $script:failures += $LabelName
    } else {
        Write-Host "AMBIGUOUS: $LabelName (nahanap ng $($m.Count))" -ForegroundColor Yellow
        $script:failures += $LabelName
    }
}

if ($content -match "handleNavClick") {
    Write-Host "SKIP: mukhang nailagay na dati yung handleNavClick fix." -ForegroundColor Yellow
} else {

# 1. Add new refs after positionsRef
DoReplaceLiteral -Old "const positionsRef = useRef<HTMLElement>(null);" -New "const positionsRef = useRef<HTMLElement>(null);`n  const howItWorksRef = useRef<HTMLElement>(null);`n  const contactRef = useRef<HTMLElement>(null);" -LabelName "add howItWorksRef / contactRef"

# 2. Add handleNavClick function after scrollToPositions
$pattern2 = "positionsRef\.current\?\.scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\);\s*\};"
$new2 = @'
positionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNavClick = (link: string) => {
    if (link === 'Home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (link === 'Open Positions') { scrollToPositions(); return; }
    if (link === 'How to Apply') { howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (link === 'Contact') { contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  };
'@
DoReplaceRegex -Pattern $pattern2 -New $new2 -LabelName "add handleNavClick function"

# 3. Wire desktop nav + footer Quick Links onClick (2 identical occurrences -> both fixed)
DoReplaceLiteral -Old "link === 'Open Positions' ? scrollToPositions : undefined" -New "() => handleNavClick(link)" -LabelName "desktop nav + footer Quick Links onClick" -ExpectedCount 2

# 4. Wire mobile nav onClick
$pattern4 = "if \(link === 'Open Positions'\) \{\s*scrollToPositions\(\);\s*setMobileOpen\(false\);\s*\}"
DoReplaceRegex -Pattern $pattern4 -New "handleNavClick(link);`n                  setMobileOpen(false);" -LabelName "mobile nav onClick"

# 5. Attach ref to "How It Works" section (disambiguated via lookahead to "The Process",
#    since it shares the same className/style as the "Why Apply" section)
$pattern5 = "<section className=`"py-20 md:py-28`" style=\{\{ backgroundColor: '#F7F9FA', borderBottom: '1px solid #E5E9EC' \}\}>(?=[\s\S]{0,800}?The Process)"
DoReplaceRegex -Pattern $pattern5 -New "<section ref={howItWorksRef} className=`"py-20 md:py-28`" style={{ backgroundColor: '#F7F9FA', borderBottom: '1px solid #E5E9EC' }}>" -LabelName "attach ref to How It Works section"

# 6. Attach ref to footer (unique tag, no comment anchor needed)
DoReplaceLiteral -Old "<footer style={{ backgroundColor: '#0B2A4A' }} className=`"pt-14 pb-8`">" -New "<footer ref={contactRef} style={{ backgroundColor: '#0B2A4A' }} className=`"pt-14 pb-8`">" -LabelName "attach ref to footer"

# 7. Add contact email under footer tagline
$pattern7 = "<p className=`"text-sm italic`" style=\{\{ color: '#12B6D6' \}\}>\s*Moving Ahead to Serve You Better\s*</p>"
$new7 = @'
<p className="text-sm italic" style={{ color: '#12B6D6' }}>
                Moving Ahead to Serve You Better
              </p>
              <a href="mailto:careers@arvinintl.com" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>
                careers@arvinintl.com
              </a>
'@
DoReplaceRegex -Pattern $pattern7 -New $new7 -LabelName "add contact email in footer"

# 8. Fix footer logo -- replace invert-filter img with a white background box
#    (same working pattern used on login/apply pages)
$pattern8 = '<img src="/logo\.png" alt="Arvin International logo" className="h-12 w-12 object-contain" style=\{\{ filter: ''brightness\(0\) invert\(1\)'' \}\} />'
$new8 = @'
<div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src="/logo.png"
                    alt="Arvin International logo"
                    className="h-full w-full object-contain p-1"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.style.display = 'none';
                      t.parentElement!.innerHTML = '<svg width="28" height="28" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="#0B2A4A" stroke-width="2.5" fill="none"/><path d="M20 9 L25 23 H15 Z" fill="#0B2A4A"/><path d="M13 28 Q20 23 27 28" stroke="#0B2A4A" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
                    }}
                  />
                </div>
'@
DoReplaceRegex -Pattern $pattern8 -New $new8 -LabelName "fix footer logo (white box, no invert)"

}

if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "May $($failures.Count) hindi na-apply na pagbabago:" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "WALANG na-save na file. I-paste mo sakin itong output para maayos ko." -ForegroundColor Yellow
    exit 1
}

Copy-Item $target "$target.bak3" -Force
Set-Content -Path $target -Value $content -NoNewline -Encoding UTF8

Write-Host ""
Write-Host "TAPOS NA. Backup: $target.bak3" -ForegroundColor Green
Write-Host ""
Write-Host "Sunod na hakbang:"
Write-Host "  1. I-restart ang dev server (Ctrl+C, tapos npm run dev)"
Write-Host "  2. I-click yung 'Home', 'How to Apply', 'Contact' sa nav -- dapat mag-scroll na sila"
Write-Host "  3. Tingnan yung footer -- dapat may email na, at makikita na yung logo sa loob ng white box"
