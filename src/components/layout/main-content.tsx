'use client';

import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const isLoginRoute = pathname === '/login';

  return (
    <main className={cn(
      'flex-1 transition-all duration-300',
      isLoginRoute ? 'ml-0' : (collapsed ? 'ml-16' : 'ml-64')
    )}>
      {children}
    </main>
  );
}
