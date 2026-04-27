import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // NEXT_PUBLIC_* vars are auto-exposed to the browser by Next.js.
  // Re-declaring them under `env:` is redundant and can shadow .env.local values.
};

export default nextConfig;
