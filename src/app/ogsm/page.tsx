'use client';

import {
  Target,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Users,
  Sparkles,
  Globe,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import {
  perspectiveLabels,
  perspectiveColors,
  Perspective,
} from '@/data/mock-data';
import type { OGSMGoal, OGSMObjective } from '@/data/mock-data';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getObjectivesWithCascade } from '@/lib/supabase/queries/ogsm';
import { useOrganization } from '@/contexts/organization-context';

const goalIcons: Record<string, React.ElementType> = {
  'goal-1': TrendingUp,
  'goal-2': Users,
  'goal-3': Sparkles,
  'goal-4': Globe,
  'goal-5': Wallet,
};

// Theme helper (same logic as Graph View)
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

import { InteractiveGraph } from './interactive-graph';

// --- Sub-components ---
type StrategyMeasure = {
  id: string;
  name: string;
};

type OGSMStrategyRecord = {
  id: string;
  goalId: string;
  name: string;
  measures: StrategyMeasure[];
};

type DialogType = 'objective' | 'goal' | 'strategy' | 'measure';
type DialogMode = 'create' | 'edit';

type DialogState = {
  type: DialogType;
  mode: DialogMode;
  targetId?: string;
  objectiveId?: string;
  goalId?: string;
  strategyId?: string;
};

type FormState = {
  name: string;
  description: string;
  perspective: Perspective;
  targetText: string;
  progress: string;
};

const defaultFormState: FormState = {
  name: '',
  description: '',
  perspective: 'financial',
  targetText: '',
  progress: '0',
};

