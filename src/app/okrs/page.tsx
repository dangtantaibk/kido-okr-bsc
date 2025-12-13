'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  Target,
  Pencil,
  Trash2,
  DollarSign,
  Users,
  Settings2,
  BookOpen,
} from 'lucide-react';
import {
  okrs,
  OKR,
  Perspective,
  perspectiveLabels,
  perspectiveColors,
  statusLabels,
  statusColors,
} from '@/data/mock-data';

// Perspective Icons
const perspectiveIcons = {
  financial: DollarSign,
  external: Users,
  internal: Settings2,
  learning: BookOpen,
};

export default function OKRsPage() {
  const [selectedPerspective, setSelectedPerspective] = useState<Perspective | 'all'>('all');
  const [expandedOKR, setExpandedOKR] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredOKRs =
    selectedPerspective === 'all'
      ? okrs
      : okrs.filter((o) => o.perspective === selectedPerspective);

  const toggleExpand = (id: string) => {
    setExpandedOKR(expandedOKR === id ? null : id);
  };

  return (
    <div className="min-h-screen">
      <Header title="OKRs" subtitle="Objectives & Key Results" />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-slate-400" />
            <Select
              value={selectedPerspective}
              onValueChange={(value) => setSelectedPerspective(value as Perspective | 'all')}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo Perspective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Perspectives</SelectItem>
                <SelectItem value="financial">Tài chính</SelectItem>
                <SelectItem value="external">Khách hàng</SelectItem>
                <SelectItem value="internal">Quy trình nội bộ</SelectItem>
                <SelectItem value="learning">Học hỏi & Phát triển</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-md hover:from-blue-700 hover:to-blue-800">
                <Plus className="mr-2 h-4 w-4" />
                Tạo OKR mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo OKR mới</DialogTitle>
                <DialogDescription>
                  Định nghĩa mục tiêu và các Key Results cho quý này
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="objective">Objective (Mục tiêu)</Label>
                  <Textarea
                    id="objective"
                    placeholder="Ví dụ: Tăng trưởng doanh thu 15% so với cùng kỳ"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="perspective">Perspective</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn Perspective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Tài chính</SelectItem>
                        <SelectItem value="external">Khách hàng</SelectItem>
                        <SelectItem value="internal">Quy trình nội bộ</SelectItem>
                        <SelectItem value="learning">Học hỏi & Phát triển</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quarter">Quý</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn quý" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                        <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                        <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                        <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner">Người phụ trách</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn người phụ trách" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Nguyễn Văn An - CEO</SelectItem>
                      <SelectItem value="2">Trần Thị Mai - CFO</SelectItem>
                      <SelectItem value="3">Lê Hoàng Nam - COO</SelectItem>
                      <SelectItem value="4">Phạm Thị Hoa - CMO</SelectItem>
                      <SelectItem value="5">Võ Minh Tuấn - CTO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Label>Key Results</Label>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-1 h-3 w-3" />
                      Thêm KR
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 rounded-lg border bg-slate-50 p-3">
                      <Input placeholder="Ví dụ: Đạt 8,000 tỷ doanh thu" />
                      <Input placeholder="Mục tiêu" className="w-24" />
                      <Input placeholder="Đơn vị" className="w-24" />
                    </div>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 rounded-lg border bg-slate-50 p-3">
                      <Input placeholder="Ví dụ: Mở rộng 50 đại lý mới" />
                      <Input placeholder="Mục tiêu" className="w-24" />
                      <Input placeholder="Đơn vị" className="w-24" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Tạo OKR
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* OKRs by Perspective Tabs */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
            <TabsTrigger value="board">Theo Perspective</TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {filteredOKRs.map((okr) => {
              const Icon = perspectiveIcons[okr.perspective];
              const isExpanded = expandedOKR === okr.id;

              return (
                <Card key={okr.id} className="border-0 shadow-md transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    <div
                      className="cursor-pointer p-6"
                      onClick={() => toggleExpand(okr.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${okr.perspective === 'financial'
                                ? 'bg-blue-100 text-blue-600'
                                : okr.perspective === 'external'
                                  ? 'bg-amber-100 text-amber-600'
                                  : okr.perspective === 'internal'
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'bg-purple-100 text-purple-600'
                              }`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`${statusColors[okr.status]} border-0 text-white`}
                              >
                                {statusLabels[okr.status]}
                              </Badge>
                              <Badge variant="outline" className="text-slate-500">
                                {perspectiveLabels[okr.perspective]}
                              </Badge>
                              <span className="text-sm text-slate-400">{okr.quarter}</span>
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-slate-900">
                              {okr.objective}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Phụ trách: {okr.owner} • {okr.keyResults.length} Key Results
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900">{okr.progress}%</p>
                            <Progress value={okr.progress} className="mt-1 h-2 w-24" />
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Key Results */}
                    {isExpanded && (
                      <div className="border-t bg-slate-50 p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="font-semibold text-slate-700">Key Results</h4>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Pencil className="mr-1 h-3 w-3" />
                              Chỉnh sửa
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="mr-1 h-3 w-3" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {okr.keyResults.map((kr, index) => {
                            const krProgress = Math.round((kr.current / kr.target) * 100);
                            return (
                              <div
                                key={kr.id}
                                className="flex items-center gap-4 rounded-lg border bg-white p-4"
                              >
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{kr.title}</p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Hiện tại: {kr.current} / Mục tiêu: {kr.target} {kr.unit}
                                  </p>
                                </div>
                                <div className="w-32">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Tiến độ</span>
                                    <span className="font-semibold">{krProgress}%</span>
                                  </div>
                                  <Progress value={krProgress} className="mt-1 h-2" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Board View by Perspective */}
          <TabsContent value="board">
            <div className="grid gap-6 md:grid-cols-2">
              {(['financial', 'external', 'internal', 'learning'] as const).map((perspective) => {
                const perspectiveOKRs = okrs.filter((o) => o.perspective === perspective);
                const Icon = perspectiveIcons[perspective];

                return (
                  <Card key={perspective} className="border-0 shadow-md">
                    <CardHeader className="border-b bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${perspective === 'financial'
                              ? 'bg-blue-100 text-blue-600'
                              : perspective === 'external'
                                ? 'bg-amber-100 text-amber-600'
                                : perspective === 'internal'
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-purple-100 text-purple-600'
                            }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {perspectiveLabels[perspective]}
                          </CardTitle>
                          <p className="text-sm text-slate-500">{perspectiveOKRs.length} OKRs</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                      {perspectiveOKRs.map((okr) => (
                        <div
                          key={okr.id}
                          className="rounded-lg border bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <Badge
                              variant="outline"
                              className={`${statusColors[okr.status]} border-0 text-white`}
                            >
                              {statusLabels[okr.status]}
                            </Badge>
                            <span className="text-lg font-bold text-slate-900">{okr.progress}%</span>
                          </div>
                          <p className="mt-2 text-sm font-medium text-slate-900">{okr.objective}</p>
                          <div className="mt-2">
                            <Progress value={okr.progress} className="h-1.5" />
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            {okr.keyResults.length} Key Results • {okr.owner}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
