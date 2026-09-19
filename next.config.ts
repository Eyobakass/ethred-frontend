import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pannellum.org' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      // AWS S3 — production media storage
      { protocol: 'https', hostname: '**.s3.amazonaws.com' },
      { protocol: 'https', hostname: '**.s3.*.amazonaws.com' },
      // EC2 backend (local uploads served in dev)
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },
  turbopack: {
    // Explicitly set root to the frontend directory to silence the
    // "multiple lockfiles" workspace root detection warning
    root: __dirname,
  },
};

export default nextConfig;

