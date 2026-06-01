'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090';

const TOKEN_KEY = 'ds_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details?: string[];
  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      clearToken();
    }
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data?.details);
  }
  return data as T;
}

export const get = <T = any>(path: string) => api<T>(path);
export const post = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const put = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
export const patch = <T = any>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });

export const fmtVND = (v: number): string => (Number(v) || 0).toLocaleString('vi-VN') + ' ₫';
export const RANK_LABELS: Record<string, string> = {
  CTV: 'Cộng tác viên', PP: 'Phó phòng', TP: 'Trưởng phòng', GDV: 'Giám đốc vùng', GDKD: 'Giám đốc kinh doanh',
};
