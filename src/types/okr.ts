import type { BaseEntity, OKRStatus, Perspective } from './base';
import type { Department, User } from './organization';
import type { Goal } from './ogsm';

/**
 * OKR record for a quarter.
 */
export interface OKR extends BaseEntity {
  organizationId: string;
  objective: string;
  perspective: Perspective;
  quarter: string;
  status: OKRStatus;
  progress: number;
  ownerId?: string;
  departmentId?: string;
  linkedGoalId?: string;
  dueDate?: Date;

  owner?: User;
  department?: Department;
  linkedGoal?: Goal;
  keyResults?: KeyResult[];
}

/**
 * Key result under an OKR.
 */
export interface KeyResult extends BaseEntity {
  okrId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  weight: number;

  progress?: number;
  okr?: OKR;
}
