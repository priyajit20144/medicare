export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any[];
}

const BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || '/api';

export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('medicare_token');

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMsg = data?.message || `Request failed with status ${response.status}`;
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const detailedErrors = data.errors.map((e: any) => e.message || e).filter(Boolean);
      if (detailedErrors.length > 0) {
        errorMsg = detailedErrors.join('. ');
      }
    }
    throw new ApiError(errorMsg, response.status, data?.errors);
  }

  return (data?.data ?? data) as T;
}

export const api = {
  get: <T = any>(url: string, params?: Record<string, any>) => {
    let finalUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        finalUrl += (url.includes('?') ? '&' : '?') + qs;
      }
    }
    return request<T>(finalUrl, { method: 'GET' });
  },

  post: <T = any>(url: string, body?: any) => {
    return request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  patch: <T = any>(url: string, body?: any) => {
    return request<T>(url, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete: <T = any>(url: string) => {
    return request<T>(url, { method: 'DELETE' });
  },

  upload: <T = any>(url: string, formData: FormData) => {
    return request<T>(url, {
      method: 'POST',
      body: formData,
    });
  },
};
