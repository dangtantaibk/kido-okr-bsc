'use client';

import { useState, useEffect } from 'react';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
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
  Target,
  Pencil,
  Trash2,
  Users, // Import Users
} from 'lucide-react';
import {
  csfStatusLabels,
  csfStatusColors,
  priorityColors,
  priorityLabels,
  CSFStatus,
  perspectiveLabels,
  statusColors,
  statusLabels,
} from '@/data/mock-data';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useRouter } from 'next/navigation'; // Import useRouter
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getCSFs } from '@/lib/supabase/queries/csfs';
import { mapCSFRow, type CSFWithRelations } from '@/lib/supabase/mappers';
import { useOrganization } from '@/contexts/organization-context';

const statusColumns: { status: CSFStatus; label: string; icon: React.ElementType; color: string; headerColor: string }[] = [
  { status: 'not_started', label: 'Chưa bắt đầu', icon: Circle, color: 'bg-gray-100 border-gray-300', headerColor: 'bg-gray-50' },
  { status: 'in_progress', label: 'Đang thực hiện', icon: Clock, color: 'bg-emerald-50 border-emerald-300', headerColor: 'bg-blue-50' },
  { status: 'completed', label: 'Hoàn thành', icon: CheckCircle2, color: 'bg-blue-50 border-blue-300', headerColor: 'bg-emerald-50' },
  { status: 'blocked', label: 'Bị chặn', icon: XCircle, color: 'bg-red-50 border-red-300', headerColor: 'bg-red-50' },
];

