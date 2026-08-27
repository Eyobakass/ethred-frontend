import { redirect } from 'next/navigation';

export default async function BuyerDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(`/${lang}/buyer/favorites`);
}
