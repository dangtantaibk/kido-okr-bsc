'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  BarChart3,
  CheckSquare,
  Settings,
  ChevronLeft,
  Menu,
  Building2,
  Users2,
  GitBranch,
  ClipboardList,
  CalendarCheck,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/contexts/sidebar-context';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Tổng quan',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Chiến lược',
    items: [
      { name: 'OGSM Company', href: '/ogsm', icon: Building2 },
      { name: 'OGSM Department', href: '/ogsm/department', icon: Users2 },
    ],
  },
  {
    title: 'Theo dõi',
    items: [
      { name: 'OKRs', href: '/okrs', icon: Target },
      { name: 'KPIs', href: '/kpis', icon: BarChart3 },
      { name: 'CSFs', href: '/csfs', icon: CheckSquare },
    ],
  },
  {
    title: 'Thực thi',
    items: [
      { name: 'Fishbone', href: '/fishbone', icon: GitBranch },
      { name: 'Action Log', href: '/actions', icon: ClipboardList },
      { name: 'Reviews', href: '/reviews', icon: CalendarCheck },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { name: 'Cài đặt', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 font-bold text-slate-900">
              K
            </div>
            <div>
              <h1 className="text-sm font-bold">KIDO Group</h1>
              <p className="text-[10px] text-slate-400">Strategic BSC</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8 text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 overflow-y-auto px-2">
        {navigationGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = item.href === '/ogsm'
                  ? pathname === '/ogsm'
                  : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isActive ? 'text-amber-400' : 'text-slate-400'
                        )}
                      />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold">
              NA
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">Nguyễn Văn An</p>
              <p className="truncate text-xs text-slate-400">CEO</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
