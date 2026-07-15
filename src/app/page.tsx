'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy, MapPin, TrendingUp, ShieldCheck, Users, Banknote,
  UserPlus, ClipboardList, Upload, Send, Eye, Unlock,
  ChevronRight, Menu, X, Briefcase, Clock, Building2,
  CheckCircle2, ArrowRight, Search, Calendar,
} from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────────────────────────── */

const NAV_LINKS = ['Home', 'Open Positions', 'How to Apply', 'Contact'];

const WHY_CARDS = [
  {
    icon: Trophy,
    title: 'Industry Leader',
    desc: "Join the #1 salt supplier in the Philippines with over 70% market share — a brand that commands national respect for over four decades.",
  },
  {
    icon: MapPin,
    title: 'Nationwide Presence',
    desc: 'Operate across 16 warehouses nationwide. Gain exposure to large-scale logistics, distribution, and a network that spans every major region.',
  },
  {
    icon: TrendingUp,
    title: 'Room to Grow',
    desc: 'We invest in our people through structured training, mentorship, and clear career paths across sales, marketing, operations, and more.',
  },
  {
    icon: ShieldCheck,
    title: '40 Years of Stability',
    desc: 'Since 1984, Arvin International has never stopped growing. Join a company with proven financial strength and a long-term vision.',
  },
  {
    icon: Banknote,
    title: 'Competitive Benefits',
    desc: 'Enjoy competitive compensation, HMO coverage, government-mandated benefits, and performance bonuses that reward your hard work.',
  },
  {
    icon: Users,
    title: 'People-First Culture',
    desc: 'Our teams are built on trust, respect, and collaboration. We work hard together — and we take the time to celebrate wins together.',
  },
];

// Job shape used by the UI (mapped from the API response)
type Job = {
  id: string;
  title: string;
  dept: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  postedDate: string | null;
  deadline: string | null;
};

// Raw shape returned by /api/positions
type ApiPosition = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  postedDate: string | null;
  deadline: string | null;
};

function mapApiPositionToJob(p: ApiPosition): Job {
  return {
    id: p.id,
    title: p.title,
    dept: p.department,
    location: p.location,
    type: p.employmentType,
    summary: p.description,
    responsibilities: p.responsibilities,
    qualifications: p.qualifications,
    postedDate: p.postedDate,
    deadline: p.deadline,
  };
}

function getRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Recently';
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

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return 'Until filled';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const HOW_STEPS = [
  { icon: UserPlus, title: 'Register', desc: 'Create your applicant account using your email address.' },
  { icon: ClipboardList, title: 'Fill Out the Form', desc: 'Enter your personal details, work experience, and educational background.' },
  { icon: Upload, title: 'Upload Your Resume', desc: 'Attach your resume in PDF or DOCX format.' },
  { icon: Send, title: 'Submit', desc: 'Your application goes directly to our HR team for review.' },
  { icon: Eye, title: 'Check Your Status', desc: 'Log in anytime to see your real-time application progress.' },
  { icon: Unlock, title: 'Complete Requirements', desc: 'If shortlisted, your portal unlocks next steps and required documents.' },
];

/* ─── HELPERS ──────────────────────────────────────────────────────────── */

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeSection({
  children,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.55s ease, transform 0.55s ease',
      }}
    >
      {children}
    </div>
  );
}

/* ─── JOB MODAL ────────────────────────────────────────────────────────── */

