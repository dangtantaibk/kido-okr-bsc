'use client';

import { Bell, Calendar, ChevronDown, LogOut, Search, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/contexts/organization-context';
import { formatQuarterLabel, quarterOptions } from '@/lib/period';
import { useAuth } from '@/contexts/auth-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const {
    activeFiscalYear,
    activeQuarter,
    setActiveFiscalYear,
    setActiveQuarter,
    yearOptions,
  } = useOrganization();
  const quarterLabel = formatQuarterLabel(activeQuarter, activeFiscalYear);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            className="w-64 pl-9"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-[10px]">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <p className="text-sm font-medium">KPI Thị phần kem có rủi ro</p>
              <p className="text-xs text-slate-500">Hiện tại: 43% / Mục tiêu: 45%</p>
              <p className="text-xs text-slate-400">5 phút trước</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <p className="text-sm font-medium">OKR Q4 cần cập nhật</p>
              <p className="text-xs text-slate-500">3 OKRs cần báo cáo tiến độ</p>
              <p className="text-xs text-slate-400">1 giờ trước</p>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <p className="text-sm font-medium">CSF hoàn thành</p>
              <p className="text-xs text-slate-500">Chương trình đào tạo kỹ năng số đã hoàn thành</p>
              <p className="text-xs text-slate-400">2 giờ trước</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Period Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 border-amber-300 bg-amber-50 text-amber-700 sm:flex"
            >
              <Calendar className="h-4 w-4" />
              <span>{quarterLabel || 'Chọn kỳ'}</span>
              <ChevronDown className="h-3 w-3 text-amber-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Năm tài chính</DropdownMenuLabel>
            {yearOptions.map((year) => (
              <DropdownMenuItem key={year} onClick={() => setActiveFiscalYear(year)}>
                {year}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Quý hiện tại</DropdownMenuLabel>
            {quarterOptions.map((quarter) => (
              <DropdownMenuItem
                key={quarter}
                onClick={() => setActiveQuarter(quarter)}
              >
                {formatQuarterLabel(quarter, activeFiscalYear)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden gap-2 sm:flex">
                <User2 className="h-4 w-4 text-slate-500" />
                <span className="max-w-[140px] truncate text-sm text-slate-700">
                  {user.email}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="h-4 w-4 text-slate-500" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
