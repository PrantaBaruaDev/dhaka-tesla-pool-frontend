'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">Dhaka Tesla Pool</h1>
        <p className="text-gray-600 mt-1">
          Share a seat. Split the fare. Survive Dhaka traffic.
        </p>
      </section>

      {!loading && !user && (
        <section className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Sign up
          </Link>
        </section>
      )}

      {!loading && user && (
        <section className="border rounded p-5 bg-white">
          <p className="text-gray-700">
            Logged in as <strong>{user.name}</strong>{' '}
            <span className="text-xs uppercase text-gray-500 tracking-wide">
              {user.role}
            </span>
          </p>
          <div className="mt-4">
            {user.role === 'PASSENGER' && (
              <Link
                href="/passenger/rides/new"
                className="text-blue-600 hover:underline"
              >
                Request a ride →
              </Link>
            )}
            {user.role === 'DRIVER' && (
              <Link
                href="/driver"
                className="text-blue-600 hover:underline"
              >
                Go to driver dashboard →
              </Link>
            )}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Banani → Mohakhali', desc: '~4.2 km · ৳93 solo · ৳74.40 pooled' },
          { title: 'Banani → Gulshan 1', desc: '~3.5 km · ৳82.50 solo · ৳66 pooled' },
          { title: 'Capacity 3 per Tesla', desc: 'Bullet never overbooks' },
        ].map((c) => (
          <div key={c.title} className="border rounded p-4 bg-white">
            <p className="font-medium">{c.title}</p>
            <p className="text-sm text-gray-500 mt-1">{c.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}