import { clearSession, getToken } from '../auth/auth';

export const API_BASE_URL =
  import.meta.env.PUBLIC_API_URL ?? 'http://localhost:7195';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** An expired or rejected token means the session is over. */
function handleUnauthorized(): void {
  clearSession();
  // TODO: Login is hidden for now — restore the redirect once the login page is back:
  // if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
}

async function toApiError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;

  try {
    const body = await response.json();
    if (body && typeof body === 'object') {
      message = body.message ?? body.title ?? message;
    }
  } catch {
    // Response had no JSON body; keep the status-based message.
  }

  return new ApiError(response.status, message);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...init.headers,
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/**
 * Downloads a file from the API. Uses fetch rather than window.open so the
 * Authorization header travels with the request.
 */
export async function downloadFile(
  path: string,
  fallbackFilename: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  const disposition = response.headers.get('Content-Disposition');
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  const filename = match ? decodeURIComponent(match[1]) : fallbackFilename;

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
