'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
  Calendar,
  User,
  MoveRight
} from 'lucide-react';
import {
  Perspective,
  perspectiveLabels,
  statusLabels,
  statusColors,
} from '@/data/mock-data';
import type { OKR } from '@/data/mock-data';
import { getThemeColors } from '@/lib/theme';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getOKRsByQuarter, updateOKRPositions } from '@/lib/supabase/queries/okrs';
import { mapOKRRow } from '@/lib/supabase/mappers';
import { useOrganization } from '@/contexts/organization-context';
import { formatQuarterLabel, quarterOptions } from '@/lib/period';

// Perspective Icons
const perspectiveIcons = {
  financial: DollarSign,
  external: Users,
  internal: Settings2,
  learning: BookOpen,
};

const perspectiveOrder: Perspective[] = ['financial', 'external', 'internal', 'learning'];

const getOGSMSource = (okr: OKR) => {
  if (okr.departmentId) {
    const details = [okr.departmentName, okr.linkedGoalName].filter(Boolean).join(' / ');
    return {
      href: '/ogsm/department',
      label: details ? `OGSM phòng ban: ${details}` : 'OGSM phòng ban',
    };
  }

  if (okr.linkedGoalName || okr.linkedObjectiveName) {
    const details = [okr.linkedObjectiveName, okr.linkedGoalName].filter(Boolean).join(' / ');
    return {
      href: '/ogsm',
      label: details ? `OGSM công ty: ${details}` : 'OGSM công ty',
    };
  }

  return null;
};

const normalizeSortOrder = (okrs: OKR[]) => {
  const nextIndex: Record<Perspective, number> = {
    financial: 0,
    external: 0,
    internal: 0,
    learning: 0,
  };

  return okrs.map((okr) => {
    if (typeof okr.sortOrder === 'number' && Number.isFinite(okr.sortOrder)) {
      return okr;
    }

    const sortOrder = nextIndex[okr.perspective];
    nextIndex[okr.perspective] = sortOrder + 1;
    return { ...okr, sortOrder };
  });
};

const sortOKRs = (okrs: OKR[]) => {
  const perspectiveIndex = new Map(perspectiveOrder.map((p, index) => [p, index]));
  return [...okrs].sort((a, b) => {
    const perspectiveDiff =
      (perspectiveIndex.get(a.perspective) ?? 0) - (perspectiveIndex.get(b.perspective) ?? 0);
    if (perspectiveDiff !== 0) {
      return perspectiveDiff;
    }

    const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : Number.MAX_SAFE_INTEGER;
    const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.id.localeCompare(b.id);
  });
};

