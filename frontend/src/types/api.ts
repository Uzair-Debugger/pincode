export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
}
