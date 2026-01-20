'use server';

import type {
  OpenProjectStatus,
  OpenProjectStatusCollection,
  OpenProjectWorkPackage,
  OpenProjectWorkPackageCollection,
  OpenProjectProject,
  OpenProjectProjectCollection,
  UpdateWorkPackageStatusPayload,
} from '@/types/openproject';

// ============ Configuration ============

const BASE_URL = process.env.OPENPROJECT_BASE_URL || 'https://openproject.61.28.229.105.sslip.io';
const API_KEY = process.env.OPENPROJECT_API_KEY || '';

function getAuthHeaders(): HeadersInit {
  const credentials = Buffer.from(`apikey:${API_KEY}`).toString('base64');
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };
}

// ============ Status Actions ============

export async function getStatuses(): Promise<OpenProjectStatus[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/v3/statuses`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch statuses: ${response.status} ${response.statusText}`);
    }

    const data: OpenProjectStatusCollection = await response.json();
    return data._embedded.elements.sort((a, b) => a.position - b.position);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    throw error;
  }
}

// ============ Project Actions ============

export async function getProjects(): Promise<OpenProjectProject[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/v3/projects?pageSize=100`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
    }

    const data: OpenProjectProjectCollection = await response.json();
    return data._embedded.elements;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

// ============ Work Package Actions ============

export async function getWorkPackages(projectId?: number): Promise<OpenProjectWorkPackage[]> {
  try {
    // Use project-specific endpoint or global endpoint
    const endpoint = projectId
      ? `${BASE_URL}/api/v3/projects/${projectId}/work_packages`
      : `${BASE_URL}/api/v3/work_packages`;

    const response = await fetch(
      `${endpoint}?pageSize=200`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch work packages: ${response.status} ${response.statusText}`);
    }

    const data: OpenProjectWorkPackageCollection = await response.json();
    return data._embedded.elements;
  } catch (error) {
    console.error('Error fetching work packages:', error);
    throw error;
  }
}

export async function getWorkPackage(workPackageId: number): Promise<OpenProjectWorkPackage> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v3/work_packages/${workPackageId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch work package: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching work package:', error);
    throw error;
  }
}

export async function updateWorkPackageStatus(
  workPackageId: number,
  newStatusId: number,
  lockVersion: number
): Promise<OpenProjectWorkPackage> {
  try {
    const payload: UpdateWorkPackageStatusPayload = {
      lockVersion,
      _links: {
        status: {
          href: `/api/v3/statuses/${newStatusId}`,
        },
      },
    };

    const response = await fetch(
      `${BASE_URL}/api/v3/work_packages/${workPackageId}`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update work package: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating work package status:', error);
    throw error;
  }
}

// ============ Types Actions ============

export interface OpenProjectType {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
  isMilestone: boolean;
  position: number;
  _links: {
    self: { href: string };
  };
}

export async function getTypes(projectId?: number): Promise<OpenProjectType[]> {
  try {
    const endpoint = projectId
      ? `${BASE_URL}/api/v3/projects/${projectId}/types`
      : `${BASE_URL}/api/v3/types`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch types: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data._embedded?.elements || [];
  } catch (error) {
    console.error('Error fetching types:', error);
    throw error;
  }
}

// ============ Users Actions ============

export interface OpenProjectUserSimple {
  id: number;
  name: string;
  login: string;
  _links: {
    self: { href: string };
  };
}

export async function getProjectMembers(projectId: number): Promise<OpenProjectUserSimple[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v3/projects/${projectId}/available_assignees`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data._embedded?.elements || [];
  } catch (error) {
    console.error('Error fetching project members:', error);
    throw error;
  }
}

// ============ CRUD Actions ============

export interface CreateWorkPackageData {
  subject: string;
  projectId: number;
  typeId?: number;
  statusId?: number;
  startDate?: string | null;
  dueDate?: string | null;
  description?: string;
  assigneeId?: number | null;
}

export async function createWorkPackage(data: CreateWorkPackageData): Promise<OpenProjectWorkPackage> {
  try {
    const payload: Record<string, unknown> = {
      subject: data.subject,
      _links: {
        project: { href: `/api/v3/projects/${data.projectId}` },
      },
    };

    if (data.typeId) {
      (payload._links as Record<string, unknown>).type = { href: `/api/v3/types/${data.typeId}` };
    }
    if (data.statusId) {
      (payload._links as Record<string, unknown>).status = { href: `/api/v3/statuses/${data.statusId}` };
    }
    if (data.assigneeId) {
      (payload._links as Record<string, unknown>).assignee = { href: `/api/v3/users/${data.assigneeId}` };
    }
    if (data.startDate) {
      payload.startDate = data.startDate;
    }
    if (data.dueDate) {
      payload.dueDate = data.dueDate;
    }
    if (data.description) {
      payload.description = { format: 'markdown', raw: data.description };
    }

    const response = await fetch(`${BASE_URL}/api/v3/work_packages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create work package: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating work package:', error);
    throw error;
  }
}

export interface UpdateWorkPackageData {
  id: number;
  lockVersion: number;
  subject?: string;
  typeId?: number;
  statusId?: number;
  startDate?: string | null;
  dueDate?: string | null;
  description?: string;
  assigneeId?: number | null;
}

