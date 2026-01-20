import type { BaseEntity, CSFStatus, Priority } from './base';
import type { Department, User } from './organization';
import type { OKR } from './okr';

/**
 * Critical success factor used to ensure OKR delivery.
 */
export interface CSF extends BaseEntity {
  organizationId: string;
  title: string;
  description?: string;
  status: CSFStatus;
  priority: Priority;

  assigneeId?: string;
  departmentId?: string;

  dueDate?: Date;
  progress: number;

  assignee?: User;
  department?: Department;
  relatedOKRs?: OKR[];
}

/**
 * Join table reference for CSF to OKR.
 */
export interface CSFOKRRelation {
  csfId: string;
  okrId: string;
}
