'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockUsers } from '@/lib/mockData';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMockLogin = (userType: 'hr' | 'applicant') => {
    const user = userType === 'hr' ? mockUsers.hrAdmin : mockUsers.applicant1;
    sessionStorage.setItem('mockUser', JSON.stringify(user));
    router.push(userType === 'hr' ? '/hr/dashboard' : '/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00AEEF] to-[#1B3A5C] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ARVIN INTERNATIONAL
          </h1>
          <p className="text-white/80 text-sm italic">
            Moving Ahead to Serve You Better
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#1B3A5C] mb-6 text-center">
            Login
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF]"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00AEEF] text-white font-semibold py-2 rounded-lg hover:bg-[#0099CC] transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#00AEEF] font-semibold hover:underline">
              Register here
            </Link>
          </p>

          {/* Demo Mode Buttons */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 font-medium mb-3">🚀 Demo Mode - Quick Login:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleMockLogin('applicant')}
                className="w-full px-3 py-2 bg-[#00AEEF] text-white text-xs font-medium rounded hover:bg-[#0099CC] transition"
              >
                👤 Login as Applicant (Demo)
              </button>
              <button
                type="button"
                onClick={() => handleMockLogin('hr')}
                className="w-full px-3 py-2 bg-[#1B3A5C] text-white text-xs font-medium rounded hover:bg-[#0f2847] transition"
              >
                👨‍💼 Login as HR Admin (Demo)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">Or use test credentials below:</p>
            <div className="text-xs text-gray-700 space-y-1 mt-2">
              <p><strong>HR Admin:</strong> hr@arvininternational.com / admin123</p>
              <p><strong>Applicant:</strong> applicant@test.com / test123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
