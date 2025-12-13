'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Plus,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Circle,
  Link2,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import {
  csfs,
  okrs,
  csfStatusLabels,
  csfStatusColors,
  priorityLabels,
  priorityColors,
  CSFStatus,
} from '@/data/mock-data';
import { useState } from 'react';

const statusColumns: { status: CSFStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'not_started', label: 'Chưa bắt đầu', icon: Circle, color: 'bg-gray-100 border-gray-300' },
  { status: 'in_progress', label: 'Đang thực hiện', icon: Clock, color: 'bg-blue-50 border-blue-300' },
  { status: 'completed', label: 'Hoàn thành', icon: CheckCircle2, color: 'bg-emerald-50 border-emerald-300' },
  { status: 'blocked', label: 'Bị chặn', icon: XCircle, color: 'bg-red-50 border-red-300' },
];

export default function CSFsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getRelatedOKRs = (relatedOKRIds: string[]) => {
    return okrs.filter((o) => relatedOKRIds.includes(o.id));
  };

  return (
    <div className="min-h-screen">
      <Header title="CSFs" subtitle="Critical Success Factors" />

      <div className="p-6">
        {/* Summary Stats */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            {statusColumns.map((col) => {
              const count = csfs.filter((c) => c.status === col.status).length;
              return (
                <div key={col.status} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 shadow-sm">
                  <col.icon className={`h-4 w-4 ${col.status === 'completed' ? 'text-emerald-500' :
                      col.status === 'in_progress' ? 'text-blue-500' :
                        col.status === 'blocked' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  <span className="text-sm font-medium text-slate-600">{col.label}:</span>
                  <span className="font-bold text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-md hover:from-emerald-700 hover:to-emerald-800">
                <Plus className="mr-2 h-4 w-4" />
                Tạo CSF mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Tạo Critical Success Factor mới</DialogTitle>
                <DialogDescription>Định nghĩa yếu tố thành công quan trọng cho chiến lược</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input id="title" placeholder="Ví dụ: Triển khai hệ thống ERP" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea id="description" placeholder="Chi tiết về CSF này..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Độ ưu tiên</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="critical">Quan trọng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Team</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="it">Công nghệ</SelectItem>
                        <SelectItem value="sales">Kinh doanh</SelectItem>
                        <SelectItem value="ops">Vận hành</SelectItem>
                        <SelectItem value="hr">Nhân sự</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Người phụ trách</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Chọn người phụ trách" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Nguyễn Văn An - CEO</SelectItem>
                      <SelectItem value="2">Lê Hoàng Nam - COO</SelectItem>
                      <SelectItem value="3">Võ Minh Tuấn - CTO</SelectItem>
                      <SelectItem value="4">Phạm Thị Hoa - CMO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Hạn hoàn thành</Label>
                  <Input type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700" onClick={() => setIsCreateDialogOpen(false)}>Tạo CSF</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statusColumns.map((column) => {
            const columnCSFs = csfs.filter((c) => c.status === column.status);
            return (
              <div key={column.status} className={`rounded-xl border-2 ${column.color} p-4`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <column.icon className={`h-5 w-5 ${column.status === 'completed' ? 'text-emerald-600' :
                        column.status === 'in_progress' ? 'text-blue-600' :
                          column.status === 'blocked' ? 'text-red-600' : 'text-gray-500'
                      }`} />
                    <h3 className="font-semibold text-slate-700">{column.label}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">{columnCSFs.length}</Badge>
                </div>

                <div className="space-y-3">
                  {columnCSFs.map((csf) => {
                    const relatedOKRs = getRelatedOKRs(csf.relatedOKRs);
                    return (
                      <Card key={csf.id} className="border shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <CardContent className="p-4">
                          {/* Priority & Menu */}
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={`${priorityColors[csf.priority]} border-0 text-white text-xs`}>
                              {priorityLabels[csf.priority]}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4 text-slate-400" />
                            </Button>
                          </div>

                          {/* Title */}
                          <h4 className="font-medium text-slate-900 mb-2">{csf.title}</h4>

                          {/* Description */}
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{csf.description}</p>

                          {/* Progress */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500">Tiến độ</span>
                              <span className="font-semibold text-slate-700">{csf.progress}%</span>
                            </div>
                            <Progress value={csf.progress} className="h-1.5" />
                          </div>

                          {/* Related OKRs */}
                          {relatedOKRs.length > 0 && (
                            <div className="mb-3 flex items-center gap-1 text-xs text-slate-500">
                              <Link2 className="h-3 w-3" />
                              <span>{relatedOKRs.length} OKRs liên quan</span>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between border-t pt-3">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <User className="h-3 w-3" />
                              <span>{csf.assignee}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(csf.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Add button */}
                <Button variant="ghost" className="mt-3 w-full border border-dashed text-slate-400 hover:text-slate-600 hover:border-slate-400">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm CSF
                </Button>
              </div>
            );
          })}
        </div>

        {/* Timeline View */}
        <Card className="mt-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Timeline CSFs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {csfs.map((csf, index) => (
                <div key={csf.id} className="flex gap-4 pb-6">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${csf.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        csf.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                          csf.status === 'blocked' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-500'
                      }`}>
                      {csf.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> :
                        csf.status === 'in_progress' ? <Clock className="h-4 w-4" /> :
                          csf.status === 'blocked' ? <XCircle className="h-4 w-4" /> :
                            <Circle className="h-4 w-4" />}
                    </div>
                    {index < csfs.length - 1 && <div className="h-full w-0.5 bg-slate-200" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-lg border bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${csfStatusColors[csf.status]} border-0 text-white text-xs`}>
                            {csfStatusLabels[csf.status]}
                          </Badge>
                          <Badge className={`${priorityColors[csf.priority]} border-0 text-white text-xs`}>
                            {priorityLabels[csf.priority]}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-slate-900">{csf.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">{csf.team} • {csf.assignee}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">{csf.progress}%</p>
                        <p className="text-xs text-slate-500">Hạn: {new Date(csf.dueDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
