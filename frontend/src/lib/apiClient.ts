import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { tokenStore } from '@/lib/tokenStore';

interface TimedConfig extends InternalAxiosRequestConfig {
  _startTime?: number;
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true, // send httpOnly refresh cookie on every request
});

// ── Request: inject access token + timing ────────────────────────────────────
apiClient.interceptors.request.use((config: TimedConfig) => {
  config._startTime = Date.now();
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  logger.request(config.method ?? 'GET', config.url ?? '');
  return config;
});

// ── Response: log timing + silent refresh on 401 ─────────────────────────────
let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (response) => {
    const cfg = response.config as TimedConfig;
    logger.response(cfg.method ?? 'GET', cfg.url ?? '', response.status, Date.now() - (cfg._startTime ?? Date.now()));
    return response;
  },
  async (error: AxiosError) => {
    const cfg = error.config as TimedConfig | undefined;

    if (error.response?.status !== 401 || cfg?._retry || !cfg) {
      logger.error(`${cfg?.method?.toUpperCase()} ${cfg?.url} failed`, error.response?.data ?? error.message);
      return Promise.reject(error);
    }

    cfg._retry = true;

    // Deduplicate concurrent refresh calls
    if (!refreshPromise) {
      refreshPromise = apiClient
        .post<{ status: string; data: { accessToken: string } }>('/auth/refresh')
        .then((r) => r.data.data.accessToken)
        .finally(() => { refreshPromise = null; });
    }

    try {
      const newToken = await refreshPromise;
      tokenStore.set(newToken);
      cfg.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(cfg);
    } catch {
      tokenStore.clear();
      // Let consumers (AuthContext) react to the rejected promise
      return Promise.reject(error);
    }
  }
);

export default apiClient;
