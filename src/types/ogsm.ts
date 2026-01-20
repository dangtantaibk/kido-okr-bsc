import type { BaseEntity, Perspective } from './base';
import type { Department, User } from './organization';
import type { OKR } from './okr';
import type { DepartmentOGSM } from './department-ogsm';
import type { KPI } from './kpi';

/**
 * Company-level strategic objective (BSC perspective).
 */
export interface Objective extends BaseEntity {
  organizationId: string;
  name: string;
  description?: string;
  perspective: Perspective;

  clusterCode?: string;
  clusterGroup?: string;
  linkedClusterCode?: string;
  purpose?: string;
  objectiveText?: string;
  ownerId?: string;
  ownerDepartmentId?: string;
  resourceNote?: string;
  startDate?: Date;
  endDate?: Date;

  priority: number;
  status: 'active' | 'archived';
  fiscalYear: string;

  owner?: User;
  ownerDepartment?: Department;
  goals?: Goal[];
}

/**
 * Company-level measurable goal under an objective.
 */
export interface Goal extends BaseEntity {
  objectiveId: string;
  name: string;
  description?: string;
  targetValue?: number;
  targetUnit?: string;
  targetText: string;
  currentValue: number;
  ownerId?: string;
  progress: number;
  dueDate?: Date;
  status: 'active' | 'completed' | 'archived';

  objective?: Objective;
  owner?: User;
  strategies?: Strategy[];
  linkedOKRs?: OKR[];
  departmentOGSMs?: DepartmentOGSM[];
}

/**
 * Strategy to achieve a goal.
 */
export interface Strategy extends BaseEntity {
  goalId: string;
  name: string;
  description?: string;
  priority: number;

  goal?: Goal;
  measures?: StrategyMeasure[];
}

/**
 * Strategy measure linked to a KPI.
 */
export interface StrategyMeasure extends BaseEntity {
  strategyId: string;
  name: string;
  kpiId?: string;

  strategy?: Strategy;
  kpi?: KPI;
}