const GoalItem = ({
  goal,
  theme,
  strategies,
  onEditGoal,
  onDeleteGoal,
  onAddStrategy,
  onEditStrategy,
  onDeleteStrategy,
  onAddMeasure,
  onEditMeasure,
  onDeleteMeasure,
}: {
  goal: OGSMGoal;
  theme: ReturnType<typeof getThemeColors> | null;
  strategies: OGSMStrategyRecord[];
  onEditGoal: (goal: OGSMGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddStrategy: (goalId: string) => void;
  onEditStrategy: (strategy: OGSMStrategyRecord) => void;
  onDeleteStrategy: (strategyId: string) => void;
  onAddMeasure: (strategyId: string) => void;
  onEditMeasure: (measure: StrategyMeasure) => void;
  onDeleteMeasure: (measureId: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const filteredStrategies = strategies.filter(s => s.goalId === goal.id);
  const GoalIcon = goalIcons[goal.id] || TrendingUp;

  return (
    <div className={`p-4 bg-gradient-to-r ${theme ? theme.gradientFrom : 'from-slate-50'} to-white border-b last:border-0`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme ? theme.lightBg : 'bg-slate-100'} ${theme ? theme.iconColor : 'text-slate-600'} shadow-sm`}>
          <GoalIcon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900 text-sm">{goal.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Owner: {goal.owner}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${theme ? theme.badgeBg : 'bg-slate-100'} ${theme ? theme.badgeText : 'text-slate-700'} text-xs font-bold border-0 shadow-sm whitespace-nowrap`}>
                {goal.target}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-slate-500 hover:text-slate-900"
                onClick={() => onEditGoal(goal)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-slate-500 hover:text-red-600"
                onClick={() => onDeleteGoal(goal.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Progress</span>
              <span className={`font-bold ${theme ? theme.textColor : 'text-slate-700'}`}>{goal.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden shadow-inner">
              <div
                className={`${theme ? theme.progressBg : 'bg-slate-500'} h-full rounded-full transition-all duration-500`}
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filteredStrategies.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-1 text-xs font-medium ${theme ? theme.subTextColor : 'text-slate-500'} hover:text-slate-800 transition-colors focus:outline-none`}
              >
                {isExpanded ? 'Hide Strategies' : 'Show Strategies'}
                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] font-semibold"
              onClick={() => onAddStrategy(goal.id)}
            >
              <Plus className="h-3 w-3" />
              Thêm Strategy
            </Button>
          </div>

          {/* Strategies & Measures (Collapsible) */}
          {filteredStrategies.length > 0 && isExpanded && (
            <div className={`mt-3 pt-3 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300`}>
              {filteredStrategies.map((strategy) => (
                <div key={strategy.id} className="flex items-start gap-2 mb-3 last:mb-0">
                  <div className={`mt-1 w-4 h-4 rounded-full ${theme ? theme.lightBg : 'bg-slate-100'} flex items-center justify-center flex-shrink-0`}>
                    <ArrowRight className={`h-2.5 w-2.5 ${theme ? theme.iconColor : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800">{strategy.name}</p>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-slate-500 hover:text-slate-900"
                          onClick={() => onEditStrategy(strategy)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-slate-500 hover:text-red-600"
                          onClick={() => onDeleteStrategy(strategy.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {strategy.measures.map((measure) => (
                        <Badge
                          key={measure.id}
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${theme ? theme.lightBg : 'bg-white'} ${theme ? theme.subTextColor : 'text-slate-600'} border-0 font-medium`}
                        >
                          <button
                            type="button"
                            className="hover:underline"
                            onClick={() => onEditMeasure(measure)}
                          >
                            {measure.name}
                          </button>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => onDeleteMeasure(measure.id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] font-semibold"
                        onClick={() => onAddMeasure(strategy.id)}
                      >
                        <Plus className="h-3 w-3" />
                        Thêm metric
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function OGSMCompanyPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list');
  const [ogsmObjectives, setOgsmObjectives] = useState<OGSMObjective[]>([]);
  const [ogsmGoals, setOgsmGoals] = useState<OGSMGoal[]>([]);
  const [ogsmStrategies, setOgsmStrategies] = useState<OGSMStrategyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [graphRefreshKey, setGraphRefreshKey] = useState(0);
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { organization, activeFiscalYear, isLoading: isOrgLoading } = useOrganization();

  const loadOGSM = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const orgId = organization?.id;

      if (!orgId) {
        return;
      }

      const objectiveRows = await getObjectivesWithCascade(
        supabase,
        orgId,
        activeFiscalYear
      );

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

      const strategies = (objectiveRows || []).flatMap((obj: any) =>
        (obj.goals || []).flatMap((goal: any) =>
          (goal.strategies || []).map((strategy: any) => ({
            id: strategy.id,
            goalId: goal.id,
            name: strategy.name || '',
            measures: (strategy.measures || [])
              .map((measure: any) => ({
                id: measure?.id,
                name: measure?.name || '',
              }))
              .filter((measure: { id?: string }) => Boolean(measure.id)),
          }))
        )
      );

      setOgsmObjectives(objectives);
      setOgsmGoals(goals);
      setOgsmStrategies(strategies);
    } catch (error) {
      console.error('Failed to load OGSM data', error);
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id, activeFiscalYear]);

  useEffect(() => {
    if (!isOrgLoading) {
      loadOGSM();
    }
  }, [loadOGSM, isOrgLoading]);

  const openDialog = (state: DialogState, overrides: Partial<FormState> = {}) => {
    setFormError(null);
    setFormState({ ...defaultFormState, ...overrides });
    setDialogState(state);
  };

  const closeDialog = () => {
    setDialogState(null);
    setFormError(null);
  };

  const openCreateObjective = () => {
    openDialog({ type: 'objective', mode: 'create' }, { perspective: 'financial' });
  };

  const openEditObjective = (objective: OGSMObjective) => {
    openDialog(
      { type: 'objective', mode: 'edit', targetId: objective.id },
      {
        name: objective.name,
        description: objective.description,
        perspective: objective.perspective,
      }
    );
  };

  const openCreateGoal = (objectiveId: string) => {
    openDialog({ type: 'goal', mode: 'create', objectiveId }, { progress: '0' });
  };

  const openEditGoal = (goal: OGSMGoal) => {
    openDialog(
      { type: 'goal', mode: 'edit', targetId: goal.id, objectiveId: goal.objectiveId },
      {
        name: goal.name,
        targetText: goal.target,
        progress: String(goal.progress ?? 0),
      }
    );
  };

  const openCreateStrategy = (goalId: string) => {
    openDialog({ type: 'strategy', mode: 'create', goalId });
  };

  const openEditStrategy = (strategy: OGSMStrategyRecord) => {
    openDialog(
      { type: 'strategy', mode: 'edit', targetId: strategy.id, goalId: strategy.goalId },
      { name: strategy.name }
    );
  };

  const openCreateMeasure = (strategyId: string) => {
    openDialog({ type: 'measure', mode: 'create', strategyId });
  };

  const openEditMeasure = (measure: StrategyMeasure) => {
    openDialog({ type: 'measure', mode: 'edit', targetId: measure.id }, { name: measure.name });
  };

  const handleSave = async () => {
    if (!dialogState) {
      return;
    }

    const trimmedName = formState.name.trim();
    if (!trimmedName) {
      setFormError('Vui lòng nhập tên.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      if (dialogState.type === 'objective') {
        if (!organization?.id) {
          throw new Error('Missing organization');
        }
        const payload = {
          name: trimmedName,
          description: formState.description.trim() || null,
          perspective: formState.perspective,
        };

        if (dialogState.mode === 'create') {
          const { error } = await supabase.from('okr_objectives').insert({
            organization_id: organization.id,
            status: 'active',
            fiscal_year: activeFiscalYear || null,
            ...payload,
          });
          if (error) {
            throw error;
          }
        } else if (dialogState.targetId) {
          const { error } = await supabase
            .from('okr_objectives')
            .update(payload)
            .eq('id', dialogState.targetId);
          if (error) {
            throw error;
          }
        }
      }

      if (dialogState.type === 'goal') {
        const progressValue = Number(formState.progress);
        const progress = Number.isFinite(progressValue)
          ? Math.min(100, Math.max(0, progressValue))
          : 0;
        const payload = {
          name: trimmedName,
          target_text: formState.targetText.trim() || null,
          progress,
        };

        if (dialogState.mode === 'create') {
          if (!dialogState.objectiveId) {
            throw new Error('Missing objective');
          }
          const { error } = await supabase.from('okr_goals').insert({
            objective_id: dialogState.objectiveId,
            ...payload,
          });
          if (error) {
            throw error;
          }
        } else if (dialogState.targetId) {
          const { error } = await supabase
            .from('okr_goals')
            .update(payload)
            .eq('id', dialogState.targetId);
          if (error) {
            throw error;
          }
        }
      }

      if (dialogState.type === 'strategy') {
        const payload = { name: trimmedName };

        if (dialogState.mode === 'create') {
          if (!dialogState.goalId) {
            throw new Error('Missing goal');
          }
          const { error } = await supabase.from('okr_strategies').insert({
            goal_id: dialogState.goalId,
            ...payload,
          });
          if (error) {
            throw error;
          }
        } else if (dialogState.targetId) {
          const { error } = await supabase
            .from('okr_strategies')
            .update(payload)
            .eq('id', dialogState.targetId);
          if (error) {
            throw error;
          }
        }
      }

      if (dialogState.type === 'measure') {
        const payload = { name: trimmedName };

        if (dialogState.mode === 'create') {
          if (!dialogState.strategyId) {
            throw new Error('Missing strategy');
          }
          const { error } = await supabase.from('okr_strategy_measures').insert({
            strategy_id: dialogState.strategyId,
            ...payload,
          });
          if (error) {
            throw error;
          }
        } else if (dialogState.targetId) {
          const { error } = await supabase
            .from('okr_strategy_measures')
            .update(payload)
            .eq('id', dialogState.targetId);
          if (error) {
            throw error;
          }
        }
      }

      await loadOGSM();
      setGraphRefreshKey(prev => prev + 1);
      closeDialog();
    } catch (error) {
      console.error('Failed to save OGSM data', error);
      setFormError('Không thể lưu. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (message: string) => {
    return window.confirm(message);
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    if (!confirmDelete('Xóa Objective này? Các Goals/Strategies liên quan sẽ bị xóa.')) {
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('okr_objectives').delete().eq('id', objectiveId);
      if (error) {
        throw error;
      }
      await loadOGSM();
      setGraphRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete objective', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirmDelete('Xóa Goal này? Strategies/Measures liên quan sẽ bị xóa.')) {
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('okr_goals').delete().eq('id', goalId);
      if (error) {
        throw error;
      }
      await loadOGSM();
      setGraphRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete goal', error);
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirmDelete('Xóa Strategy này? Measures liên quan sẽ bị xóa.')) {
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('okr_strategies').delete().eq('id', strategyId);
      if (error) {
        throw error;
      }
      await loadOGSM();
      setGraphRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete strategy', error);
    }
  };

  const handleDeleteMeasure = async (measureId: string) => {
    if (!confirmDelete('Xóa Metric này?')) {
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('okr_strategy_measures').delete().eq('id', measureId);
      if (error) {
        throw error;
      }
      await loadOGSM();
      setGraphRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete measure', error);
    }
  };

  const getGoalsForObjective = (objectiveId: string) => {
    return ogsmGoals.filter(g => g.objectiveId === objectiveId);
  };

  const dialogLabels: Record<DialogType, string> = {
    objective: 'Objective',
    goal: 'Goal',
    strategy: 'Strategy',
    measure: 'Metric',
  };

  const dialogTitle = dialogState
    ? `${dialogState.mode === 'create' ? 'Tạo' : 'Chỉnh sửa'} ${dialogLabels[dialogState.type]}`
    : '';

  const dialogDescription = dialogState
    ? dialogState.type === 'objective'
      ? 'Cập nhật thông tin mục tiêu cấp Công ty.'
      : dialogState.type === 'goal'
        ? 'Cập nhật mục tiêu con (Goal) và tiến độ.'
        : dialogState.type === 'strategy'
          ? 'Cập nhật chiến lược thực thi cho Goal.'
          : 'Cập nhật chỉ số đo lường.'
    : '';

  if (isLoading) {
    return <div className="p-10 flex justify-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Header title="Bản đồ chiến lược - Tổng công ty" subtitle="Objectives, Goals, Strategies, Measures - Tổng Công ty" />

      <div className="p-6">
        {/* Introduction */}
        <Card className="mb-6 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">KIDO Group - Chiến lược 2025-2026</h2>
                <p className="mt-2 text-blue-100 max-w-lg">
                  Framework OGSM giúp cascade chiến lược từ cấp Công ty xuống các Phòng ban.
                  Theo dõi mục tiêu theo 4 góc nhìn BSC.
                </p>
              </div>
              <Link href="/ogsm/department">
                <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20">
                  Xem theo Phòng ban
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'graph')} className="w-full">
          <div className="sticky top-16 z-20 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 -mx-6 px-6 py-2 border-b border-slate-200 mb-6 shadow-sm transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="bg-white border shadow-sm self-start md:self-auto">
                <TabsTrigger value="list" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                  List View
                </TabsTrigger>
                <TabsTrigger value="graph" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                  Graph Tree View
                </TabsTrigger>
              </TabsList>

              <div className="hidden md:flex items-center gap-3 text-xs">
                <Button
                  type="button"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                  onClick={openCreateObjective}
                >
                  <Plus className="h-4 w-4" />
                  Thêm Objective
                </Button>
                <div className="h-5 w-px bg-slate-200" />
                <span className="font-semibold text-slate-400 mr-2 uppercase tracking-wider text-[10px]">OGSM Flow:</span>
                {[
                  { label: 'Objectives', letter: 'O', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
                  { label: 'Goals', letter: 'G', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                  { label: 'Strategies', letter: 'S', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                  { label: 'Measures', letter: 'M', color: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent hover:border-slate-200 transition-colors ${item.bg}`}>
                      <div className={`${item.color} w-4 h-4 rounded text-[9px] flex items-center justify-center text-white font-bold`}>
                        {item.letter}
                      </div>
                      <span className={`font-semibold ${item.text}`}>{item.label}</span>
                    </div>
                    {index < 3 && <ArrowRight className="h-3 w-3 text-slate-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

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

            {/* Objectives Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {ogsmObjectives.map((objective) => {
                const goals = getGoalsForObjective(objective.id);
                const perspective = objective.perspective;
                const theme = perspective ? getThemeColors(perspective) : null;

                return (
                  <Card key={objective.id} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow py-0 gap-0 h-full">
                    {/* Objective Header */}
                    <CardHeader className={`${theme ? theme.solidBg : 'bg-slate-500'} text-white pb-5 relative overflow-hidden pt-6 px-6`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                              <Target className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] px-1.5 py-0 h-5 font-normal">
                                  {objective.perspective ? perspectiveLabels[objective.perspective] : 'Objective'}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg text-white mt-1 leading-snug">{objective.name}</CardTitle>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-white/80 hover:text-white hover:bg-white/10"
                              onClick={() => openEditObjective(objective)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-white/80 hover:text-white hover:bg-white/10"
                              onClick={() => handleDeleteObjective(objective.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-white/80 line-clamp-2">{objective.description}</p>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 bg-white">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Goals</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[10px] font-semibold"
                          onClick={() => openCreateGoal(objective.id)}
                        >
                          <Plus className="h-3 w-3" />
                          Thêm Goal
                        </Button>
                      </div>
                      {/* Goals List */}
                      <div className="divide-y divide-slate-100">
                        {goals.length > 0 ? (
                          goals.map(goal => (
                            <GoalItem
                              key={goal.id}
                              goal={goal}
                              theme={theme}
                              strategies={ogsmStrategies}
                              onEditGoal={openEditGoal}
                              onDeleteGoal={handleDeleteGoal}
                              onAddStrategy={openCreateStrategy}
                              onEditStrategy={openEditStrategy}
                              onDeleteStrategy={handleDeleteStrategy}
                              onAddMeasure={openCreateMeasure}
                              onEditMeasure={openEditMeasure}
                              onDeleteMeasure={handleDeleteMeasure}
                            />
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-sm">
                            Chưa có mục tiêu con (Goals)
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* CTA to Department */}
            <Card className="mt-6 border-2 border-dashed border-slate-300 bg-gradient-to-r from-slate-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold text-slate-900">Cascade xuống Phòng ban</h3>
                  <p className="text-sm text-slate-500">Xem chi tiết OGSM theo từng phòng ban</p>
                </div>
                <Link href="/ogsm/department">
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md">
                    Bản đồ chiến lược Phòng ban
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graph">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Cây mục tiêu & Chiến lược (BSC Cascade)</h3>
              <p className="text-sm text-slate-500">
                Theo dõi sự đồng bộ từ Cấp công ty xuống Phòng ban.
                <span className="ml-2 font-medium text-blue-600">
                  Sử dụng chuột để kéo thả, cuộn để phóng to/thu nhỏ.
                </span>
              </p>
            </div>
            <InteractiveGraph
              key={graphRefreshKey}
              onObjectiveSelect={openEditObjective}
              onGoalSelect={openEditGoal}
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
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              {dialogDescription ? <DialogDescription>{dialogDescription}</DialogDescription> : null}
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ogsm-name">Tên</Label>
                <Input
                  id="ogsm-name"
                  value={formState.name}
                  onChange={(event) => setFormState(prev => ({ ...prev, name: event.target.value }))}
                  placeholder="Nhập tên..."
                />
              </div>

              {dialogState?.type === 'objective' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ogsm-description">Mô tả</Label>
                    <Textarea
                      id="ogsm-description"
                      value={formState.description}
                      onChange={(event) => setFormState(prev => ({ ...prev, description: event.target.value }))}
                      placeholder="Nhập mô tả..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Góc nhìn</Label>
                    <Select
                      value={formState.perspective}
                      onValueChange={(value) =>
                        setFormState(prev => ({ ...prev, perspective: value as Perspective }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn góc nhìn" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(perspectiveLabels) as Perspective[]).map((p) => (
                          <SelectItem key={p} value={p}>
                            {perspectiveLabels[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {dialogState?.type === 'goal' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ogsm-target">Target</Label>
                    <Input
                      id="ogsm-target"
                      value={formState.targetText}
                      onChange={(event) => setFormState(prev => ({ ...prev, targetText: event.target.value }))}
                      placeholder="Ví dụ: +10% hoặc 100% quy trình"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ogsm-progress">Progress (%)</Label>
                    <Input
                      id="ogsm-progress"
                      type="number"
                      min={0}
                      max={100}
                      value={formState.progress}
                      onChange={(event) => setFormState(prev => ({ ...prev, progress: event.target.value }))}
                    />
                  </div>
                </>
              )}
            </div>

            {formError ? <p className="text-xs text-red-600">{formError}</p> : null}

            <DialogFooter>
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
