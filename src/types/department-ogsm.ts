import type { BaseEntity } from './base';
import type { Department, User } from './organization';
import type { Goal } from './ogsm';
import type { KPI } from './kpi';

/**
 * Department-level OGSM record cascading from company goals.
 */
export interface DepartmentOGSM extends BaseEntity {
  departmentId: string;
  linkedGoalId?: string;

  purpose: string;
  objective: string;
  strategy?: string;

  ownerId?: string;
  progress: number;
  fiscalYear: string;

  department?: Department;
  linkedGoal?: Goal;
  owner?: User;
  measures?: DepartmentMeasure[];
}

/**
 * KPI measures for a department OGSM.
 */
export interface DepartmentMeasure extends BaseEntity {
  deptOgsmId: string;
  name: string;
  kpiId?: string;

  deptOgsm?: DepartmentOGSM;
  kpi?: KPI;
}
