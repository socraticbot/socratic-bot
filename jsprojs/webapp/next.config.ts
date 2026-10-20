import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly configure to avoid workspace detection issues
  // Next.js was detecting multiple lockfiles and using wrong root
  // Note: turbopack.root is set via environment variable or build command
  // For now, we rely on Root Directory setting in Vercel
};

export default nextConfig;
