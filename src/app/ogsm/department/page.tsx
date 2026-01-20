'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Building2,
  Target,
  Lightbulb,
  BarChart3,
  TrendingUp,
  Users,
  Sparkles,
  Globe,
  Wallet,
  ArrowRight,
  Filter,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import {
  perspectiveColors,
  perspectiveLabels,
  Perspective,
} from '@/data/mock-data';
import type { DepartmentOGSM, OGSMGoal, OGSMObjective } from '@/data/mock-data';
import Link from 'next/link';
import { InteractiveGraph } from '../interactive-graph';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getObjectivesWithCascade } from '@/lib/supabase/queries/ogsm';
import { useOrganization } from '@/contexts/organization-context';

// --- Helpers ---

// Logic to derive Perspective from the linked Company Goal
const getPerspectiveForDept = (
  linkedGoalId: string | undefined,
  ogsmGoals: OGSMGoal[],
  ogsmObjectives: OGSMObjective[]
): Perspective | null => {
  if (!linkedGoalId) return null;
  const goal = ogsmGoals.find(g => g.id === linkedGoalId);
  if (!goal) return null;
  const objective = ogsmObjectives.find(o => o.id === goal.objectiveId);
  if (!objective) return null;
  return objective.perspective;
};

const getThemeColors = (p: Perspective) => {
  const baseBg = perspectiveColors[p];
  const colorName = baseBg.replace('bg-', '').replace('-500', '');

  return {
    solidBg: `bg-${colorName}-500`,
    lightBg: `bg-${colorName}-50`,
    borderColor: `border-${colorName}-500`,
    textColor: `text-${colorName}-700`,
    subTextColor: `text-${colorName}-600`,
    gradientFrom: `from-${colorName}-50`,
    badgeBg: `bg-${colorName}-100`,
    badgeText: `text-${colorName}-700`,
    progressBg: `bg-${colorName}-500`,
    iconColor: `text-${colorName}-600`,
    hoverBg: `hover:bg-${colorName}-50`,
  };
};

const formatOwnerLabel = (owner?: { full_name?: string | null; email?: string | null; role?: string | null } | null) => {
  const name = owner?.full_name || owner?.email || '';
  const role = owner?.role || '';

  if (!name) {
    return role;
  }

  return role ? `${name} (${role})` : name;
};

type MeasureForm = {
  id?: string;
  name: string;
  kpiId?: string | null;
};

type DepartmentOGSMRecord = DepartmentOGSM & {
  departmentId?: string | null;
  ownerId?: string | null;
  linkedGoalId?: string | null;
  measureItems: MeasureForm[];
};

type DepartmentFormState = {
  departmentId: string;
  linkedGoalId: string;
  objective: string;
  purpose: string;
  strategy: string;
  ownerId: string;
  progress: string;
  measures: MeasureForm[];
};

const defaultFormState: DepartmentFormState = {
  departmentId: '',
  linkedGoalId: '',
  objective: '',
  purpose: '',
  strategy: '',
  ownerId: '',
  progress: '0',
  measures: [],
};

type DialogState = {
  mode: 'create' | 'edit';
  targetId?: string;
};

