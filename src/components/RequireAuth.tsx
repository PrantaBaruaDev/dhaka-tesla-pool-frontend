'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type Role = 'PASSENGER' | 'DRIVER';

interface RequireAuthProps {
  role?: Role;
  children: React.ReactNode;
}

export function RequireAuth({ role, children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (role && user.role !== role) {
      router.replace(user.role === 'DRIVER' ? '/driver' : '/passenger/rides/new');
    }
  }, [user, loading, role, router]);

  if (loading) {
    return <div className="text-gray-500 py-10 text-center">Loading…</div>;
  }

  if (!user) return null;
  if (role && user.role !== role) return null;

  return <>{children}</>;
}