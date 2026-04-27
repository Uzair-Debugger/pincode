'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/apiClient';
import type { HealthResponse } from '@/types/api';

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<HealthResponse>('/health')
      .then((res) => setHealth(res.data))
      .catch((err) => setError(err.message ?? 'Failed to reach backend'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex flex-col items-center justify-center flex-1 gap-6 p-8">
      <h1 className="text-3xl font-bold">Pin Code</h1>

      <Button variant="secondary" size="sm" onClick={toggleTheme}>
        {theme === 'dark' ? '☀ Light Mode' : '☾ Dark Mode'}
      </Button>

      <section className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-sm space-y-1">
        <p className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs">
          Backend Health
        </p>
        {loading && <p>Checking...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {health && (
          <>
            <p>Status: <span className="text-green-500 font-medium">{health.status}</span></p>
            <p>Uptime: {health.uptime}s</p>
            <p>Time: {health.timestamp}</p>
          </>
        )}
      </section>
    </main>
  );
}
