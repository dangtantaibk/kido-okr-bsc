// OpenProject API v3 Types

// ============ Base Types ============

export interface OpenProjectLink {
  href: string;
  title?: string;
}

export interface OpenProjectLinks {
  self: OpenProjectLink;
  [key: string]: OpenProjectLink | undefined;
}

// Helper to extract ID from HAL href
export function extractIdFromHref(href: string | undefined): number | null {
  if (!href) return null;
  const match = href.match(/\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// ============ Status ============

export interface OpenProjectStatus {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
  isClosed: boolean;
  isReadonly: boolean;
  position: number;
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
  };
}

export interface OpenProjectStatusCollection {
  _type: 'Collection';
  total: number;
  count: number;
  _embedded: {
    elements: OpenProjectStatus[];
  };
  _links: OpenProjectLinks;
}

// ============ User ============

export interface OpenProjectUser {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  login: string;
  email?: string;
  avatar?: string;
  status: string;
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
    avatar?: OpenProjectLink;
  };
}

export interface OpenProjectUserSimple {
  id: number;
  name: string;
  login: string;
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
  };
}

export interface OpenProjectUserCollection {
  _type: 'Collection';
  total: number;
  count: number;
  _embedded: {
    elements: OpenProjectUser[];
  };
  _links: OpenProjectLinks;
}

// ============ Priority ============

export interface OpenProjectPriority {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  position: number;
  _links: OpenProjectLinks;
}

// ============ Version ============

export interface OpenProjectVersion {
  id: number;
  name: string;
  description?: {
    format: string;
    raw: string;
    html: string;
  };
  startDate?: string | null;
  endDate?: string | null;
  status: 'open' | 'locked' | 'closed';
  sharing: string;
  createdAt: string;
  updatedAt: string;
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
    definingProject: OpenProjectLink;
  };
}

export interface OpenProjectVersionCollection {
  _type: 'Collection';
  total: number;
  count: number;
  _embedded: {
    elements: OpenProjectVersion[];
  };
  _links: OpenProjectLinks;
}

// ============ Work Package ============

export interface OpenProjectWorkPackage {
  id: number;
  lockVersion: number;
  subject: string;
  description?: {
    format: string;
    raw: string;
    html: string;
  };
  startDate?: string | null;
  dueDate?: string | null;
  estimatedTime?: string | null;
  spentTime?: string;
  percentageDone: number;
  createdAt: string;
  updatedAt: string;
  _embedded?: {
    status?: OpenProjectStatus;
    priority?: OpenProjectPriority;
    assignee?: OpenProjectUser;
    responsible?: OpenProjectUser;
    type?: {
      id: number;
      name: string;
      color: string;
    };
    project?: {
      id: number;
      name: string;
      identifier: string;
    };
    version?: OpenProjectVersion;
    parent?: OpenProjectWorkPackage;
  };
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
    status: OpenProjectLink;
    priority: OpenProjectLink;
    assignee?: OpenProjectLink;
    responsible?: OpenProjectLink;
    project: OpenProjectLink;
    type: OpenProjectLink;
    version?: OpenProjectLink;
    parent?: OpenProjectLink;
    update?: OpenProjectLink;
    updateImmediately?: OpenProjectLink;
  };
}

export interface OpenProjectWorkPackageCollection {
  _type: 'Collection';
  total: number;
  count: number;
  pageSize: number;
  offset: number;
  _embedded: {
    elements: OpenProjectWorkPackage[];
  };
  _links: OpenProjectLinks;
}

// ============ Project ============

export interface OpenProjectProject {
  id: number;
  identifier: string;
  name: string;
  active: boolean;
  public: boolean;
  description?: {
    format: string;
    raw: string;
    html: string;
  };
  createdAt: string;
  updatedAt: string;
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
    workPackages: OpenProjectLink;
  };
}

export interface OpenProjectProjectCollection {
  _type: 'Collection';
  total: number;
  count: number;
  _embedded: {
    elements: OpenProjectProject[];
  };
  _links: OpenProjectLinks;
}

// ============ Activity / Comment ============

