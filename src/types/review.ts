import type { BaseEntity, ReviewType } from './base';
import type { Department, User } from './organization';

/**
 * Checklist item used in reviews.
 */
export interface ReviewChecklist {
  item: string;
  completed: boolean;
}

/**
 * Review meeting record.
 */
export interface Review extends BaseEntity {
  organizationId: string;
  type: ReviewType;
  title: string;
  scheduledDate: Date;
  completedAt?: Date;

  departmentId?: string;
  facilitatorId?: string;

  checklist: ReviewChecklist[];
  participants: string[];
  durationMinutes: number;

  notes?: string;
  actionItems: { task: string; assignee: string; dueDate: Date }[];

  department?: Department;
  facilitator?: User;
}
