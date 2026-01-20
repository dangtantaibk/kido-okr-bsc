import type { BaseEntity, OKRStatus, Perspective } from './base';
import type { Goal } from './ogsm';
import type { User } from './organization';

/**
 * Goal summary data for strategy nodes.
 */
export interface StrategyNodeGoal {
  label: string;
  current: string;
  target: string;
  isCompleted: boolean;
}

/**
 * Strategy map node definition.
 */
export interface StrategyNode extends BaseEntity {
  organizationId: string;

  label: string;
  category: Perspective;
  code: string;

  linkedGoalId?: string;

  positionX: number;
  positionY: number;

  status: OKRStatus;
  progress: number;

  ownerId?: string;

  goals?: StrategyNodeGoal[];
  strategies?: string[];

  linkedGoal?: Goal;
  owner?: User;
}

/**
 * Strategy map edge.
 */
export interface StrategyEdge extends BaseEntity {
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
}
