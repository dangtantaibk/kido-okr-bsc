// OpenProject API Client
// Fetch-based client with auth interceptor

const BASE_URL = process.env.NEXT_PUBLIC_OPENPROJECT_BASE_URL || 'https://openproject.61.28.229.105.sslip.io';
const API_KEY = process.env.NEXT_PUBLIC_OPENPROJECT_API_KEY || '';

function getAuthHeaders(): HeadersInit {
  const credentials = Buffer.from(`apikey:${API_KEY}`).toString('base64');
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };
}

// Browser-safe auth headers
function getClientAuthHeaders(): HeadersInit {
  // In browser, we use btoa instead of Buffer
  const credentials = typeof window !== 'undefined'
    ? btoa(`apikey:${API_KEY}`)
    : Buffer.from(`apikey:${API_KEY}`).toString('base64');
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

// Build URL with query params
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${BASE_URL}/api/v3${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

// Generic API fetch function (client-side)
export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params } = options;
  const url = buildUrl(endpoint, params);

  try {
    const response = await fetch(url, {
      method,
      headers: getClientAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        data: null,
        error: errorData?.message || `API Error: ${response.status} ${response.statusText}`,
        status: response.status,
      };
    }

    // DELETE returns no content
    if (response.status === 204) {
      return { data: null, error: null, status: 204 };
    }

    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 0,
    };
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    apiClient<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body }),

  patch: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body }),

  delete: (endpoint: string) =>
    apiClient<void>(endpoint, { method: 'DELETE' }),
};

// Export base config for server actions
export { BASE_URL, getAuthHeaders };
