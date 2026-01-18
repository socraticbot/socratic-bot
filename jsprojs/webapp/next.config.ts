import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Suppress workspace root warning for monorepo
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
