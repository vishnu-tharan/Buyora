import type { ApiError } from '@/types';

const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export class BuyoraApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly fieldErrors?: Record<string, string>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'BuyoraApiError';
    this.status = error.status;
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isValidationError() {
    return this.status === 400;
  }
  get isServerError() {
    return this.status >= 500;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | string[] | undefined | null>;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\'))
    throw new Error('Invalid API path');
  const apiBase =
    typeof window === 'undefined'
      ? (process.env.INTERNAL_API_URL ?? PUBLIC_API_BASE)
      : PUBLIC_API_BASE;
  const url = new URL(`${apiBase.replace(/\/$/, '')}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new BuyoraApiError({
      timestamp: new Date().toISOString(),
      status: response.status,
      code: typeof data?.code === 'string' ? data.code : 'REQUEST_FAILED',
      message:
        response.status >= 500
          ? 'The service is temporarily unavailable. Please try again.'
          : typeof data?.message === 'string'
            ? data.message
            : 'The request could not be completed.',
      fieldErrors: data?.fieldErrors,
    });
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const headers = new Headers(fetchOptions.headers);
  headers.set('Accept', 'application/json');
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(fetchOptions.method ?? 'GET')) {
    const csrfResponse = await fetch(buildUrl('/auth/csrf'), {
      credentials: 'include',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const csrf = await handleResponse<{ token: string; headerName: string }>(csrfResponse);
    headers.set(csrf.headerName, csrf.token);
  }
  const response = await fetch(url, {
    cache: 'no-store',
    ...fetchOptions,
    signal: fetchOptions.signal ?? AbortSignal.timeout(15000),
    credentials: 'include',
    headers,
  });
  return handleResponse<T>(response);
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
