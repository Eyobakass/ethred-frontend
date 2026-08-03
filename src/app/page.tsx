// src/app/page.tsx
import { redirect } from 'next/navigation';

// Redirect root / to /en for default locale
export default function RootPage() {
  redirect('/en');
}
