import type { BaseEntity, OKRStatus, Perspective } from './base';
import type { Department, User } from './organization';
import type { Goal } from './ogsm';

/**
 * KPI definition with target and current values.
 */
export interface KPI extends BaseEntity {
  organizationId: string;
  name: string;
  description?: string;
  perspective: Perspective;

  targetValue: number;
  currentValue: number;
  unit: string;

  status: OKRStatus;
  trend: 'up' | 'down' | 'stable';

  ownerId?: string;
  departmentId?: string;

  measurementFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';

  linkedGoalId?: string;

  owner?: User;
  department?: Department;
  linkedGoal?: Goal;
  history?: KPIHistory[];
}

/**
 * KPI history point used for trend charts.
 */
export interface KPIHistory extends BaseEntity {
  kpiId: string;
  period: string;
  value: number;
  recordedAt: Date;
  notes?: string;
}

/**
 * Helper type for charting data.
 */
export interface KPIWithHistory extends KPI {
  history: { month: string; value: number }[];
}
