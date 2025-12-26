'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === '/login';

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session && !isLoginRoute) {
      router.replace('/login');
      return;
    }

    if (session && isLoginRoute) {
      router.replace('/');
    }
  }, [isLoading, isLoginRoute, router, session]);

  if (isLoading && !isLoginRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  if (!session && !isLoginRoute) {
    return null;
  }

  return <>{children}</>;
}