export interface OpenProjectActivity {
  id: number;
  comment?: {
    format: string;
    raw: string;
    html: string;
  };
  details: Array<{
    format: string;
    raw: string;
    html: string;
  }>;
  version: number;
  createdAt: string;
  updatedAt: string;
  _embedded?: {
    user?: OpenProjectUser;
  };
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
    user: OpenProjectLink;
    workPackage: OpenProjectLink;
  };
}

export interface OpenProjectActivityCollection {
  _type: 'Collection';
  total: number;
  count: number;
  _embedded: {
    elements: OpenProjectActivity[];
  };
  _links: OpenProjectLinks;
}

// ============ Meeting ============

export interface OpenProjectMeeting {
  id: number;
  title: string;
  location?: string;
  startTime: string;
  duration: string; // ISO 8601 duration e.g. "PT1H"
  state: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
  _embedded?: {
    project?: OpenProjectProject;
    author?: OpenProjectUser;
  };
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
    project: OpenProjectLink;
    author: OpenProjectLink;
  };
}

export interface OpenProjectMeetingCollection {
  _type: 'Collection';
  total: number;
  count: number;
  _embedded: {
    elements: OpenProjectMeeting[];
  };
  _links: OpenProjectLinks;
}

// ============ Wiki Page ============

export interface OpenProjectWikiPage {
  id: number;
  title: string;
  slug: string;
  text?: {
    format: string;
    raw: string;
    html: string;
  };
  createdAt: string;
  updatedAt: string;
  _embedded?: {
    project?: OpenProjectProject;
    author?: OpenProjectUser;
  };
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
    project: OpenProjectLink;
    author: OpenProjectLink;
  };
}

export interface OpenProjectWikiPageCollection {
  _type: 'Collection';
  total: number;
  count: number;
  _embedded: {
    elements: OpenProjectWikiPage[];
  };
  _links: OpenProjectLinks;
}

// ============ Time Entry ============

export interface OpenProjectTimeEntry {
  id: number;
  hours: string; // ISO 8601 duration e.g. "PT2H"
  comment?: {
    format: string;
    raw: string;
  };
  spentOn: string; // Date YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  _embedded?: {
    project?: OpenProjectProject;
    workPackage?: OpenProjectWorkPackage;
    user?: OpenProjectUser;
    activity?: {
      id: number;
      name: string;
    };
  };
  _links: OpenProjectLinks & {
    self: OpenProjectLink;
    project: OpenProjectLink;
    workPackage: OpenProjectLink;
    user: OpenProjectLink;
    activity: OpenProjectLink;
  };
}

export interface OpenProjectTimeEntryCollection {
  _type: 'Collection';
  total: number;
  count: number;
  _embedded: {
    elements: OpenProjectTimeEntry[];
  };
  _links: OpenProjectLinks;
}

// ============ API Response Types ============

export interface OpenProjectApiError {
  _type: 'Error';
  errorIdentifier: string;
  message: string;
}

// ============ Update Payloads ============

export interface UpdateWorkPackageStatusPayload {
  lockVersion: number;
  _links: {
    status: {
      href: string;
    };
  };
}

// ============ Kanban Types ============

export type KanbanGroupBy = 'status' | 'assignee' | 'version' | 'parent';

export interface KanbanColumnData {
  id: string; // Can be number as string, or 'unassigned', 'no-version', etc.
  numericId: number | null;
  name: string;
  color: string;
  workPackages: OpenProjectWorkPackage[];
}

export interface KanbanDragResult {
  workPackageId: number;
  workPackageLockVersion: number;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
  groupBy: KanbanGroupBy;
}

// Helpers for Kanban grouping
export function getGroupKeyFromWorkPackage(
  wp: OpenProjectWorkPackage,
  groupBy: KanbanGroupBy
): string {
  switch (groupBy) {
    case 'status':
      return extractIdFromHref(wp._links.status?.href)?.toString() || 'unknown';
    case 'assignee':
      return extractIdFromHref(wp._links.assignee?.href)?.toString() || 'unassigned';
    case 'version':
      return extractIdFromHref(wp._links.version?.href)?.toString() || 'no-version';
    case 'parent':
      return extractIdFromHref(wp._links.parent?.href)?.toString() || 'no-parent';
    default:
      return 'unknown';
  }
}
