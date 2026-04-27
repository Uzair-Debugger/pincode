import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

// Extend config to carry request start time for duration logging
interface TimedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _startTime?: number;
}

const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config: TimedAxiosRequestConfig) => {
  config._startTime = Date.now();
  logger.request(config.method ?? 'GET', config.url ?? '');
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const config = response.config as TimedAxiosRequestConfig;
    const ms = Date.now() - (config._startTime ?? Date.now());
    logger.response(config.method ?? 'GET', config.url ?? '', response.status, ms);
    return response;
  },
  (error: AxiosError) => {
    const config = error.config as TimedAxiosRequestConfig | undefined;
    logger.error(
      `${config?.method?.toUpperCase()} ${config?.url} failed`,
      error.response?.data ?? error.message
    );
    return Promise.reject(error);
  }
);

export default apiClient;
