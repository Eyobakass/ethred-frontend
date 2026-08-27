import { redirect } from 'next/navigation';

export default async function SellerListingsIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect('/' + lang + '/seller/dashboard');
}