export default function OKRsPage() {
  const [selectedPerspective, setSelectedPerspective] = useState<Perspective | 'all'>('all');
  const [expandedOKR, setExpandedOKR] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [managedOKRs, setManagedOKRs] = useState<OKR[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedOKRId, setSelectedOKRId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { organization, isLoading: isOrgLoading, activeQuarter, activeFiscalYear } = useOrganization();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    let isActive = true;

    const loadOKRs = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowserClient();
        const orgId = organization?.id;

        if (!orgId) {
          return;
        }

        const okrRows = await getOKRsByQuarter(
          supabase,
          activeQuarter,
          orgId,
          activeFiscalYear
        );
        if (!isActive) {
          return;
        }

        const mappedOKRs = normalizeSortOrder((okrRows || []).map(mapOKRRow));
        setManagedOKRs(sortOKRs(mappedOKRs));
      } catch (error) {
        console.error('Failed to load OKRs', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (!isOrgLoading) {
      loadOKRs();
    }

    return () => {
      isActive = false;
    };
  }, [isMounted, organization?.id, activeQuarter, activeFiscalYear, isOrgLoading]);

  const filteredOKRs =
    selectedPerspective === 'all'
      ? managedOKRs
      : managedOKRs.filter((o) => o.perspective === selectedPerspective);

  const toggleExpand = (id: string) => {
    setExpandedOKR(expandedOKR === id ? null : id);
  };

  const persistOKRPositions = async (items: OKR[]) => {
    if (items.length === 0) {
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const updates = items.map((okr) => ({
        id: okr.id,
        perspective: okr.perspective,
        sort_order: okr.sortOrder ?? 0,
      }));
      await updateOKRPositions(supabase, updates);
    } catch (error) {
      console.error('Failed to update OKR order', error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourcePerspective = source.droppableId as Perspective;
    const destinationPerspective = destination.droppableId as Perspective;
    const sourceItems = managedOKRs.filter((o) => o.perspective === sourcePerspective);
    const destinationItems = managedOKRs.filter((o) => o.perspective === destinationPerspective);

    if (sourcePerspective === destinationPerspective) {
      const reordered = Array.from(sourceItems);
      const [removed] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, removed);

      const orderedGroup = reordered.map((okr, index) => ({
        ...okr,
        sortOrder: index,
      }));
      const remaining = managedOKRs.filter((o) => o.perspective !== sourcePerspective);
      const nextOKRs = sortOKRs([...remaining, ...orderedGroup]);
      setManagedOKRs(nextOKRs);
      void persistOKRPositions(orderedGroup);
      return;
    }

    const sourceClone = Array.from(sourceItems);
    const [moved] = sourceClone.splice(source.index, 1);
    if (!moved) {
      return;
    }

    const destinationClone = Array.from(destinationItems);
    const movedWithPerspective = { ...moved, perspective: destinationPerspective };
    destinationClone.splice(destination.index, 0, movedWithPerspective);

    const orderedSource = sourceClone.map((okr, index) => ({
      ...okr,
      sortOrder: index,
    }));
    const orderedDestination = destinationClone.map((okr, index) => ({
      ...okr,
      sortOrder: index,
    }));

    const remaining = managedOKRs.filter(
      (o) => o.perspective !== sourcePerspective && o.perspective !== destinationPerspective
    );
    const nextOKRs = sortOKRs([...remaining, ...orderedSource, ...orderedDestination]);
    setManagedOKRs(nextOKRs);
    void persistOKRPositions([...orderedSource, ...orderedDestination]);
  };

  const activeOKR = managedOKRs.find(o => o.id === selectedOKRId);
  const activeTheme = activeOKR ? getThemeColors(activeOKR.perspective) : null;
  const activeOGSMSource = activeOKR ? getOGSMSource(activeOKR) : null;

  // If not mounted (SSR), render a placeholder or the non-dnd version to avoid hydration mismatch
  if (!isMounted || isLoading) {
    return <div className="p-10 flex justify-center text-slate-400">Loading...</div>;
  }

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
                      {quarterOptions.map((quarter) => (
                        <SelectItem key={quarter} value={quarter}>
                          {formatQuarterLabel(quarter, activeFiscalYear)}
                        </SelectItem>
                      ))}
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
        <Tabs defaultValue="board" className="space-y-6">
          <div className="sticky top-16 z-20 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 -mx-6 px-6 py-2 border-b border-slate-200 mb-6 shadow-sm transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="bg-white border shadow-sm self-start md:self-auto">
                <TabsTrigger value="board" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                  Board View
                </TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                  List View
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Board View by Perspective */}
          <TabsContent value="board">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {(['financial', 'external', 'internal', 'learning'] as const).map((perspective) => {
                  const perspectiveOKRs = managedOKRs.filter((o) => o.perspective === perspective);
                  const Icon = perspectiveIcons[perspective];
                  const theme = getThemeColors(perspective);

                  return (
                    <Card key={perspective} className="border-0 shadow-md overflow-hidden flex flex-col h-full bg-slate-50/50 p-0 gap-0">
                      <CardHeader className={`border-b ${theme.lightBg} px-5 py-4`}>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ${theme.textColor}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className={`text-base font-bold ${theme.textColor}`}>
                              {perspectiveLabels[perspective]}
                            </CardTitle>
                            <p className={`text-xs font-medium ${theme.subTextColor} opacity-80`}>{perspectiveOKRs.length} OKRs</p>
                          </div>
                        </div>
                      </CardHeader>
                      <Droppable droppableId={perspective}>
                        {(provided, snapshot) => (
                          <CardContent
                            className={`space-y-3 p-4 flex-1 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? theme.lightBg : ''}`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {perspectiveOKRs.map((okr, index) => {
                              const ogsmSource = getOGSMSource(okr);
                              return (
                                <Draggable key={okr.id} draggableId={okr.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => setSelectedOKRId(okr.id)}
                                      style={{
                                        ...provided.draggableProps.style,
                                        opacity: snapshot.isDragging ? 0.8 : 1,
                                      }}
                                      className={`rounded-xl border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md group relative overflow-hidden cursor-pointer ${snapshot.isDragging ? 'shadow-xl rotate-2 ring-2 ring-blue-400' : ''}`}
                                    >
                                      <div className={`absolute top-0 left-0 w-1 h-full ${theme.solidBg}`}></div>
                                      <div className="pl-2">
                                        <div className="flex items-start justify-between mb-2">
                                          <Badge
                                            variant="outline"
                                            className={`${statusColors[okr.status]} border-0 text-white text-[10px] px-1.5 py-0 h-5`}
                                          >
                                            {statusLabels[okr.status]}
                                          </Badge>
                                          <span className={`text-sm font-bold ${theme.textColor}`}>{okr.progress}%</span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900 leading-snug mb-3 hover:text-blue-700 transition-colors line-clamp-2">{okr.objective}</p>

                                        <div className="space-y-1">
                                          <Progress value={okr.progress} className={`h-1.5 bg-slate-100 [&>div]:${theme.progressBg} [&>div]:bg-current text-${theme.solidBg.replace('bg-', '')}`} />
                                          <div className="flex justify-between items-center pt-1">
                                            <p className="text-xs text-slate-500">
                                              {okr.keyResults.length} KRs
                                            </p>
                                            <p className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                                              {okr.owner}
                                            </p>
                                          </div>
                                        </div>

                                        {ogsmSource ? (
                                          <Link
                                            href={ogsmSource.href}
                                            className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600"
                                            onClick={(event) => event.stopPropagation()}
                                          >
                                            <span className="truncate">{ogsmSource.label}</span>
                                            <MoveRight className="h-3 w-3 shrink-0" />
                                          </Link>
                                        ) : (
                                          <p className="mt-2 text-[11px] text-slate-400">Chưa liên kết OGSM</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                            {perspectiveOKRs.length === 0 && (
                              <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                <p>Kéo thả vào đây</p>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Droppable>
                    </Card>
                  );
                })}
              </div>
            </DragDropContext>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            {/* Perspective Legend */}
            <div className="mb-6 flex flex-wrap gap-2 sticky top-[120px] z-10 py-2 -mx-6 px-6 bg-slate-50/90 backdrop-blur-sm border-b">
              {(Object.keys(perspectiveLabels) as Perspective[]).map(p => {
                const theme = getThemeColors(p);
                return (
                  <div key={p} className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${theme.lightBg} ${theme.textColor} text-[10px] font-bold border ${theme.borderColor.replace('border', 'border')} uppercase tracking-wide cursor-default hover:brightness-95 h-6`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${theme.solidBg}`}></div>
                    {perspectiveLabels[p]}
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              {filteredOKRs.map((okr) => {
                const Icon = perspectiveIcons[okr.perspective];
                const isExpanded = expandedOKR === okr.id;
                const theme = getThemeColors(okr.perspective);
                const ogsmSource = getOGSMSource(okr);

                return (
                  <Card key={okr.id} className="border-0 shadow-md transition-all hover:shadow-lg overflow-hidden p-0 gap-0">
                    <div className={`h-1.5 w-full ${theme.solidBg}`}></div>
                    <CardContent className="p-0">
                      <div
                        className="cursor-pointer p-6"
                        onClick={() => toggleExpand(okr.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div
                              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${theme.lightBg} ${theme.textColor}`}
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
                                <Badge variant="outline" className={`${theme.badgeBg} ${theme.badgeText} border-0`}>
                                  {perspectiveLabels[okr.perspective]}
                                </Badge>
                                <span className="text-sm text-slate-400">{okr.quarter}</span>
                              </div>
                              <h3 className="mt-2 text-lg font-semibold text-slate-900 leading-snug">
                                {okr.objective}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                Phụ trách: {okr.owner}
                              </p>
                              {ogsmSource ? (
                                <Link
                                  href={ogsmSource.href}
                                  className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <span className="truncate max-w-[320px]">{ogsmSource.label}</span>
                                  <MoveRight className="h-3 w-3 shrink-0" />
                                </Link>
                              ) : (
                                <p className="mt-1 text-xs text-slate-400">Chưa liên kết OGSM</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right w-32">
                              <div className="flex items-center justify-end gap-2 mb-1">
                                <span className="text-sm text-slate-500 font-medium">Tiến độ</span>
                                <span className={`text-xl font-bold ${theme.textColor}`}>{okr.progress}%</span>
                              </div>
                              <Progress value={okr.progress} className={`h-2 ${theme.lightBg} [&>div]:${theme.progressBg} [&>div]:bg-current text-${theme.solidBg.replace('bg-', '')}`} />
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
                        <div className="border-t bg-slate-50/50 p-6 animate-in slide-in-from-top-2 duration-300">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Target className="h-4 w-4" />
                              <h4 className="font-semibold">Key Results ({okr.keyResults.length})</h4>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="h-8">
                                <Pencil className="mr-1.5 h-3 w-3" />
                                Chỉnh sửa
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700">
                                <Trash2 className="mr-1.5 h-3 w-3" />
                                Xóa
                              </Button>
                            </div>
                          </div>
                          <div className="grid gap-3">
                            {okr.keyResults.map((kr, index) => {
                              const krProgress = Math.round((kr.current / kr.target) * 100);
                              return (
                                <div
                                  key={kr.id}
                                  className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
                                >
                                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${theme.lightBg} text-sm font-bold ${theme.textColor}`}>
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">{kr.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="px-1.5 py-0 h-5 font-medium bg-slate-100 text-slate-600">
                                        Mục tiêu: {kr.target} {kr.unit}
                                      </Badge>
                                      <span className="text-xs text-slate-400">•</span>
                                      <span className="text-xs text-slate-500">Hiện tại: <span className="font-medium text-slate-900">{kr.current}</span></span>
                                    </div>
                                  </div>
                                  <div className="w-full sm:w-48">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                      <span className="text-slate-500">Hoàn thành</span>
                                      <span className={`font-bold ${theme.textColor}`}>{krProgress}%</span>
                                    </div>
                                    <Progress value={krProgress} className={`h-2 bg-slate-100 [&>div]:${theme.progressBg} [&>div]:bg-current text-${theme.solidBg.replace('bg-', '')}`} />
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
            </div>
          </TabsContent>
        </Tabs>

        {/* OKR Detail Sheet */}
        <Sheet open={!!selectedOKRId} onOpenChange={(open) => !open && setSelectedOKRId(null)}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 gap-0 overflow-y-auto">
            {activeOKR && activeTheme && (
              <>
                <SheetHeader className={`p-6 pb-8 ${activeTheme.lightBg} border-b text-left`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${statusColors[activeOKR.status]} border-0 text-white shadow-sm`}>{statusLabels[activeOKR.status]}</Badge>
                    <Badge variant="outline" className={`${activeTheme.badgeBg} ${activeTheme.badgeText} border-0`}>{perspectiveLabels[activeOKR.perspective]}</Badge>
                  </div>
                  <SheetTitle className={`text-xl font-bold ${activeTheme.textColor} leading-normal`}>{activeOKR.objective}</SheetTitle>
                  <SheetDescription className="hidden"></SheetDescription>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white/60 px-2.5 py-1.5 rounded-lg border border-black/5">
                      <User className="h-4 w-4" />
                      {activeOKR.owner}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white/60 px-2.5 py-1.5 rounded-lg border border-black/5">
                      <Calendar className="h-4 w-4" />
                      {activeOKR.quarter}
                    </div>
                  </div>
                  {activeOGSMSource ? (
                    <Link
                      href={activeOGSMSource.href}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-700"
                    >
                      <span className="truncate">{activeOGSMSource.label}</span>
                      <MoveRight className="h-3 w-3 shrink-0" />
                    </Link>
                  ) : (
                    <p className="mt-3 text-xs text-slate-400">Chưa liên kết OGSM</p>
                  )}
                </SheetHeader>

                <div className="p-6 space-y-6">
                  {/* Overall Progress */}
                  <div className="bg-slate-50 p-4 rounded-xl border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-700">Tiến độ tổng thể</span>
                      <span className={`text-2xl font-bold ${activeTheme.textColor}`}>{activeOKR.progress}%</span>
                    </div>
                    <Progress value={activeOKR.progress} className={`h-3 bg-slate-200 [&>div]:${activeTheme.progressBg}`} />
                  </div>

                  {/* Key Results */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className={`h-5 w-5 ${activeTheme.textColor}`} />
                      <h3 className="font-semibold text-lg text-slate-800">Key Results ({activeOKR.keyResults.length})</h3>
                    </div>
                    <div className="grid gap-3">
                      {activeOKR.keyResults.map((kr, idx) => {
                        const krProgress = Math.round((kr.current / kr.target) * 100);
                        return (
                          <div key={kr.id} className="p-4 rounded-xl border bg-white shadow-sm hover:border-slate-300 transition-colors">
                            <div className="flex gap-3 mb-3">
                              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${activeTheme.lightBg} text-xs font-bold ${activeTheme.textColor}`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 leading-snug">{kr.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm mb-1.5">
                              <span className="text-slate-500">
                                {kr.current} / <strong>{kr.target} {kr.unit}</strong>
                              </span>
                              <span className={`font-bold ${activeTheme.textColor}`}>{krProgress}%</span>
                            </div>
                            <Progress value={krProgress} className={`h-2 bg-slate-100 [&>div]:${activeTheme.progressBg}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm text-slate-500 mb-3 uppercase tracking-wide">Thao tác</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="w-full justify-start h-10">
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa OKR
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa OKR
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