export async function updateWorkPackage(data: UpdateWorkPackageData): Promise<OpenProjectWorkPackage> {
  try {
    const payload: Record<string, unknown> = {
      lockVersion: data.lockVersion,
      _links: {},
    };

    if (data.subject !== undefined) {
      payload.subject = data.subject;
    }
    if (data.typeId !== undefined) {
      (payload._links as Record<string, unknown>).type = { href: `/api/v3/types/${data.typeId}` };
    }
    if (data.statusId !== undefined) {
      (payload._links as Record<string, unknown>).status = { href: `/api/v3/statuses/${data.statusId}` };
    }
    if (data.assigneeId !== undefined) {
      if (data.assigneeId === null) {
        (payload._links as Record<string, unknown>).assignee = { href: null };
      } else {
        (payload._links as Record<string, unknown>).assignee = { href: `/api/v3/users/${data.assigneeId}` };
      }
    }
    if (data.startDate !== undefined) {
      payload.startDate = data.startDate;
    }
    if (data.dueDate !== undefined) {
      payload.dueDate = data.dueDate;
    }
    if (data.description !== undefined) {
      payload.description = { format: 'markdown', raw: data.description };
    }

    const response = await fetch(`${BASE_URL}/api/v3/work_packages/${data.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update work package: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating work package:', error);
    throw error;
  }
}

export async function deleteWorkPackage(workPackageId: number): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/api/v3/work_packages/${workPackageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete work package: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting work package:', error);
    throw error;
  }
}

// ============ Version Actions ============

export async function getVersions(projectId: number): Promise<Array<{ id: number; name: string; status: string }>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v3/projects/${projectId}/versions?pageSize=100`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch versions: ${response.status}`);
    }

    const data = await response.json();
    return data._embedded?.elements || [];
  } catch (error) {
    console.error('Error fetching versions:', error);
    throw error;
  }
}

// ============ Meeting Actions ============

export async function getMeetings(projectId: number): Promise<Array<{
  id: number;
  title: string;
  startTime: string;
  duration: string;
  location?: string;
  state: string;
  _embedded?: { author?: { name: string } };
}>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v3/projects/${projectId}/meetings?pageSize=50&sortBy=${encodeURIComponent('["startTime","desc"]')}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );

    // Return empty array if module not enabled (404)
    if (response.status === 404) {
      console.log('Meetings module not enabled for this project');
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch meetings: ${response.status}`);
    }

    const data = await response.json();
    return data._embedded?.elements || [];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return []; // Return empty on error
  }
}

// ============ Wiki Actions ============

export async function getWikiPages(projectIdentifier: string): Promise<Array<{
  id: number;
  title: string;
  slug: string;
  updatedAt: string;
  _embedded?: { author?: { name: string } };
}>> {
  try {
    const url = `${BASE_URL}/api/v3/projects/${projectIdentifier}/wiki_pages?pageSize=100`;
    console.log('[Wiki] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    console.log('[Wiki] Response status:', response.status);

    // Return empty array if module not enabled (404)
    if (response.status === 404) {
      console.log('[Wiki] Module not enabled for this project');
      return [];
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Wiki] Error response:', errorText);
      throw new Error(`Failed to fetch wiki pages: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Wiki] Found', data._embedded?.elements?.length || 0, 'wiki pages');
    return data._embedded?.elements || [];
  } catch (error) {
    console.error('[Wiki] Error fetching wiki pages:', error);
    return []; // Return empty on error
  }
}

export async function getWikiPage(projectIdentifier: string, slug: string): Promise<{
  id: number;
  title: string;
  slug: string;
  text?: { html: string; raw: string };
} | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/v3/projects/${projectIdentifier}/wiki_pages/${slug}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching wiki page:', error);
    throw error;
  }
}

// ============ Time Entry Actions ============

export async function getTimeEntries(projectId: number): Promise<Array<{
  id: number;
  hours: string;
  spentOn: string;
  comment?: { raw: string };
  _embedded?: {
    user?: { name: string };
    workPackage?: { id: number; subject: string };
    activity?: { name: string };
  };
}>> {
  try {
    const filters = JSON.stringify([{ project: { operator: '=', values: [projectId.toString()] } }]);
    const response = await fetch(
      `${BASE_URL}/api/v3/time_entries?pageSize=200&filters=${encodeURIComponent(filters)}&sortBy=${encodeURIComponent('[["spentOn","desc"]]')}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch time entries: ${response.status}`);
    }

    const data = await response.json();
    return data._embedded?.elements || [];
  } catch (error) {
    console.error('Error fetching time entries:', error);
    throw error;
  }
}

// ============ Activity Actions ============

export async function getWorkPackageActivities(workPackageId: number): Promise<Array<{
  id: number;
  comment?: { raw: string; html: string };
  details: Array<{ html: string }>;
  createdAt: string;
  _embedded?: { user?: { name: string } };
}>> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v3/work_packages/${workPackageId}/activities?pageSize=50`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.status}`);
    }

    const data = await response.json();
    return data._embedded?.elements || [];
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
}

export async function addComment(workPackageId: number, comment: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/api/v3/work_packages/${workPackageId}/activities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comment: { raw: comment } }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.status}`);
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

