# ============================================================
# apply-deadline-posted.ps1
# Adds "Application Deadline" and "Time Posted" (auto-computed
# relative time, e.g. "3 hours ago") to the landing page's
# Open Positions cards, Job Details modal, and All Positions list.
# ============================================================

$target = ".\src\app\page.tsx"

if (-not (Test-Path $target)) {
    Write-Host "ERROR: Could not find $target" -ForegroundColor Red
    Write-Host "Make sure you're running this from your project root folder." -ForegroundColor Yellow
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = ".\landingpage.backup-$timestamp.tsx"
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

# ---------- PATCH 1: add Calendar icon import ----------
$old1 = @'
import {
  Trophy, MapPin, TrendingUp, ShieldCheck, Users, Banknote,
  UserPlus, ClipboardList, Upload, Send, Eye, Unlock,
  ChevronRight, Menu, X, Briefcase, Clock, Building2,
  CheckCircle2, ArrowRight, LogIn, Search,
} from 'lucide-react';
'@
$new1 = @'
import {
  Trophy, MapPin, TrendingUp, ShieldCheck, Users, Banknote,
  UserPlus, ClipboardList, Upload, Send, Eye, Unlock,
  ChevronRight, Menu, X, Briefcase, Clock, Building2,
  CheckCircle2, ArrowRight, LogIn, Search, Calendar,
} from 'lucide-react';
'@
Apply-Patch -Name "1. Import Calendar icon" -Old $old1 -New $new1

# ---------- PATCH 2: Job type + helper functions ----------
$old2 = @'
type Job = {
  title: string;
  dept: string;
  location: string;
  type: string;
  level: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
};
'@
$new2 = @'
type Job = {
  title: string;
  dept: string;
  location: string;
  type: string;
  level: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  postedDate: string;
  deadline: string;
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const posted = new Date(dateStr);
  const diffMs = now.getTime() - posted.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
}

function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
'@
Apply-Patch -Name "2. Job type: add postedDate/deadline + helper functions" -Old $old2 -New $new2

# ---------- PATCH 3: Marketing Specialist dates ----------
$old3 = @'
      'Highly organized, creative, and results-driven',
    ],
  },
'@
$new3 = @'
      'Highly organized, creative, and results-driven',
    ],
    postedDate: '2026-07-09T05:00:00',
    deadline: '2026-08-15',
  },
'@
Apply-Patch -Name "3. Marketing Specialist: postedDate/deadline" -Old $old3 -New $new3

# ---------- PATCH 4: Sales Representative dates ----------
$old4 = @'
      'Self-motivated with a competitive drive to succeed',
    ],
  },
'@
$new4 = @'
      'Self-motivated with a competitive drive to succeed',
    ],
    postedDate: '2026-07-08T10:00:00',
    deadline: '2026-08-10',
  },
'@
Apply-Patch -Name "4. Sales Representative: postedDate/deadline" -Old $old4 -New $new4

# ---------- PATCH 5: Business Development Manager dates ----------
$old5 = @'
      'Proven track record of meeting revenue targets',
    ],
  },
'@
$new5 = @'
      'Proven track record of meeting revenue targets',
    ],
    postedDate: '2026-07-07T09:00:00',
    deadline: '2026-08-20',
  },
'@
Apply-Patch -Name "5. Business Development Manager: postedDate/deadline" -Old $old5 -New $new5

# ---------- PATCH 6: Logistics Coordinator dates ----------
$old6 = @'
      'Willing to be assigned to any depot location',
    ],
  },
'@
$new6 = @'
      'Willing to be assigned to any depot location',
    ],
    postedDate: '2026-07-05T09:00:00',
    deadline: '2026-08-05',
  },
'@
Apply-Patch -Name "6. Logistics Coordinator: postedDate/deadline" -Old $old6 -New $new6

# ---------- PATCH 7: Accounting Staff dates ----------
$old7 = @'
      'Fresh graduates are welcome to apply',
    ],
  },
'@
$new7 = @'
      'Fresh graduates are welcome to apply',
    ],
    postedDate: '2026-07-09T03:00:00',
    deadline: '2026-08-12',
  },
'@
Apply-Patch -Name "7. Accounting Staff: postedDate/deadline" -Old $old7 -New $new7

# ---------- PATCH 8: Warehouse Supervisor dates ----------
$old8 = @'
      'Physically fit and willing to work on-site',
    ],
  },
'@
$new8 = @'
      'Physically fit and willing to work on-site',
    ],
    postedDate: '2026-07-02T09:00:00',
    deadline: '2026-08-01',
  },
'@
Apply-Patch -Name "8. Warehouse Supervisor: postedDate/deadline" -Old $old8 -New $new8

