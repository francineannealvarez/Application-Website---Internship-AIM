'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { writeDemoUser } from '@/lib/demo-session';

export default function LoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim()) {
      setError('Please enter both your name and email.');
      return;
    }

    writeDemoUser({
      id: crypto.randomUUID(),
      name: fullName.trim(),
      email: email.trim(),
      role: 'APPLICANT',
    });

    router.push('/apply');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#12B6D6] to-[#0B2A4A] px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#0B2A4A' }}>
            Arvin International
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A8D' }}>
            Enter your details to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B2A4A' }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan dela Cruz"
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#E5E9EC' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#0B2A4A' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#E5E9EC' }}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold text-white rounded-lg mt-2"
            style={{ backgroundColor: '#0B2A4A' }}
          >
            Continue
          </button>

          <p className="text-center text-sm mt-2" style={{ color: '#6B7A8D' }}>
            <Link href="/" style={{ color: '#12B6D6' }} className="font-semibold underline">
              ← Back to Home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}