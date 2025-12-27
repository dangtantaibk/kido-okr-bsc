'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useTimeEntries, groupTimeEntriesByDate, groupTimeEntriesByUser } from '@/hooks/use-time-entries';
import { Loader2 } from 'lucide-react';

interface TimeReportChartsProps {
  projectId: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function TimeReportCharts({ projectId }: TimeReportChartsProps) {
  const { data: entries = [], isLoading } = useTimeEntries(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (entries.length === 0) {
    return null;
  }

  const byDate = groupTimeEntriesByDate(entries).slice(-14); // Last 14 days
  const byUser = groupTimeEntriesByUser(entries).slice(0, 7); // Top 7 users

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hours by Date */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-medium text-slate-700 mb-4">Giờ làm việc theo ngày</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={byDate}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)} // Show MM-DD
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}h`, 'Giờ']}
              labelFormatter={(label) => `Ngày: ${label}`}
            />
            <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hours by User */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-medium text-slate-700 mb-4">Phân bổ theo người</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={byUser}
              dataKey="hours"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {byUser.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)}h`, 'Giờ']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
