import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Strict mode for React 19 — catches deprecated patterns early
  reactStrictMode: true,
  // Pin the tracing root to this project to avoid the "multiple lockfiles" warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
