'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const NAVY = '#0B2A4A';
const CYAN = '#12B6D6';
const MUTED = '#6B7A8D';
const BORDER = '#E5E9EC';
const BG_LIGHT = '#F7F9FA';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password: fullName, // repurposed field — holds full name, see src/auth.ts
        redirect: false,
      });

     if (!result?.ok) {
        setError(result?.error || 'Login failed');
        setLoading(false);
        return;
      }

      const session = await getSession();
      if (session?.user?.role === 'HR_ADMIN') {
        router.push('/hr/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BG_LIGHT }}>
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg mx-auto mb-4 flex items-center justify-center overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            <img
              src="/logo.png"
              alt="Arvin International"
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = 'none';
                t.parentElement!.innerHTML = `<svg width="32" height="32" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="${NAVY}" stroke-width="2.5" fill="none"/><path d="M20 9 L25 23 H15 Z" fill="${NAVY}"/><path d="M13 28 Q20 23 27 28" stroke="${NAVY}" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
              }}
            />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>
            Arvin International Marketing Inc.
          </h1>
          <p className="text-sm mt-1" style={{ color: CYAN }}>
            Moving Ahead to Serve You Better
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8" style={{ border: `1px solid ${BORDER}`, boxShadow: '0 12px 32px rgba(11,42,74,0.08)' }}>
          <h2 className="text-xl font-bold mb-2 text-center" style={{ color: NAVY }}>
            Log In to Your Account
          </h2>
          <p className="text-xs text-center mb-6" style={{ color: MUTED }}>
            Use the email and full name you provided when you applied.
          </p>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl text-sm" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                className="w-full px-3.5 py-2.5 text-sm outline-none transition-all rounded-lg"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_LIGHT, color: NAVY }}
                onFocus={(e) => (e.target.style.borderColor = CYAN)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Juan dela Cruz"
                className="w-full px-3.5 py-2.5 text-sm outline-none transition-all rounded-lg"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: BG_LIGHT, color: NAVY }}
                onFocus={(e) => (e.target.style.borderColor = CYAN)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
              <p className="text-[11px] mt-1" style={{ color: MUTED }}>
                Must match the name on your application exactly.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold text-white rounded-lg hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 mt-1"
              style={{ backgroundColor: NAVY }}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: MUTED }}>
            Haven&apos;t applied yet?{' '}
            <Link href="/apply" className="font-semibold underline" style={{ color: CYAN }}>
              Submit an application
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}