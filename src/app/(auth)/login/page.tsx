'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ApiClientError } from '@/lib/api';
import { homeForRole } from '@/lib/redirect';

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setSubmitting(true);
    try {
      const u = await login(email, password);
      router.replace(homeForRole(u.role));
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Sign in</h1>
      <p className="text-sm text-gray-600 mb-6">
        Share a seat. Split the fare. Survive Dhaka traffic.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 border rounded p-5 bg-white">
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
            placeholder="nusrat@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="password123"
          />
        </div>

        {error && (
          <div
            data-testid="login-error"
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
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600 text-center">
        New here?{' '}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Create an account
        </Link>
      </div>

      <div className="mt-6 border rounded p-4 bg-gray-50">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Demo credentials (tap to fill)
        </p>
        <div className="space-y-1 text-sm">
          <button
            type="button"
            onClick={() => fillDemo('nusrat@example.com')}
            className="block w-full text-left hover:bg-white rounded px-2 py-1"
          >
            Passenger · <span className="font-mono">nusrat@example.com</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('rafiq@example.com')}
            className="block w-full text-left hover:bg-white rounded px-2 py-1"
          >
            Passenger · <span className="font-mono">rafiq@example.com</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('shirin@example.com')}
            className="block w-full text-left hover:bg-white rounded px-2 py-1"
          >
            Passenger · <span className="font-mono">shirin@example.com</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('jashim@tesla.dhaka')}
            className="block w-full text-left hover:bg-white rounded px-2 py-1"
          >
            Driver · <span className="font-mono">jashim@tesla.dhaka</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Password for all: <span className="font-mono">password123</span></p>
      </div>
    </div>
  );
}