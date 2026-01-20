import type { BaseEntity } from './base';

/**
 * Organization metadata.
 */
export interface Organization extends BaseEntity {
  name: string;
  slogan?: string;
  logoUrl?: string;
  fiscalYear: string;
  currentQuarter: string;
}

/**
 * User profile with org/department links.
 */
export interface User extends BaseEntity {
  organizationId: string;
  departmentId?: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;

  organization?: Organization;
  department?: Department;
}

/**
 * Department in a tree hierarchy.
 */
export interface Department extends BaseEntity {
  organizationId: string;
  name: string;
  code: string;
  parentId?: string;
  headUserId?: string;

  organization?: Organization;
  parent?: Department;
  children?: Department[];
  head?: User;
}
