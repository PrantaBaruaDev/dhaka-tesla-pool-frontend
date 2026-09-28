'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, type Role } from '@/lib/auth-context';
import { ApiClientError } from '@/lib/api';
import { homeForRole } from '@/lib/redirect';

export default function SignupPage() {
  const { user, loading: authLoading, signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PASSENGER');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(homeForRole(user.role));
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const u = await signup({ name, email, password, role });
      router.replace(homeForRole(u.role));
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Sign up failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-sm text-gray-600 mb-6">
        Passengers request rides. Drivers own a Tesla and accept them.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded p-5 bg-white">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Nusrat"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password <span className="text-gray-400 font-normal">(min 8 chars)</span>
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="••••••••"
          />
        </div>

        <div>
          <span className="block text-sm font-medium mb-2">I want to</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('PASSENGER')}
              className={`border rounded px-3 py-2 text-sm text-left transition ${
                role === 'PASSENGER' ? 'bg-black text-white border-black' : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">Ride</div>
              <div className={`text-xs ${role === 'PASSENGER' ? 'text-gray-200' : 'text-gray-500'}`}>
                Request seats
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('DRIVER')}
              className={`border rounded px-3 py-2 text-sm text-left transition ${
                role === 'DRIVER' ? 'bg-black text-white border-black' : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">Drive</div>
              <div className={`text-xs ${role === 'DRIVER' ? 'text-gray-200' : 'text-gray-500'}`}>
                Own a Tesla
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div
            data-testid="signup-error"
            className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}