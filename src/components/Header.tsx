'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          Dhaka Tesla Pool
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {loading ? (
            <span className="text-gray-400">…</span>
          ) : user ? (
            <>
              {user.role === 'PASSENGER' && (
                <>
                  <Link href="/passenger/rides/new" className="hover:underline">Request</Link>
                  <Link href="/passenger/rides" className="hover:underline">My rides</Link>
                </>
              )}
              {user.role === 'DRIVER' && (
                <>
                  <Link href="/driver" className="hover:underline">Dashboard</Link>
                  <Link href="/driver/requests" className="hover:underline">Requests</Link>
                  <Link href="/driver/history" className="hover:underline">History</Link>
                </>
              )}
              <span className="text-gray-500">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/signup" className="hover:underline">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}