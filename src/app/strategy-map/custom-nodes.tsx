import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { StrategyNodeData } from './mock-data';

// --- Utils ---
const getStatusColor = (status: StrategyNodeData['status']) => {
  switch (status) {
    case 'on-track': return 'bg-green-500 text-green-700';
    case 'at-risk': return 'bg-yellow-500 text-yellow-700';
    case 'off-track': return 'bg-red-500 text-red-700';
    default: return 'bg-gray-500 text-gray-700';
  }
};

const getStatusText = (status: StrategyNodeData['status']) => {
  switch (status) {
    case 'on-track': return 'ON TRACK';
    case 'at-risk': return 'CẦN CHÚ Ý';
    case 'off-track': return 'RỦI RO';
    default: return 'UNKNOWN';
  }
}

const getStatusBadgeColor = (status: StrategyNodeData['status']) => {
  switch (status) {
    case 'on-track': return 'bg-green-100 text-green-800 border-green-200';
    case 'at-risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'off-track': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// --- Components ---

const GoalNode = ({ data, selected }: { data: StrategyNodeData; selected: boolean }) => {
  const badgeClass = getStatusBadgeColor(data.status);
  const progressColorClass = data.status === 'on-track' ? 'bg-green-500' : data.status === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={cn("relative group", selected && "ring-2 ring-primary ring-offset-2 rounded-xl")}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-slate-300 border-2 border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
      />

      <Card className="w-[280px] shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white border-slate-200 rounded-xl overflow-hidden">
        <div className="absolute top-3 right-3">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide", badgeClass)}>
            {getStatusText(data.status)}
          </span>
        </div>

        <CardContent className="p-4 pt-8">
          <div className="mb-3">
            <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">
              {data.label}
            </h3>
          </div>

          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Progress</span>
              <span>{data.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500 ease-in-out", progressColorClass)}
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-slate-100">
                <AvatarImage src={data.ownerAvatar} alt={data.ownerName} />
                <AvatarFallback className="text-[9px] bg-slate-100 text-slate-600">
                  {data.ownerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {data.code}
            </span>
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-slate-300 border-2 border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
    </div>
  );
};

const LabelNode = ({ data }: { data: { label: string; color: string } }) => {
  return (
    <div className="flex items-start w-[200px] pointer-events-none">
      <div className="w-1 h-12 rounded-full mr-3" style={{ backgroundColor: data.color }}></div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">
          {data.label}
        </span>
      </div>
    </div>
  );
}

export const nodeTypes = {
  goal: memo(GoalNode),
  layerLabel: memo(LabelNode),
};
