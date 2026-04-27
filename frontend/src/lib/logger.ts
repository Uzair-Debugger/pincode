const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  request: (method: string, url: string) => {
    if (isDev) console.log(`[REQ] ${method.toUpperCase()} ${url}`);
  },
  response: (method: string, url: string, status: number, ms: number) => {
    if (isDev) console.log(`[RES] ${method.toUpperCase()} ${url} ${status} — ${ms}ms`);
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERR] ${message}`, error ?? '');
  },
};
