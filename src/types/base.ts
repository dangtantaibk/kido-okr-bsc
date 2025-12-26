/**
 * Core enums and shared base entity fields.
 */
export type Perspective = 'financial' | 'external' | 'internal' | 'learning';
export type OKRStatus = 'on_track' | 'at_risk' | 'off_track' | 'completed';
export type CSFStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ActionStatus = 'pending' | 'done' | 'overdue';
export type ReviewType = 'weekly' | 'monthly' | 'quarterly';

/**
 * Base entity with standard timestamp fields.
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
