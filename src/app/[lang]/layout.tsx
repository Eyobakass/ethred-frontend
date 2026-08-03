// src/app/[lang]/layout.tsx
import React from 'react';
import '@/app/globals.css';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title:
      lang === 'am'
        ? 'ኢትሬድ — የኢትዮጵያ ምርጥ የሪል ስቴት ምህዳር'
        : 'Ethred — Modern Ethiopian Real Estate Ecosystem',
    description:
      lang === 'am'
        ? 'የተረጋገጡ ቤቶች፣ አፓርታማዎች እና የንግድ ቦታዎች በ 3D ቨርቹዋል ጉብኝት'
        : 'Discover verified properties in Ethiopia with 3D virtual tours and seamless local payment integration.',
    keywords: [
      'Ethiopia real estate',
      'Addis Ababa apartments',
      '3D virtual tour',
      'Telebirr',
      'CBE Birr',
      'Ethred',
    ],
  };
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'am' }];
}

export default async function RootLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang === 'am' ? 'am' : 'en';

  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <body className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