export default function OGSMDepartmentPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [departmentOGSMs, setDepartmentOGSMs] = useState<DepartmentOGSMRecord[]>([]);
  const [ogsmGoals, setOgsmGoals] = useState<OGSMGoal[]>([]);
  const [ogsmObjectives, setOgsmObjectives] = useState<OGSMObjective[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name: string; email?: string | null; role?: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [formState, setFormState] = useState<DepartmentFormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [initialMeasureIds, setInitialMeasureIds] = useState<string[]>([]);
  const [graphRefreshKey, setGraphRefreshKey] = useState(0);
  const { organization, activeFiscalYear, isLoading: isOrgLoading } = useOrganization();

  const loadData = useCallback(async (isActiveRef?: { current: boolean }) => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const orgId = organization?.id;

      if (!orgId) {
        return;
      }

      const [objectiveRows, departmentRows, userRows] = await Promise.all([
        getObjectivesWithCascade(supabase, orgId, activeFiscalYear),
        supabase
          .from('okr_departments')
          .select('id, name')
          .eq('organization_id', orgId)
          .order('name', { ascending: true }),
        supabase
          .from('okr_users')
          .select('id, full_name, email, role')
          .eq('organization_id', orgId)
          .order('full_name', { ascending: true }),
      ]);

      if (departmentRows.error) {
        throw departmentRows.error;
      }

      if (userRows.error) {
        throw userRows.error;
      }

      if (isActiveRef && !isActiveRef.current) {
        return;
      }

      const objectives = (objectiveRows || []).map((obj: any) => ({
        id: obj.id,
        name: obj.name || '',
        description: obj.description || '',
        perspective: obj.perspective || 'financial',
      }));

      const goals = (objectiveRows || []).flatMap((obj: any) =>
        (obj.goals || []).map((goal: any) => ({
          id: goal.id,
          objectiveId: obj.id,
          name: goal.name || '',
          target:
            goal.target_text ||
            (goal.target_value
              ? `${goal.target_value}${goal.target_unit ? ` ${goal.target_unit}` : ''}`
              : ''),
          owner: formatOwnerLabel(goal.owner),
          progress: Number(goal.progress || 0),
        }))
      );

      const departmentRowsMapped = (objectiveRows || []).flatMap((obj: any) =>
        (obj.goals || []).flatMap((goal: any) =>
          (goal.department_ogsms || []).map((dept: any) => ({
            id: dept.id,
            department: dept.department?.name || '',
            departmentId: dept.department_id || dept.department?.id || null,
            purpose: dept.purpose || '',
            objective: dept.objective || '',
            strategy: dept.strategy || '',
            measures: (dept.measures || []).map((measure: any) => measure?.name || ''),
            measureItems: (dept.measures || [])
              .map((measure: any) => ({
                id: measure?.id,
                name: measure?.name || '',
                kpiId: measure?.kpi_id || null,
              }))
              .filter((measure: { id?: string }) => Boolean(measure.id)),
            owner: formatOwnerLabel(dept.owner),
            ownerId: dept.owner_id || dept.owner?.id || null,
            progress: Number(dept.progress || 0),
            linkedGoalId: dept.linked_goal_id ?? goal.id,
            kpiIds: (dept.measures || [])
              .map((measure: any) => measure?.kpi_id)
              .filter(Boolean),
          }))
        )
      );

      setOgsmObjectives(objectives);
      setOgsmGoals(goals);
      setDepartmentOGSMs(departmentRowsMapped);
      setDepartments(departmentRows.data || []);
      setUsers(userRows.data || []);
    } catch (error) {
      console.error('Failed to load department OGSM data', error);
    } finally {
      if (!isActiveRef || isActiveRef.current) {
        setIsLoading(false);
      }
    }
  }, [organization?.id, activeFiscalYear]);

  useEffect(() => {
    const isActiveRef = { current: true };

    if (!isOrgLoading) {
      loadData(isActiveRef);
    }

    return () => {
      isActiveRef.current = false;
    };
  }, [loadData, isOrgLoading]);

  // Extract unique departments
  const uniqueDepartments = useMemo(() => {
    const names = departments.length > 0
      ? departments.map(d => d.name)
      : departmentOGSMs.map(d => d.department);
    return Array.from(new Set(names)).sort();
  }, [departments, departmentOGSMs]);

  // Filter data
  const filteredData = useMemo(() => {
    if (selectedDept === 'all') return departmentOGSMs;
    return departmentOGSMs.filter(d => d.department === selectedDept);
  }, [selectedDept, departmentOGSMs]);

  const openDialog = (state: DialogState, overrides: Partial<DepartmentFormState> = {}) => {
    setFormError(null);
    setFormState({ ...defaultFormState, ...overrides });
    setDialogState(state);
  };

  const closeDialog = () => {
    setDialogState(null);
    setFormError(null);
    setInitialMeasureIds([]);
  };

  const openCreateDialog = () => {
    const selectedDepartment = selectedDept !== 'all'
      ? departments.find((dept) => dept.name === selectedDept)
      : null;
    setInitialMeasureIds([]);
    openDialog(
      { mode: 'create' },
      {
        departmentId: selectedDepartment?.id || '',
        progress: '0',
      }
    );
  };

  const openEditDialog = (dept: DepartmentOGSMRecord) => {
    const measureItems = dept.measureItems?.length
      ? dept.measureItems
      : (dept.measures || []).map((name) => ({ name }));

    setInitialMeasureIds(
      (dept.measureItems || [])
        .map((measure) => measure.id)
        .filter((id): id is string => Boolean(id))
    );

    openDialog(
      { mode: 'edit', targetId: dept.id },
      {
        departmentId: dept.departmentId || '',
        linkedGoalId: dept.linkedGoalId || '',
        objective: dept.objective || '',
        purpose: dept.purpose || '',
        strategy: dept.strategy || '',
        ownerId: dept.ownerId || '',
        progress: String(dept.progress ?? 0),
        measures: measureItems,
      }
    );
  };

  const handleAddMeasure = () => {
    setFormState((prev) => ({
      ...prev,
      measures: [...prev.measures, { name: '' }],
    }));
  };

  const handleMeasureChange = (index: number, value: string) => {
    setFormState((prev) => ({
      ...prev,
      measures: prev.measures.map((measure, idx) =>
        idx === index ? { ...measure, name: value } : measure
      ),
    }));
  };

  const handleRemoveMeasure = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      measures: prev.measures.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async () => {
    if (!dialogState) {
      return;
    }

    const objectiveValue = formState.objective.trim();
    if (!formState.departmentId || !formState.linkedGoalId || !objectiveValue) {
      setFormError('Vui lòng nhập đầy đủ Department, Linked Goal và Objective.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const progressValue = Number(formState.progress);
      const progress = Number.isFinite(progressValue)
        ? Math.min(100, Math.max(0, progressValue))
        : 0;

      const payload = {
        department_id: formState.departmentId,
        linked_goal_id: formState.linkedGoalId,
        objective: objectiveValue,
        purpose: formState.purpose.trim() || null,
        strategy: formState.strategy.trim() || null,
        owner_id: formState.ownerId || null,
        progress,
        fiscal_year: activeFiscalYear || null,
      };

      let deptOgsmId = dialogState.targetId;

      if (dialogState.mode === 'create') {
        const { data, error } = await supabase
          .from('okr_department_ogsm')
          .insert(payload)
          .select('id')
          .single();
        if (error) {
          throw error;
        }
        deptOgsmId = data?.id;
      } else if (dialogState.targetId) {
        const { error } = await supabase
          .from('okr_department_ogsm')
          .update(payload)
          .eq('id', dialogState.targetId);
        if (error) {
          throw error;
        }
      }

      if (!deptOgsmId) {
        throw new Error('Missing department OGSM id');
      }

      const trimmedMeasures = formState.measures
        .map((measure) => ({
          ...measure,
          name: measure.name.trim(),
        }))
        .filter((measure) => measure.name);

      const existingMeasures = trimmedMeasures.filter((measure) => measure.id);
      const newMeasures = trimmedMeasures.filter((measure) => !measure.id);
      const currentMeasureIds = existingMeasures
        .map((measure) => measure.id)
        .filter((id): id is string => Boolean(id));
      const removedMeasureIds = initialMeasureIds.filter(
        (id) => !currentMeasureIds.includes(id)
      );

      if (dialogState.mode === 'edit') {
        if (existingMeasures.length > 0) {
          const updates = await Promise.all(
            existingMeasures.map((measure) =>
              supabase
                .from('okr_department_measures')
                .update({ name: measure.name })
                .eq('id', measure.id as string)
            )
          );
          const updateError = updates.find((res) => res.error)?.error;
          if (updateError) {
            throw updateError;
          }
        }

        if (removedMeasureIds.length > 0) {
          const { error } = await supabase
            .from('okr_department_measures')
            .delete()
            .eq('dept_ogsm_id', deptOgsmId)
            .in('id', removedMeasureIds);
          if (error) {
            throw error;
          }
        }
      }

      if (newMeasures.length > 0) {
        const { error } = await supabase.from('okr_department_measures').insert(
          newMeasures.map((measure) => ({
            dept_ogsm_id: deptOgsmId,
            name: measure.name,
            kpi_id: measure.kpiId || null,
          }))
        );
        if (error) {
          throw error;
        }
      }

      await loadData();
      setGraphRefreshKey((prev) => prev + 1);
      closeDialog();
    } catch (error) {
      console.error('Failed to save department OGSM', error);
      setFormError('Không thể lưu. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (message: string) => {
    return window.confirm(message);
  };

  const handleDeleteDepartment = async (deptId: string) => {
    if (!confirmDelete('Xóa mục tiêu phòng ban này? Metrics liên quan sẽ bị xóa.')) {
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('okr_department_ogsm').delete().eq('id', deptId);
      if (error) {
        throw error;
      }
      await loadData();
      setGraphRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to delete department OGSM', error);
    }
  };

  const dialogTitle = dialogState
    ? dialogState.mode === 'create'
      ? 'Tạo mục tiêu phòng ban'
      : 'Chỉnh sửa mục tiêu phòng ban'
    : '';

  if (isLoading) {
    return <div className="p-10 flex justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header title="Bản đồ chiến lược cấp Phòng ban" subtitle="Phân rã chiến lược theo Phòng ban" />

      <div className="p-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/ogsm">
            <Button variant="outline" size="sm" className="hover:bg-slate-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại Bản đồ chiến lược tổng công ty
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'graph')} className="w-full">
          {/* Sticky Header Bar */}
          <div className="sticky top-16 z-20 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 -mx-6 px-6 py-3 border-b border-slate-200 mb-6 shadow-sm transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              {/* Left: View Tabs */}
              <TabsList className="bg-white border shadow-sm self-start md:self-auto h-9">
                <TabsTrigger value="list" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-xs px-3">
                  List View
                </TabsTrigger>
                <TabsTrigger value="graph" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 text-xs px-3">
                  Graph Tree View
                </TabsTrigger>
              </TabsList>

              {/* Right: Department Filter + Actions */}
              <div className="flex items-center gap-3 self-start md:self-auto w-full md:w-auto">
                <Button
                  type="button"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3"
                  onClick={openCreateDialog}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo mục tiêu phòng ban
                </Button>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm h-9 w-full md:w-auto">
                  <Filter className="w-4 h-4 text-slate-400 ml-1" />
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap hidden sm:block">Phòng ban:</span>
                  <Select value={selectedDept} onValueChange={setSelectedDept}>
                    <SelectTrigger className="h-7 border-0 focus:ring-0 text-xs font-semibold text-slate-700 min-w-[140px] w-full md:w-[180px]">
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs font-medium">Tất cả phòng ban ({departmentOGSMs.length})</SelectItem>
                      {uniqueDepartments.map(dept => (
                        <SelectItem key={dept} value={dept} className="text-xs">
                          {dept} ({departmentOGSMs.filter(d => d.department === dept).length})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
          </div>

          <TabsContent value="list" className="mt-0">
            {/* Context Header if Filtered */}
            {selectedDept !== 'all' && (
              <div className="mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedDept}</h2>
                  <p className="text-sm text-slate-500">
                    Đang hiển thị {filteredData.length} mục tiêu chiến lược của phòng {selectedDept}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {filteredData.map((dept) => {
                const perspective =
                  getPerspectiveForDept(dept.linkedGoalId, ogsmGoals, ogsmObjectives) ||
                  'financial'; // Fallback to 'financial' if orphan
                const theme = getThemeColors(perspective);

                return (
                  <Card key={dept.id} className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden py-0 gap-0">
                    {/* Header */}
                    <CardHeader className={`${theme.solidBg} text-white py-4 px-6 relative overflow-hidden group`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Department</p>
                            <h3 className="text-lg font-bold leading-tight">{dept.department}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                            {perspectiveLabels[perspective]}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-white/80 hover:text-white hover:bg-white/20"
                            onClick={() => openEditDialog(dept)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-white/80 hover:text-red-200 hover:bg-white/20"
                            onClick={() => handleDeleteDepartment(dept.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-6">
                      {/* Linked Goal Context */}
                      <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors cursor-default">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          Aligns with Company Goal
                        </p>
                        {dept.linkedGoalId ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${theme.solidBg}`}></div>
                            <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                              {ogsmGoals.find(g => g.id === dept.linkedGoalId)?.name || 'Unknown Goal'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not linked to Company Goal</span>
                        )}
                      </div>

                      {/* Objective */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Target className={`h-4 w-4 ${theme.iconColor}`} />
                          <span className="text-sm font-bold text-slate-800">Mục tiêu (Objective)</span>
                        </div>
                        <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                          {dept.objective}
                        </p>
                      </div>

                      {/* Strategy */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Lightbulb className={`h-4 w-4 ${theme.iconColor}`} />
                          <span className="text-sm font-bold text-slate-800">Chiến lược (Strategy)</span>
                        </div>
                        <p className="text-sm text-slate-600 pl-6 leading-relaxed">
                          {dept.strategy}
                        </p>
                      </div>

                      {/* Measures */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className={`h-4 w-4 ${theme.iconColor}`} />
                          <span className="text-sm font-bold text-slate-800">Đo lường (Metric)</span>
                        </div>
                        <div className="pl-6 flex flex-wrap gap-2">
                          {dept.measures.map((m, index) => (
                            <Badge key={`${dept.id}-measure-${index}`} variant="secondary" className={`${theme.badgeBg} ${theme.badgeText} border-0 hover:scale-105 transition-transform`}>
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Footer: Progress & Owner */}
                      <div className={`pt-4 border-t border-dashed ${theme.borderColor.replace('border', 'border-slate-200').replace('500', '200')}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${theme.lightBg} flex items-center justify-center text-xs font-bold ${theme.textColor}`}>
                              {dept.owner.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-slate-500">{dept.owner}</span>
                          </div>
                          <span className={`text-sm font-bold ${theme.textColor}`}>{dept.progress}%</span>
                        </div>
                        <Progress value={dept.progress} className={`h-2 bg-slate-100 [&>div]:${theme.progressBg}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && (
              <div className="text-center py-20 bg-slate-50 border border-slate-100 rounded-xl border-dashed">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900">Không có dữ liệu</h3>
                <p className="text-sm text-slate-500">Chưa có mục tiêu nào được gán cho phòng ban này.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="graph">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Department Alignment Graph</h3>
              <p className="text-sm text-slate-500">
                {selectedDept !== 'all'
                  ? `Showing vertical alignment for ${selectedDept}`
                  : 'Visualizing department contributions to company goals'}
              </p>
            </div>
            <InteractiveGraph
              key={graphRefreshKey}
              filterDepartment={selectedDept !== 'all' ? selectedDept : undefined}
              onDepartmentSelect={openEditDialog}
            />
          </TabsContent>
        </Tabs>

        <Dialog
          open={!!dialogState}
          onOpenChange={(open) => {
            if (!open) {
              closeDialog();
            }
          }}
        >
          <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {formError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {formError}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dept-select">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formState.departmentId}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, departmentId: value }))}
                  >
                    <SelectTrigger id="dept-select">
                      <SelectValue placeholder="Chọn phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-select">
                    Linked Goal <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formState.linkedGoalId}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, linkedGoalId: value }))}
                  >
                    <SelectTrigger id="goal-select">
                      <SelectValue placeholder="Chọn goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {ogsmGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept-objective">
                  Objective <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dept-objective"
                  value={formState.objective}
                  onChange={(event) => setFormState((prev) => ({ ...prev, objective: event.target.value }))}
                  placeholder="Nhập mục tiêu phòng ban..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dept-purpose">Purpose</Label>
                  <Input
                    id="dept-purpose"
                    value={formState.purpose}
                    onChange={(event) => setFormState((prev) => ({ ...prev, purpose: event.target.value }))}
                    placeholder="Tăng trưởng, NPD..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-owner">Owner</Label>
                  <Select
                    value={formState.ownerId}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, ownerId: value }))}
                  >
                    <SelectTrigger id="dept-owner">
                      <SelectValue placeholder="Chọn người phụ trách" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept-strategy">Strategy</Label>
                <Textarea
                  id="dept-strategy"
                  value={formState.strategy}
                  onChange={(event) => setFormState((prev) => ({ ...prev, strategy: event.target.value }))}
                  placeholder="Mô tả chiến lược (optional)"
                  className="min-h-[90px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Measures</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMeasure}>
                    <Plus className="mr-1 h-3 w-3" />
                    Thêm measure
                  </Button>
                </div>
                <div className="space-y-2">
                  {formState.measures.length === 0 ? (
                    <div className="text-xs text-slate-500">Chưa có measure.</div>
                  ) : (
                    formState.measures.map((measure, index) => (
                      <div key={`${measure.id || 'new'}-${index}`} className="flex items-center gap-2">
                        <Input
                          value={measure.name}
                          onChange={(event) => handleMeasureChange(index, event.target.value)}
                          placeholder="Tên measure..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-slate-500 hover:text-red-600"
                          onClick={() => handleRemoveMeasure(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dept-progress">Progress (%)</Label>
                <Input
                  id="dept-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formState.progress}
                  onChange={(event) => setFormState((prev) => ({ ...prev, progress: event.target.value }))}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSaving}>
                Hủy
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
