'use client';

import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { collapsed } = useSidebar();

  return (
    <main className={cn(
      'flex-1 transition-all duration-300',
      collapsed ? 'ml-16' : 'ml-64'
    )}>
      {children}
    </main>
  );
}
