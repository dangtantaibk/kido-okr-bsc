'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Lightbulb,
} from 'lucide-react';
import {
  weeklyActions,
  actionStatusLabels,
  actionStatusColors,
} from '@/data/mock-data';
import { useState } from 'react';

export default function ActionsPage() {
  const [selectedWeek, setSelectedWeek] = useState<string>('all');

  const weeks = [...new Set(weeklyActions.map(a => a.week))];

  const filteredActions = selectedWeek === 'all'
    ? weeklyActions
    : weeklyActions.filter(a => a.week === selectedWeek);

  // Group by week
  const groupedByWeek = filteredActions.reduce((acc, action) => {
    if (!acc[action.week]) acc[action.week] = [];
    acc[action.week].push(action);
    return acc;
  }, {} as Record<string, typeof weeklyActions>);

  const statusCounts = {
    done: weeklyActions.filter(a => a.status === 'done').length,
    pending: weeklyActions.filter(a => a.status === 'pending').length,
  };

  return (
    <div className="min-h-screen">
      <Header title="Action Weekly Log" subtitle="Theo dõi hành động hàng tuần" />

      <div className="p-6">
        {/* Info Card */}
        <Card className="mb-6 border-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Lightbulb className="h-8 w-8 text-purple-200" />
              <div>
                <h3 className="font-bold text-lg">Tư duy Solution</h3>
                <p className="mt-1 text-purple-100">
                  Nhân viên không chỉ liệt kê "Làm gì" (Action), mà phải tư duy "Cách làm nào mới" (Solution) để đạt được mục tiêu khó.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Card className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tổng actions</p>
                <p className="text-2xl font-bold">{weeklyActions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Hoàn thành</p>
                <p className="text-2xl font-bold">{statusCounts.done}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Đang chờ</p>
                <p className="text-2xl font-bold">{statusCounts.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Completion rate</p>
                <p className="text-2xl font-bold">{Math.round((statusCounts.done / weeklyActions.length) * 100)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Add */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-slate-400" />
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tuần" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tuần</SelectItem>
                {weeks.map(week => (
                  <SelectItem key={week} value={week}>{week}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Thêm Action
          </Button>
        </div>

        {/* Actions by Week */}
        {Object.entries(groupedByWeek).map(([week, actions]) => (
          <Card key={week} className="mb-6 border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">{week}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {actions.map((action) => (
                  <div key={action.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="grid gap-4 md:grid-cols-6">
                      {/* Goal */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Mục tiêu liên kết</p>
                        <Badge variant="outline" className="font-medium">{action.linkedGoal}</Badge>
                      </div>

                      {/* Solution */}
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Giải pháp (Solution)</p>
                        <p className="text-sm text-slate-700">{action.solution}</p>
                      </div>

                      {/* Activity */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Hoạt động</p>
                        <p className="text-sm font-medium text-slate-900">{action.activity}</p>
                      </div>

                      {/* Owner */}
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Người làm</p>
                        <p className="text-sm text-slate-700">{action.owner}</p>
                      </div>

                      {/* Status & Result */}
                      <div className="text-right">
                        <Badge className={`${actionStatusColors[action.status]} text-white mb-1`}>
                          {actionStatusLabels[action.status]}
                        </Badge>
                        <p className="text-xs text-slate-500">{action.result}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
