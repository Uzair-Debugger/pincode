import apiClient from '@/lib/apiClient';
import type { User } from '@/types/domain';

interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<{ status: string; data: AuthResponse }>('/auth/login', { email, password });
    return res.data.data;
  },

  async signup(email: string, password: string, name?: string): Promise<{ user: User }> {
    const res = await apiClient.post<{ status: string; data: { user: User } }>('/auth/signup', { email, password, name });
    return res.data.data;
  },

  async refresh(): Promise<string> {
    const res = await apiClient.post<{ status: string; data: { accessToken: string } }>('/auth/refresh');
    return res.data.data.accessToken;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
