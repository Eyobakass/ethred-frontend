// Redirects to the unified listing manager page
'use client';
import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace('/' + lang + '/seller/listings/' + id);
  }, [lang, id, router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}