function JobModal({ job, onClose }: { job: Job; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor: 'rgba(11,42,74,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto"
        style={{ borderRadius: '16px 16px 0 0', animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 flex items-start justify-between gap-4 px-7 py-5" style={{ borderBottom: '1px solid #E5E9EC' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#12B6D6' }}>
              {job.dept}
            </p>
            <h2 className="text-xl font-bold" style={{ color: '#0B2A4A' }}>
              {job.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
            <X size={18} style={{ color: '#6B7A8D' }} />
          </button>
        </div>

        <div className="px-7 py-6 flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            {[
              { icon: MapPin, label: job.location },
              { icon: Clock, label: job.type },
              { icon: Building2, label: job.dept },
              { icon: Clock, label: `Posted ${getRelativeTime(job.postedDate)}` },
              { icon: Calendar, label: `Apply by ${formatDeadline(job.deadline)}` },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#F7F9FA', color: '#6B7A8D', border: '1px solid #E5E9EC' }}
              >
                <Icon size={13} strokeWidth={1.5} />
                {label}
              </div>
            ))}
          </div>

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
            { title: 'Qualifications', items: job.qualifications },
          ]
            .filter(({ items }) => items.length > 0)
            .map(({ title, items }) => (
              <div key={title}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#0B2A4A' }}>
                  {title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: '#6B7A8D' }}>
                      <CheckCircle2 size={15} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" style={{ color: '#12B6D6' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          <Link
            href="/apply"
            className="w-full py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0B2A4A', borderRadius: '8px' }}
          >
            Apply for This Position <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── ALL POSITIONS MODAL ──────────────────────────────────────────────── */

function AllPositionsModal({
  jobs,
  onClose,
  onSelect,
}: {
  jobs: Job[];
  onClose: () => void;
  onSelect: (job: Job) => void;
}) {
  const [search, setSearch] = useState('');
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const filtered = jobs.filter(
    (j) => j.title.toLowerCase().includes(search.toLowerCase()) || j.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor: 'rgba(11,42,74,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto"
        style={{ borderRadius: '16px 16px 0 0', animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-7 py-5" style={{ borderBottom: '1px solid #E5E9EC' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#12B6D6' }}>
                Now Hiring
              </p>
              <h2 className="text-xl font-bold" style={{ color: '#0B2A4A' }}>
                All Open Positions
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={18} style={{ color: '#6B7A8D' }} />
            </button>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9BAAB8' }} />
            <input
              type="text"
              placeholder="Search positions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm outline-none"
              style={{ border: '1px solid #E5E9EC', borderRadius: '8px', backgroundColor: '#F7F9FA', color: '#0B2A4A' }}
            />
          </div>
        </div>

        <div className="px-7 py-5 flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: '#9BAAB8' }}>
              No positions match your search.
            </p>
          )}
          {filtered.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between gap-4 p-5 rounded-xl transition-all cursor-pointer hover:shadow-sm"
              style={{ border: '1px solid #E5E9EC', backgroundColor: '#fff' }}
              onClick={() => {
                onClose();
                setTimeout(() => onSelect(job), 80);
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EEF9FB', borderRadius: '8px' }}
                >
                  <Briefcase size={16} style={{ color: '#12B6D6' }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0B2A4A' }}>
                    {job.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: '#9BAAB8' }}>
                      {job.dept}
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
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="text-xs font-semibold px-2.5 py-1 hidden sm:block"
                  style={{ color: '#12B6D6', backgroundColor: '#EEF9FB', borderRadius: '4px', border: '1px solid #B8EAF3' }}
                >
                  {job.type}
                </span>
                <ChevronRight size={16} style={{ color: '#9BAAB8' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN LANDING PAGE ────────────────────────────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const positionsRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;

    fetch('/api/positions')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load positions');
        return (await res.json()) as ApiPosition[];
      })
      .then((data) => {
        if (active) setJobs(data.map(mapApiPositionToJob));
      })
      .catch((error) => {
        console.error('Error loading positions:', error);
      })
      .finally(() => {
        if (active) setJobsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const scrollToPositions = () => {
    positionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNavClick = (link: string) => {
    if (link === 'Home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (link === 'Open Positions') { scrollToPositions(); return; }
    if (link === 'How to Apply') { howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (link === 'Contact') { contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  };

  return (
    <div className="min-h-screen bg-white text-[#0B2A4A]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes heroPop {
          from { transform: translateY(16px) scale(0.98); opacity: 0; }
          to   { transform: translateY(0) scale(1);       opacity: 1; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .card-lift { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
        .card-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(11,42,74,0.09); border-color: #12B6D6 !important; }
        .ticker-track { display: flex; animation: ticker 28s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white" style={{ borderBottom: '1px solid #E5E9EC' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Arvin International logo" className="h-9 w-9 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight" style={{ color: '#0B2A4A' }}>
                Arvin International Marketing Inc.
              </span>
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#12B6D6' }}>
                Careers
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => handleNavClick(link)}
                className="text-sm text-[#0B2A4A] font-medium relative group transition-colors bg-transparent border-none cursor-pointer"
              >
                {link}
                <span
                  className="absolute -bottom-0.5 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-200"
                  style={{ backgroundColor: '#12B6D6' }}
                />
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="text-sm font-semibold text-white px-4 py-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0B2A4A', borderRadius: '6px' }}
            >
              Log In
            </button>
          </div>

          <button className="md:hidden text-[#0B2A4A] p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4" style={{ borderColor: '#E5E9EC' }}>
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => {
                  handleNavClick(link);
                  setMobileOpen(false);
                }}
                className="text-sm font-medium text-[#0B2A4A] text-left bg-transparent border-none cursor-pointer"
              >
                {link}
              </button>
            ))}
            <hr style={{ borderColor: '#E5E9EC' }} />
            <button
              onClick={() => {
                setMobileOpen(false);
                router.push('/login');
              }}
              className="text-sm font-semibold text-white px-4 py-2 w-full"
              style={{ backgroundColor: '#0B2A4A', borderRadius: '6px' }}
            >
              Log In
            </button>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="absolute top-0 right-0 w-[480px] h-[480px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(18,182,214,0.08) 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-12 md:gap-16 items-center">
          <div className="flex flex-col gap-6" style={{ animation: 'heroPop 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-[2px] rounded" style={{ backgroundColor: '#12B6D6' }} />
              <p className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: '#12B6D6' }}>
                Arvin International Marketing Inc.
              </p>
            </div>
            <h1 className="text-4xl md:text-[52px] font-bold leading-[1.1] tracking-tight" style={{ color: '#0B2A4A' }}>
              Build Your Career With the Philippines&apos; <span style={{ color: '#12B6D6' }}>No.&nbsp;1</span> Salt Provider
            </h1>
            <p className="text-base md:text-lg leading-relaxed max-w-lg" style={{ color: '#6B7A8D' }}>
              Apply online, track your application in real time, and hear back faster — no office visit required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/apply"
                className="px-6 py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] w-full sm:w-auto"
                style={{ backgroundColor: '#0B2A4A', borderRadius: '8px' }}
              >
                Apply Now <ArrowRight size={15} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {['#1 Salt Supplier in PH', '40+ Years in Business', '16 Warehouses Nationwide'].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#6B7A8D' }}>
                  <CheckCircle2 size={13} strokeWidth={2} style={{ color: '#12B6D6' }} />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden" style={{ borderRadius: '14px', animation: 'heroPop 0.7s 0.1s cubic-bezier(0.22,1,0.36,1) both' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/salt-mounds.jpg"
              alt="Salt mounds — Arvin International, Philippines No. 1 salt provider"
              className="w-full object-cover"
              style={{ height: '400px', objectPosition: 'center center' }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(18,182,214,0.15), transparent)' }}
            />
            <div
              className="absolute bottom-5 left-5 flex items-center gap-2.5 px-4 py-2.5"
              style={{ backgroundColor: 'rgba(11,42,74,0.88)', borderRadius: '10px', backdropFilter: 'blur(8px)' }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#12B6D6' }} />
              <span className="text-xs font-semibold text-white">Philippines&apos; No. 1 Salt Provider</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER STRIP ── */}
      <div className="overflow-hidden py-3" style={{ backgroundColor: '#0B2A4A' }}>
        <div className="ticker-track whitespace-nowrap">
          {[...Array(2)].map((_, outer) => (
            <span key={outer} className="inline-flex">
              {[
                '#1 Salt Supplier · Philippines',
                'Est. 1984',
                '16 Warehouses Nationwide',
                '70% Market Share',
                'Salt · Chemicals · Agricultural Products',
                'Trusted for 40+ Years',
              ].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-4 mx-8">
                  <span className="text-xs font-semibold tracking-widest uppercase text-white/70">{item}</span>
                  <span style={{ color: '#12B6D6' }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── WHY APPLY ── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#F7F9FA', borderBottom: '1px solid #E5E9EC' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeSection className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#12B6D6' }} />
              <span className="text-xs font-semibold tracking-[0.16em] uppercase" style={{ color: '#12B6D6' }}>
                Why Choose Us
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: '#0B2A4A' }}>
              Why Apply at Arvin International
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#6B7A8D' }}>
              More than a job — a career with one of the Philippines&apos; most trusted companies.
            </p>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ gridAutoRows: '1fr' }}>
            {WHY_CARDS.map(({ icon: Icon, title, desc }, i) => (
              <FadeSection key={title} style={{ transitionDelay: `${i * 0.07}s`, height: '100%' }}>
                <div className="card-lift bg-white p-7 flex flex-col gap-5 h-full" style={{ border: '1px solid #E5E9EC', borderRadius: '12px' }}>
                  <div
                    className="w-11 h-11 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #EEF9FB 0%, #D6F4FA 100%)', borderRadius: '10px' }}
                  >
                    <Icon size={20} style={{ color: '#12B6D6' }} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <h3 className="text-base font-bold" style={{ color: '#0B2A4A' }}>
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#6B7A8D' }}>
                      {desc}
                    </p>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPEN POSITIONS ── */}
      <section ref={positionsRef} className="py-20 md:py-28 bg-white" style={{ borderBottom: '1px solid #E5E9EC' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeSection className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#12B6D6' }} />
                <span className="text-xs font-semibold tracking-[0.16em] uppercase" style={{ color: '#12B6D6' }}>
                  Now Hiring
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight" style={{ color: '#0B2A4A' }}>
                Open Positions
              </h2>
            </div>
            {jobs.length > 3 && (
              <button
                onClick={() => setShowAllJobs(true)}
                className="text-sm font-semibold px-5 py-2.5 flex items-center gap-2 transition-all hover:opacity-90"
                style={{ backgroundColor: '#0B2A4A', color: '#fff', borderRadius: '8px' }}
              >
                View All Positions <ArrowRight size={14} />
              </button>
            )}
          </FadeSection>

          {jobsLoading && (
            <p className="text-sm text-center py-10" style={{ color: '#9BAAB8' }}>
              Loading open positions...
            </p>
          )}

          {!jobsLoading && jobs.length === 0 && (
            <p className="text-sm text-center py-10" style={{ color: '#9BAAB8' }}>
              No open positions right now. Please check back soon.
            </p>
          )}

          {!jobsLoading && jobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ gridAutoRows: '1fr' }}>
              {jobs.slice(0, 3).map((job, i) => (
                <FadeSection key={job.id} style={{ transitionDelay: `${i * 0.08}s`, height: '100%' }}>
                  <div className="card-lift bg-white flex flex-col gap-5 p-7 h-full" style={{ border: '1px solid #E5E9EC', borderRadius: '12px' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-11 h-11 flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #EEF9FB 0%, #D6F4FA 100%)', borderRadius: '10px' }}
                      >
                        <Briefcase size={18} style={{ color: '#12B6D6' }} strokeWidth={1.5} />
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 whitespace-nowrap"
                        style={{ color: '#12B6D6', backgroundColor: '#EEF9FB', borderRadius: '5px', border: '1px solid #B8EAF3' }}
                      >
                        {job.type}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                      <h3 className="text-base font-bold leading-snug" style={{ color: '#0B2A4A' }}>
                        {job.title}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9BAAB8' }}>
                        {job.dept}
                      </p>
                      <p className="text-sm leading-relaxed mt-1" style={{ color: '#6B7A8D' }}>
                        {job.summary.slice(0, 100)}…
                      </p>
                    </div>

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
                      style={{ border: '1.5px solid #0B2A4A', color: '#0B2A4A', backgroundColor: 'transparent', borderRadius: '8px' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0B2A4A';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#0B2A4A';
                      }}
                    >
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                </FadeSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section ref={howItWorksRef} className="py-20 md:py-28" style={{ backgroundColor: '#F7F9FA', borderBottom: '1px solid #E5E9EC' }}>
        <div className="max-w-7xl mx-auto px-6">
          <FadeSection className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#12B6D6' }} />
              <span className="text-xs font-semibold tracking-[0.16em] uppercase" style={{ color: '#12B6D6' }}>
                The Process
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: '#0B2A4A' }}>
              How It Works
            </h2>
            <p className="text-base" style={{ color: '#6B7A8D' }}>
              Six simple steps from application to offer
            </p>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ gridAutoRows: '1fr' }}>
            {HOW_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <FadeSection key={title} style={{ transitionDelay: `${i * 0.07}s`, height: '100%' }}>
                <div className="card-lift bg-white p-7 flex flex-col gap-4 h-full" style={{ border: '1px solid #E5E9EC', borderRadius: '12px' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: '#0B2A4A', borderRadius: '50%' }}
                    >
                      {i + 1}
                    </div>
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #EEF9FB, #D6F4FA)', borderRadius: '8px' }}
                    >
                      <Icon size={15} style={{ color: '#12B6D6' }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-bold" style={{ color: '#0B2A4A' }}>
                      {title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B7A8D' }}>
                    {desc}
                  </p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#F7F9FA', borderBottom: '1px solid #E5E9EC' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <FadeSection className="relative overflow-hidden" style={{ borderRadius: '14px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/salt-mounds.jpg"
              alt="Salt mounds — Arvin International"
              className="w-full object-cover"
              style={{ height: '380px', objectPosition: 'center center' }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top right, rgba(11,42,74,0.4), transparent)' }}
            />
            <div className="absolute bottom-6 left-6">
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1.5"
                style={{ backgroundColor: '#12B6D6', color: '#fff', borderRadius: '5px' }}
              >
                Since 1984
              </span>
            </div>
          </FadeSection>

          <FadeSection className="flex flex-col gap-5">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full self-start"
              style={{ backgroundColor: '#EEF9FB', border: '1px solid #B8EAF3' }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#12B6D6' }} />
              <span className="text-xs font-semibold tracking-[0.16em] uppercase" style={{ color: '#12B6D6' }}>
                Our Story
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-snug" style={{ color: '#0B2A4A' }}>
              About Arvin International Marketing Inc.
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#6B7A8D' }}>
              Since 1984, Arvin International has grown from a local salt trading operation into the Philippines&apos; largest salt
              importer and distributor, with over 70% market share and 16 warehouses nationwide.
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#6B7A8D' }}>
              Beyond salt, we distribute chemical and agricultural products — serving industries that keep the country running.
              We&apos;re building the same standard of trust into how we grow our team.
            </p>
            <div className="flex gap-6 pt-2 flex-wrap">
              {[
                { val: '40+', label: 'Years in Business' },
                { val: '70%', label: 'Market Share' },
                { val: '16', label: 'Warehouses' },
              ].map(({ val, label }, i) => (
                <div key={label} className={i > 0 ? 'pl-6' : ''} style={i > 0 ? { borderLeft: '1px solid #E5E9EC' } : {}}>
                  <p className="text-2xl font-bold" style={{ color: '#0B2A4A' }}>
                    {val}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: '#9BAAB8' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={scrollToPositions}
              className="self-start mt-2 px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0B2A4A', color: '#fff', borderRadius: '8px' }}
            >
              Explore Open Roles <ArrowRight size={14} />
            </button>
          </FadeSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer ref={contactRef} style={{ backgroundColor: '#0B2A4A' }} className="pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <div>
                  <p className="text-sm font-bold text-white">Arvin International Marketing Inc.</p>
                  <p className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#12B6D6' }}>
                    Careers
                  </p>
                </div>
              </div>
              <p className="text-sm italic" style={{ color: '#12B6D6' }}>
                Moving Ahead to Serve You Better
              </p>
              <a href="mailto:careers@arvinintl.com" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>
                careers@arvinintl.com
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Quick Links
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link}
                    onClick={() => handleNavClick(link)}
                    className="text-sm text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              © 2026 Arvin International Marketing Inc. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Philippines&apos; No. 1 Salt Supplier &amp; Distributor
            </p>
          </div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {showAllJobs && (
        <AllPositionsModal jobs={jobs} onClose={() => setShowAllJobs(false)} onSelect={(job) => setSelectedJob(job)} />
      )}
    </div>
  );
}