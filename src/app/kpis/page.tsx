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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  Settings2,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Pencil
} from 'lucide-react';
import {
  Perspective,
  perspectiveLabels,
  statusLabels,
  statusColors,
} from '@/data/mock-data';
import type { KPI } from '@/data/mock-data';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { getThemeColors } from '@/lib/theme';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getKPIsByOrg } from '@/lib/supabase/queries/kpis';
import { mapKpiRow } from '@/lib/supabase/mappers';
import { useOrganization } from '@/contexts/organization-context';

const perspectiveIcons = { financial: DollarSign, external: Users, internal: Settings2, learning: BookOpen };
const statusIcons = { on_track: CheckCircle2, at_risk: AlertTriangle, off_track: XCircle, completed: CheckCircle2 };

export default function KPIsPage() {
  const router = useRouter();
  const [selectedPerspective, setSelectedPerspective] = useState<Perspective | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [managedKPIs, setManagedKPIs] = useState<KPI[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedKPIId, setSelectedKPIId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { organization, isLoading: isOrgLoading, activeFiscalYear } = useOrganization();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    let isActive = true;

    const loadKPIs = async () => {
      try {
        setIsLoading(true);
        const supabase = getSupabaseBrowserClient();
        const orgId = organization?.id;

        if (!orgId) {
          return;
        }

        const kpiRows = await getKPIsByOrg(
          supabase,
          orgId,
          activeFiscalYear,
          undefined,
          undefined,
          true
        );
        if (!isActive) {
          return;
        }

        setManagedKPIs((kpiRows || []).map(mapKpiRow));
      } catch (error) {
        console.error('Failed to load KPIs', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (!isOrgLoading) {
      loadKPIs();
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

    const movedKPI = managedKPIs.find(k => k.id === draggableId);
    if (!movedKPI) return;

    let newKPIs = Array.from(managedKPIs);

    if (source.droppableId !== destination.droppableId) {
      const newPerspective = destination.droppableId as Perspective;
      const updatedKPI = { ...movedKPI, perspective: newPerspective };
      newKPIs = newKPIs.map(k => k.id === draggableId ? updatedKPI : k);
      setManagedKPIs(newKPIs);
    } else {
      // Reordering logic (simplified)
      const perspective = source.droppableId as Perspective;
      const groupItems = newKPIs.filter(k => k.perspective === perspective);
      const [removed] = groupItems.splice(source.index, 1);
      groupItems.splice(destination.index, 0, removed);
      const otherItems = newKPIs.filter(k => k.perspective !== perspective);
      setManagedKPIs([...otherItems, ...groupItems]);
    }
  };

  const activeKPI = managedKPIs.find(k => k.id === selectedKPIId);
  const activeTheme = activeKPI ? getThemeColors(activeKPI.perspective) : null;

  const onTrack = managedKPIs.filter((k) => k.status === 'on_track').length;
  const atRisk = managedKPIs.filter((k) => k.status === 'at_risk').length;
  const offTrack = managedKPIs.filter((k) => k.status === 'off_track').length;

  if (!isMounted || isLoading) {
    return <div className="p-10 flex justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header title="KPIs" subtitle="Key Performance Indicators" />
      <div className="p-6">
        {/* Summary Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div><p className="text-emerald-100">Đúng tiến độ</p><p className="mt-1 text-4xl font-bold">{onTrack}</p></div>
              <CheckCircle2 className="h-12 w-12 text-emerald-200" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div><p className="text-amber-100">Có rủi ro</p><p className="mt-1 text-4xl font-bold">{atRisk}</p></div>
              <AlertTriangle className="h-12 w-12 text-amber-200" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div><p className="text-red-100">Chậm tiến độ</p><p className="mt-1 text-4xl font-bold">{offTrack}</p></div>
              <XCircle className="h-12 w-12 text-red-200" />
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="h-5 w-5 text-slate-400" />
            <Select value={selectedPerspective} onValueChange={(v) => setSelectedPerspective(v as Perspective | 'all')}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Perspective" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả Perspectives</SelectItem>
                <SelectItem value="financial">Tài chính</SelectItem>
                <SelectItem value="external">Khách hàng</SelectItem>
                <SelectItem value="internal">Quy trình nội bộ</SelectItem>
                <SelectItem value="learning">Học hỏi & Phát triển</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="on_track">Đúng tiến độ</SelectItem>
                <SelectItem value="at_risk">Có rủi ro</SelectItem>
                <SelectItem value="off_track">Chậm tiến độ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Tạo KPI mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo KPI mới</DialogTitle>
                <DialogDescription>Nhập thông tin cho chỉ số hiệu suất chính mới.</DialogDescription>
              </DialogHeader>
              {/* Placeholder Form */}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Tên KPI</Label>
                  <Input placeholder="Nhập tên KPI" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
                <Button onClick={() => setIsCreateDialogOpen(false)}>Lưu</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Board View with Drag & Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(['financial', 'external', 'internal', 'learning'] as const).map((perspective) => {
              if (selectedPerspective !== 'all' && selectedPerspective !== perspective) return null;

              const perspectiveKPIs = managedKPIs.filter((k) => k.perspective === perspective);
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
                        <p className={`text-xs font-medium ${theme.subTextColor} opacity-80`}>{perspectiveKPIs.length} KPIs</p>
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
                        {perspectiveKPIs.map((kpi, index) => {
                          if (selectedStatus !== 'all' && kpi.status !== selectedStatus) return null;

                          const StatusIcon = statusIcons[kpi.status];
                          const percentage = Math.round((kpi.current / kpi.target) * 100);

                          return (
                            <Draggable key={kpi.id} draggableId={kpi.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedKPIId(kpi.id)}
                                  style={{
                                    ...provided.draggableProps.style,
                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                  }}
                                  className={`rounded-xl border bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md group relative overflow-hidden cursor-pointer ${snapshot.isDragging ? 'shadow-xl rotate-2 ring-2 ring-blue-400' : ''}`}
                                >
                                  <div className={`absolute top-0 left-0 w-1 h-full ${theme.solidBg}`}></div>
                                  <div className="pl-2">
                                    <div className="flex items-start justify-between mb-2">
                                      <Badge className={`${statusColors[kpi.status]} border-0 text-white text-[10px] px-1.5 py-0 h-5`}>
                                        <StatusIcon className="mr-1 h-3 w-3" />{statusLabels[kpi.status]}
                                      </Badge>
                                      <span className={`text-xs font-bold ${kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-slate-500'}`}>
                                        {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3 inline" /> : kpi.trend === 'down' ? <TrendingDown className="h-3 w-3 inline" /> : <Minus className="h-3 w-3 inline" />}
                                      </span>
                                    </div>

                                    <h4
                                      className="font-medium text-slate-900 mb-1 leading-snug hover:text-blue-600 transition-colors hover:underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/kpis/${kpi.id}`);
                                      }}
                                    >
                                      {kpi.name}
                                    </h4>

                                    <div className="mt-3">
                                      <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-xl font-bold text-slate-900">{kpi.current}<span className="text-sm font-normal text-slate-500 ml-0.5">{kpi.unit}</span></span>
                                        <span className="text-xs text-slate-400">Target: {kpi.target}</span>
                                      </div>
                                      <Progress value={Math.min(percentage, 100)} className={`h-1.5 bg-slate-100 [&>div]:${theme.progressBg}`} />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {perspectiveKPIs.length === 0 && (
                          <div className="h-24 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
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

        {/* KPI Detail Sheet */}
        <Sheet open={!!selectedKPIId} onOpenChange={(open) => !open && setSelectedKPIId(null)}>
          <SheetContent side="right" className="w-[400px] sm:w-[600px] p-0 gap-0 overflow-y-auto">
            {activeKPI && activeTheme ? (
              <>
                <SheetHeader className={`p-6 pb-8 ${activeTheme.lightBg} border-b text-left`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${statusColors[activeKPI.status]} border-0 text-white shadow-sm`}>{statusLabels[activeKPI.status]}</Badge>
                    <Badge variant="outline" className={`${activeTheme.badgeBg} ${activeTheme.badgeText} border-0`}>{perspectiveLabels[activeKPI.perspective]}</Badge>
                  </div>
                  <SheetTitle className={`text-xl font-bold ${activeTheme.textColor} leading-normal`}>{activeKPI.name}</SheetTitle>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="bg-white/60 px-4 py-2 rounded-lg border border-black/5 text-center flex-1">
                      <p className="text-xs text-slate-500 font-medium uppercase">Hiện tại</p>
                      <p className={`text-2xl font-bold ${activeTheme.textColor}`}>{activeKPI.current} <span className="text-sm">{activeKPI.unit}</span></p>
                    </div>
                    <div className="bg-white/60 px-4 py-2 rounded-lg border border-black/5 text-center flex-1">
                      <p className="text-xs text-slate-500 font-medium uppercase">Mục tiêu</p>
                      <p className="text-2xl font-bold text-slate-700">{activeKPI.target} <span className="text-sm">{activeKPI.unit}</span></p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="p-6 space-y-6">
                  {/* History Chart */}
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Lịch sử biến động
                    </h3>
                    <div className="h-[250px] w-full border rounded-xl p-4 bg-slate-50/50">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activeKPI.history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={activeTheme.solidBg.replace('bg-', 'text-').replace('text-', '#').replace('blue-500', '#3b82f6').replace('amber-500', '#f59e0b').replace('emerald-500', '#10b981').replace('purple-500', '#a855f7')}
                            fill={activeTheme.solidBg.replace('bg-', 'text-').replace('text-', '#').replace('blue-500', '#3b82f6').replace('amber-500', '#f59e0b').replace('emerald-500', '#10b981').replace('purple-500', '#a855f7') + '33'}
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border">
                      <p className="text-sm text-slate-500 mb-1">Xu hướng</p>
                      <div className={`flex items-center gap-2 font-bold ${activeKPI.trend === 'up' ? 'text-emerald-600' : activeKPI.trend === 'down' ? 'text-red-600' : 'text-slate-600'}`}>
                        {activeKPI.trend === 'up' ? <TrendingUp className="h-5 w-5" /> : activeKPI.trend === 'down' ? <TrendingDown className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                        {activeKPI.trend === 'up' ? 'Đang tăng' : activeKPI.trend === 'down' ? 'Đang giảm' : 'Ổn định'}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border">
                      <p className="text-sm text-slate-500 mb-1">Hoàn thành</p>
                      <p className={`text-xl font-bold ${activeTheme.textColor}`}>
                        {Math.round((activeKPI.current / activeKPI.target) * 100)}%
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm text-slate-500 mb-3 uppercase tracking-wide">Thao tác</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="w-full justify-start h-10">
                        <Pencil className="mr-2 h-4 w-4" />
                        Cập nhật số liệu
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa KPI
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
