// IMPORTANT: Next.js statically inlines NEXT_PUBLIC_* vars at build time.
// process.env[dynamicKey] bypasses inlining and returns undefined in the browser.
// Each var must be accessed with a literal string key.
function assertEnv(key: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  API_BASE_URL: assertEnv('NEXT_PUBLIC_API_BASE_URL', process.env.NEXT_PUBLIC_API_BASE_URL),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
