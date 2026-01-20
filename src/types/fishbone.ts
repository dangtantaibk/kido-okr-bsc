import type { BaseEntity, ActionStatus } from './base';
import type { KPI } from './kpi';
import type { User } from './organization';

/**
 * Categories for fishbone root-cause analysis.
 */
export type FishboneFactor =
  | 'Forecast'
  | 'Kho'
  | 'Trade'
  | 'Sản xuất'
  | 'NPD'
  | 'Logistics';

/**
 * Fishbone item linked to an off-track KPI.
 */
export interface FishboneItem extends BaseEntity {
  organizationId: string;
  kpiId?: string;

  factor: FishboneFactor;
  problem: string;
  action: string;

  ownerId?: string;
  deadline: string;

  expectedResult: string;
  actualResult?: string;
  status: ActionStatus;

  kpi?: KPI;
  owner?: User;
}
