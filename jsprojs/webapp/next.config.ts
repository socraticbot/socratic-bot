import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly configure to avoid workspace detection issues
  // Next.js was detecting multiple lockfiles and using wrong root
  // Note: turbopack.root is set via environment variable or build command
  // For now, we rely on Root Directory setting in Vercel

  // Farcaster Mini App manifest, hosted and edited in Farcaster's developer tools.
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination:
          'https://api.farcaster.xyz/miniapps/hosted-manifest/01a15997-6793-072b-75c6-461d3c6a4024',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
