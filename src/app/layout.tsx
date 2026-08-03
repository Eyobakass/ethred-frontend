// src/app/layout.tsx
// Root layout: only wraps <html> with base font. Minimal intentionally.
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ethred — Ethiopian Real Estate with 3D Virtual Tours',
  description:
    'Discover verified apartments, villas, land, and commercial properties across Ethiopia with Matterport-style 3D virtual tours and local payment integration.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
