import type {
  CSF,
  FishboneItem,
  KPI,
  OKR,
  ReviewItem,
  WeeklyAction,
  Perspective,
  OKRStatus,
  CSFStatus,
  Priority,
  ActionStatus,
} from '@/data/mock-data';
import { formatQuarterLabel } from '@/lib/period';

type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const toString = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

const parseJsonArray = <T>(value: JsonValue | undefined | null, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as T[];
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

export const mapOKRRow = (row: any): OKR => {
  const quarter = toString(row?.quarter);
  const fiscalYear = toString(row?.fiscal_year);
  const quarterLabel = formatQuarterLabel(quarter, fiscalYear) || quarter;

  return {
    id: toString(row?.id),
    objective: toString(row?.objective),
    perspective: (row?.perspective as Perspective) || 'financial',
    quarter: quarterLabel,
    status: (row?.status as OKRStatus) || 'on_track',
    progress: toNumber(row?.progress),
    owner: toString(row?.owner?.full_name || row?.owner?.email),
    dueDate: toString(row?.due_date),
    linkedGoalId: row?.linked_goal_id || undefined,
    keyResults: (row?.key_results || []).map((kr: any) => ({
      id: toString(kr?.id),
      title: toString(kr?.title),
      target: toNumber(kr?.target_value),
      current: toNumber(kr?.current_value),
      unit: toString(kr?.unit),
    })),
  };
};

export const mapOKRMinimal = (row: any) => {
  return {
    id: toString(row?.id),
    objective: toString(row?.objective),
    perspective: (row?.perspective as Perspective) || 'financial',
    status: (row?.status as OKRStatus) || 'on_track',
  };
};

export type RelatedOKR = ReturnType<typeof mapOKRMinimal>;

export type CSFWithRelations = Omit<CSF, 'relatedOKRs'> & {
  relatedOKRs: RelatedOKR[];
};

export const mapCSFRow = (row: any): CSFWithRelations => {
  return {
    id: toString(row?.id),
    title: toString(row?.title),
    description: toString(row?.description),
    status: (row?.status as CSFStatus) || 'not_started',
    priority: (row?.priority as Priority) || 'medium',
    assignee: toString(row?.assignee?.full_name || row?.assignee?.email),
    team: toString(row?.department?.name),
    dueDate: toString(row?.due_date),
    progress: toNumber(row?.progress),
    relatedOKRs: (row?.relatedOKRs || [])
      .map((rel: any) => rel?.okr)
      .filter(Boolean)
      .map(mapOKRMinimal),
  };
};

export const mapKpiRow = (row: any): KPI => {
  return {
    id: toString(row?.id),
    name: toString(row?.name),
    perspective: (row?.perspective as Perspective) || 'financial',
    target: toNumber(row?.target_value),
    current: toNumber(row?.current_value),
    unit: toString(row?.unit),
    status: (row?.status as OKRStatus) || 'on_track',
    trend: (row?.trend as KPI['trend']) || 'stable',
    linkedGoalId: row?.linked_goal_id || undefined,
    history: parseJsonArray<{ month: string; value: number }>(row?.history || [])
      .map((point: any) => ({
        month: toString(point?.period ?? point?.month),
        value: toNumber(point?.value),
      })),
  };
};

export const mapKpiHistory = (history: any[] = []) =>
  history.map((point) => ({
    month: toString(point?.period ?? point?.month),
    value: toNumber(point?.value),
  }));

export const mapWeeklyActionRow = (row: any): WeeklyAction => {
  return {
    id: toString(row?.id),
    week: toString(row?.week),
    linkedGoal: toString(row?.linked_goal?.name || row?.linked_goal?.title),
    linkedGoalId: row?.linked_goal_id || undefined,
    linkedKpiId: row?.linked_kpi_id ?? null,
    solution: toString(row?.solution),
    activity: toString(row?.activity),
    owner: toString(row?.owner?.full_name || row?.owner?.email),
    status: (row?.status as ActionStatus) || 'pending',
    result: toString(row?.result),
  };
};

export const mapFishboneRow = (row: any): FishboneItem => {
  return {
    id: toString(row?.id),
    kpiId: row?.kpi_id || undefined,
    factor: toString(row?.factor) as FishboneItem['factor'],
    problem: toString(row?.problem),
    action: toString(row?.action),
    owner: toString(row?.owner?.full_name || row?.owner?.email),
    deadline: toString(row?.deadline),
    result: toString(row?.expected_result || row?.actual_result),
    status: (row?.status as ActionStatus) || 'pending',
  };
};

const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '';
  }
  if (minutes % 60 === 0) {
    return `${minutes / 60}h`;
  }
  return `${minutes}m`;
};

export const mapReviewRow = (row: any): ReviewItem => {
  const checklist = parseJsonArray<string>(row?.checklist, []);
  const participants = parseJsonArray<string>(row?.participants, []);
  const duration = row?.duration_minutes ? formatDuration(Number(row.duration_minutes)) : '';
  const type = row?.type === 'monthly' ? 'monthly' : 'weekly';

  return {
    id: toString(row?.id),
    type,
    checklist,
    participants,
    duration,
    frequency: toString(row?.scheduled_date || row?.title),
  };
};
