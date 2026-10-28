const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export class BuyoraApiError extends Error {
  constructor(error) {
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

function buildUrl(path, params) {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    throw new Error('Invalid API path');
  }
  const apiBase =
    typeof window === 'undefined'
      ? (process.env.INTERNAL_API_URL ?? PUBLIC_API_BASE)
      : PUBLIC_API_BASE;
  const url = new URL(`${apiBase.replace(/\/$/, '')}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function handleResponse(response) {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    let message = 'The request could not be completed.';
    if (response.status >= 500) {
      message = 'The service is temporarily unavailable. Please try again.';
    } else if (typeof data?.message === 'string') {
      message = data.message;
    }
    throw new BuyoraApiError({
      timestamp: new Date().toISOString(),
      status: response.status,
      code: typeof data?.code === 'string' ? data.code : 'REQUEST_FAILED',
      message,
      fieldErrors: data?.fieldErrors,
    });
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function apiRequest(path, options = {}) {
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
    const csrf = await handleResponse(csrfResponse);
    headers.set(csrf.headerName, csrf.token);
  }
  const response = await fetch(url, {
    cache: 'no-store',
    ...fetchOptions,
    signal: fetchOptions.signal ?? AbortSignal.timeout(15000),
    credentials: 'include',
    headers,
  });
  return handleResponse(response);
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};
