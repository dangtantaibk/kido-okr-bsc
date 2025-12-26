import type { BaseEntity, ActionStatus } from './base';
import type { Goal } from './ogsm';
import type { KPI } from './kpi';
import type { User } from './organization';

/**
 * Weekly action log item.
 */
export interface WeeklyAction extends BaseEntity {
  organizationId: string;
  week: string;

  linkedGoalId?: string;
  linkedKpiId?: string;

  solution: string;
  activity: string;

  ownerId?: string;
  status: ActionStatus;
  result?: string;

  linkedGoal?: Goal;
  linkedKpi?: KPI;
  owner?: User;
}
