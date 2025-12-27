'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, GitBranch, Layers, ClipboardList } from 'lucide-react';
import type { KanbanGroupBy } from '@/types/openproject';

interface GroupSwitcherProps {
  value: KanbanGroupBy;
  onChange: (value: KanbanGroupBy) => void;
}

const GROUP_OPTIONS: { value: KanbanGroupBy; label: string; icon: React.ReactNode }[] = [
  { value: 'status', label: 'Trạng thái', icon: <ClipboardList className="h-4 w-4" /> },
  { value: 'assignee', label: 'Người thực hiện', icon: <Users className="h-4 w-4" /> },
  { value: 'version', label: 'Version', icon: <GitBranch className="h-4 w-4" /> },
  // { value: 'parent', label: 'Parent', icon: <Layers className="h-4 w-4" /> },
];

export function GroupSwitcher({ value, onChange }: GroupSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Nhóm theo:</span>
      <Select value={value} onValueChange={(v) => onChange(v as KanbanGroupBy)}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GROUP_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