export default function CSFsPage() {
  const router = useRouter(); // Init router
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [managedCSFs, setManagedCSFs] = useState<CSFWithRelations[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCSFId, setSelectedCSFId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { organization, activeFiscalYear, isLoading: isOrgLoading } = useOrganization();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    let isActive = true;

    const loadCSFs = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowserClient();
        const orgId = organization?.id;

        if (!orgId) {
          return;
        }

        const csfRows = await getCSFs(supabase, orgId, activeFiscalYear);
        if (!isActive) {
          return;
        }

        setManagedCSFs((csfRows || []).map(mapCSFRow));
      } catch (error) {
        console.error('Failed to load CSFs', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (!isOrgLoading) {
      loadCSFs();
    }

    return () => {
      isActive = false;
    };
  }, [isMounted, organization?.id, activeFiscalYear, isOrgLoading]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const movedCSF = managedCSFs.find(c => c.id === draggableId);
    if (!movedCSF) return;

    let newCSFs = Array.from(managedCSFs);

    // If moving to a different column (status)
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId as CSFStatus;
      const updatedCSF = { ...movedCSF, status: newStatus };
      newCSFs = newCSFs.map(c => c.id === draggableId ? updatedCSF : c);
      setManagedCSFs(newCSFs);
    } else {
      // Reordering logic
      const status = source.droppableId as CSFStatus;
      const groupItems = newCSFs.filter(c => c.status === status);
      const [removed] = groupItems.splice(source.index, 1);
      groupItems.splice(destination.index, 0, removed);
      const otherItems = newCSFs.filter(c => c.status !== status);
      setManagedCSFs([...otherItems, ...groupItems]);
    }
  };

  const activeCSF = managedCSFs.find(c => c.id === selectedCSFId);
  const activeRelatedOKRs = activeCSF?.relatedOKRs ?? [];

  if (!isMounted || isLoading) {
    return <div className="p-10 flex justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header title="CSFs" subtitle="Critical Success Factors" />

      <div className="p-6">
        {/* Summary Stats */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            {statusColumns.map((col) => {
              const count = managedCSFs.filter((c) => c.status === col.status).length;
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

        {/* Kanban Board with Drag & Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statusColumns.map((column) => {
              const columnCSFs = managedCSFs.filter((c) => c.status === column.status);

              return (
                <div key={column.status} className="flex flex-col h-full rounded-xl border-2 border-slate-200 bg-slate-50/50 overflow-hidden">
                  <div className={`p-4 border-b ${column.headerColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <column.icon className={`h-5 w-5 ${column.status === 'completed' ? 'text-emerald-600' :
                          column.status === 'in_progress' ? 'text-blue-600' :
                            column.status === 'blocked' ? 'text-red-600' : 'text-gray-500'
                          }`} />
                        <h3 className="font-semibold text-slate-700">{column.label}</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-white shadow-sm font-bold">{columnCSFs.length}</Badge>
                    </div>
                  </div>

                  <Droppable droppableId={column.status}>
                    {(provided, snapshot) => (
                      <div
                        className={`flex-1 space-y-3 p-3 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-100' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {columnCSFs.map((csf, index) => {
                          const relatedOKRs = csf.relatedOKRs;
                          return (
                            <Draggable key={csf.id} draggableId={csf.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedCSFId(csf.id)}
                                  style={{
                                    ...provided.draggableProps.style,
                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                  }}
                                  className={`border shadow-sm hover:shadow-md transition-all cursor-pointer p-0 gap-0 group relative overflow-hidden bg-white ${snapshot.isDragging ? 'shadow-xl rotate-2 ring-2 ring-blue-400' : ''}`}
                                >
                                  <div className={`absolute top-0 left-0 w-1 h-full ${csf.status === 'in_progress' ? 'bg-blue-500' :
                                    csf.status === 'completed' ? 'bg-emerald-500' :
                                      csf.status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                                    }`}></div>
                                  <CardContent className="p-4 pl-5">
                                    {/* Priority & Menu */}
                                    <div className="flex items-start justify-between mb-2">
                                      <Badge className={`${priorityColors[csf.priority]} border-0 text-white text-[10px] px-1.5 h-5`}>
                                        {priorityLabels[csf.priority]}
                                      </Badge>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                      </Button>
                                    </div>

                                    {/* Title */}
                                    {/* Title */}
                                    <h4
                                      className="font-medium text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors hover:underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/csfs/${csf.id}`);
                                      }}
                                    >
                                      {csf.title}
                                    </h4>

                                    {/* Description */}
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{csf.description}</p>

                                    {/* Progress */}
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-slate-500">Tiến độ</span>
                                        <span className="font-semibold text-slate-700">{csf.progress}%</span>
                                      </div>
                                      <Progress value={csf.progress} className={`h-1.5 bg-slate-100 [&>div]:${csf.status === 'in_progress' ? 'bg-blue-500' :
                                        csf.status === 'completed' ? 'bg-emerald-500' :
                                          csf.status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                                        }`} />
                                    </div>

                                    {/* Related OKRs */}
                                    {relatedOKRs.length > 0 && (
                                      <div className="mb-3 flex items-center gap-1 text-xs text-slate-500">
                                        <Link2 className="h-3 w-3" />
                                        <span>{relatedOKRs.length} OKRs liên quan</span>
                                      </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between border-t pt-3 mt-auto">
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
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {columnCSFs.length === 0 && (
                          <div className="h-24 flex items-center justify-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-lg">
                            <p>Kéo thẻ vào đây</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>

                  {/* Add button */}
                  <div className="p-3 bg-slate-50 border-t">
                    <Button variant="ghost" className="w-full border border-dashed text-slate-400 hover:text-slate-600 hover:border-slate-400 h-9 text-sm">
                      <Plus className="mr-2 h-3 w-3" />
                      Thêm CSF
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DragDropContext>

        {/* Timeline View */}
        <Card className="mt-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Timeline CSFs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {managedCSFs.map((csf, index) => (
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
                    {index < managedCSFs.length - 1 && <div className="h-full w-0.5 bg-slate-200" />}
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

        {/* CSF Detail Sheet */}
        <Sheet open={!!selectedCSFId} onOpenChange={(open) => !open && setSelectedCSFId(null)}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 gap-0 overflow-y-auto">
            {activeCSF && (
              <>
                <SheetHeader className="p-6 pb-8 bg-slate-50 border-b text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${csfStatusColors[activeCSF.status]} border-0 text-white shadow-sm`}>{csfStatusLabels[activeCSF.status]}</Badge>
                    <Badge className={`${priorityColors[activeCSF.priority]} border-0 text-white shadow-sm`}>{priorityLabels[activeCSF.priority]}</Badge>
                  </div>
                  <SheetTitle className="text-xl font-bold text-slate-900 leading-normal">{activeCSF.title}</SheetTitle>
                  <SheetDescription className="text-slate-500 mt-2">{activeCSF.description}</SheetDescription>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white/60 px-2.5 py-1.5 rounded-lg border border-black/5">
                      <User className="h-4 w-4" />
                      {activeCSF.assignee}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white/60 px-2.5 py-1.5 rounded-lg border border-black/5">
                      <Users className="h-4 w-4" />
                      Team: {activeCSF.team}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white/60 px-2.5 py-1.5 rounded-lg border border-black/5">
                      <Calendar className="h-4 w-4" />
                      Hạn: {new Date(activeCSF.dueDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </SheetHeader>

                <div className="p-6 space-y-6">
                  {/* Overall Progress */}
                  <div className="bg-slate-50 p-4 rounded-xl border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-700">Tiến độ thực hiện</span>
                      <span className="text-2xl font-bold text-slate-900">{activeCSF.progress}%</span>
                    </div>
                    <Progress value={activeCSF.progress} className={`h-3 bg-slate-200 [&>div]:${activeCSF.status === 'in_progress' ? 'bg-blue-500' :
                      activeCSF.status === 'completed' ? 'bg-emerald-500' :
                        activeCSF.status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                  </div>

                  {/* Related OKRs */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-slate-700" />
                      <h3 className="font-semibold text-lg text-slate-800">OKRs Liên quan ({activeRelatedOKRs.length})</h3>
                    </div>
                    {activeRelatedOKRs.length > 0 ? (
                      <div className="grid gap-3">
                        {activeRelatedOKRs.map((okr, idx) => (
                          <div key={okr.id} className="p-4 rounded-xl border bg-white shadow-sm hover:border-blue-300 transition-colors">
                            <div className="flex gap-3 mb-2">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 leading-snug text-sm">{okr.objective}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs mb-1.5 pl-9">
                              <span className="text-slate-500">
                                {perspectiveLabels[okr.perspective]}
                              </span>
                              <Badge variant="outline" className={`${statusColors[okr.status]} border-0 text-white text-[10px] px-1.5 h-4`}>
                                {statusLabels[okr.status]}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Không có OKR nào được liên kết.</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm text-slate-500 mb-3 uppercase tracking-wide">Thao tác</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="w-full justify-start h-10">
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa CSF
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa CSF
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}
