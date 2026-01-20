import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { StrategyNodeData } from './mock-data';
import { CheckCircle2, Target, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: StrategyNodeData | null;
}

export function DetailPanel({ isOpen, onClose, data }: DetailPanelProps) {
  if (!data) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-6 sm:p-8">
        <SheetHeader className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {data.category} - {data.code}
            </span>
          </div>
          <SheetTitle className="text-2xl font-bold text-slate-900 leading-tight">
            {data.label}
          </SheetTitle>
        </SheetHeader>

        {/* Status Section */}
        <div className="mb-8 p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-medium text-slate-500">Trạng thái</span>
            {data.status === 'on-track' && <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide">On Track</span>}
            {data.status === 'at-risk' && <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide">Cần chú ý</span>}
            {data.status === 'off-track' && <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide">Rủi ro</span>}
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-bold text-slate-900 tracking-tight">{data.progress}%</span>
            <span className="text-sm font-medium text-slate-400">vs Kế hoạch</span>
          </div>
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full",
                data.status === 'on-track' ? 'bg-green-500' :
                  data.status === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${data.progress}%` }}
            />
          </div>
        </div>

        {/* Goals Section */}
        <div className="mb-8">
          <h4 className="flex items-center gap-2.5 text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
            <Target className="w-4 h-4 text-green-600" />
            Mục tiêu (Goals)
          </h4>
          <div className="space-y-3">
            {data.goals?.map((goal, idx) => (
              <div key={idx} className="flex gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                <div className="mt-1">
                  {goal.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn("text-base font-medium text-slate-800", goal.isCompleted && "line-through text-slate-400")}>{goal.label}</p>
                  <p className="text-sm text-slate-500 mt-1">Hiện tại: <span className="font-semibold text-slate-700">{goal.current}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Strategies Section */}
        <div className="mb-8">
          <h4 className="flex items-center gap-2.5 text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
            <div className="w-2 h-2 rounded-full bg-purple-500 ring-2 ring-purple-100"></div>
            Chiến lược (Strategies)
          </h4>
          <ul className="space-y-4 pl-0">
            {data.strategies?.map((stm, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-600 leading-relaxed group">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0 group-hover:bg-purple-400 transition-colors"></div>
                <span className="flex-1 text-base">{stm}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-8" />

        {/* Owner Section */}
        <div className="pb-8">
          <h4 className="flex items-center gap-2.5 text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
            Chủ sở hữu
          </h4>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={data.ownerAvatar} />
              <AvatarFallback className="bg-slate-200 text-slate-600 font-semibold">{data.ownerName.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-bold text-slate-900">{data.ownerName}</p>
              <p className="text-sm text-slate-500">{data.ownerRole}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