# ---------- PATCH 9: Clerk dates ----------
$old9 = @'
      'Keen attention to detail and good organizational skills',
      'Willing to be assigned to any warehouse location',
    ],
  },
'@
$new9 = @'
      'Keen attention to detail and good organizational skills',
      'Willing to be assigned to any warehouse location',
    ],
    postedDate: '2026-07-09T02:00:00',
    deadline: '2026-08-08',
  },
'@
Apply-Patch -Name "9. Clerk: postedDate/deadline" -Old $old9 -New $new9

# ---------- PATCH 10: Checker dates (last item in array) ----------
$old10 = @'
      'Physically fit and willing to work on-site',
      'Willing to be assigned to any warehouse location',
    ],
  },
];
'@
$new10 = @'
      'Physically fit and willing to work on-site',
      'Willing to be assigned to any warehouse location',
    ],
    postedDate: '2026-07-09T06:00:00',
    deadline: '2026-08-08',
  },
];
'@
Apply-Patch -Name "10. Checker: postedDate/deadline" -Old $old10 -New $new10

# ---------- PATCH 11: main Open Positions cards - show posted/deadline ----------
$old11 = @'
                  <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#9BAAB8' }}>
                    <MapPin size={12} strokeWidth={1.5} />
                    {job.location}
                  </div>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="mt-auto text-sm font-semibold py-2.5 flex items-center justify-center gap-2 transition-all group"
'@
$new11 = @'
                  <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: '#9BAAB8' }}>
                    <MapPin size={12} strokeWidth={1.5} />
                    {job.location}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-1" style={{ color: '#9BAAB8' }}>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} strokeWidth={1.5} />
                      Posted {getRelativeTime(job.postedDate)}
                    </span>
                    <span className="flex items-center gap-1.5" style={{ color: '#DC2626' }}>
                      <Calendar size={12} strokeWidth={1.5} />
                      Apply by {formatDeadline(job.deadline)}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="mt-auto text-sm font-semibold py-2.5 flex items-center justify-center gap-2 transition-all group"
'@
Apply-Patch -Name "11. Main cards: show posted/deadline" -Old $old11 -New $new11

# ---------- PATCH 12: JobModal - add posted/deadline chips ----------
$old12 = @'
          <div className="flex flex-wrap gap-3">
            {[
              { icon: MapPin, label: job.location },
              { icon: Clock, label: job.type },
              { icon: Building2, label: job.dept },
            ].map(({ icon: Icon, label }) => (
'@
$new12 = @'
          <div className="flex flex-wrap gap-3">
            {[
              { icon: MapPin, label: job.location },
              { icon: Clock, label: job.type },
              { icon: Building2, label: job.dept },
              { icon: Clock, label: `Posted ${getRelativeTime(job.postedDate)}` },
              { icon: Calendar, label: `Apply by ${formatDeadline(job.deadline)}` },
            ].map(({ icon: Icon, label }) => (
'@
Apply-Patch -Name "12. JobModal: add posted/deadline chips" -Old $old12 -New $new12

# ---------- PATCH 13: AllPositionsModal - show posted/deadline in list ----------
$old13 = @'
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: '#9BAAB8' }}>
                      {job.dept}
                    </span>
                    <span style={{ color: '#D1DAE3' }}>·</span>
                    <span className="text-xs" style={{ color: '#9BAAB8' }}>
                      {job.level}
                    </span>
                  </div>
'@
$new13 = @'
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: '#9BAAB8' }}>
                      {job.dept}
                    </span>
                    <span style={{ color: '#D1DAE3' }}>·</span>
                    <span className="text-xs" style={{ color: '#9BAAB8' }}>
                      {job.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: '#9BAAB8' }}>
                      Posted {getRelativeTime(job.postedDate)}
                    </span>
                    <span style={{ color: '#D1DAE3' }}>·</span>
                    <span className="text-xs" style={{ color: '#DC2626' }}>
                      Apply by {formatDeadline(job.deadline)}
                    </span>
                  </div>
'@
Apply-Patch -Name "13. AllPositionsModal: show posted/deadline" -Old $old13 -New $new13

Set-Content -Path $target -Value $content -NoNewline

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Done. $appliedCount / 13 patches applied." -ForegroundColor Cyan
if ($failedPatches.Count -gt 0) {
    Write-Host "`nSKIPPED patches (paste this back to Claude):" -ForegroundColor Yellow
    $failedPatches | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}
Write-Host "`nRestore if needed with:" -ForegroundColor Gray
Write-Host "  Copy-Item '$backupPath' '$target' -Force" -ForegroundColor Gray
Write-Host "============================================`n" -ForegroundColor Cyan
