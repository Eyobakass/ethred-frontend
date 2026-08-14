// src/utils/imageUrl.ts
/**
 * Resolves a backend media URL to an absolute URL.
 * Handles both absolute (http/https) and relative (/uploads/...) paths.
 * Falls back gracefully if NEXT_PUBLIC_API_URL is not configured.
 */
export function getImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? '';
  if (!base) return url; // return relative URL as-is if no base configured
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
