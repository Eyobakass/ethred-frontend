// src/utils/whatsapp.ts

export interface WhatsAppLinkOptions {
  phone?: string | null;
  propertyTitle: string;
  priceEtb: number;
  propertyId: string;
  lang?: 'en' | 'am';
}

/**
 * Normalizes Ethiopian phone numbers to international format (251xxxxxxxxx)
 */
export function normalizeEthiopianPhone(phone?: string | null): string {
  if (!phone) return '251911000000'; // Default support / fallback line

  // Remove any spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');

  // If starts with 09... or 07..., convert to 2519... or 2517...
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '251' + cleaned.substring(1);
  }

  // If starts with 9... or 7... and length is 9, add 251
  if ((cleaned.startsWith('9') || cleaned.startsWith('7')) && cleaned.length === 9) {
    cleaned = '251' + cleaned;
  }

  return cleaned;
}

/**
 * Generates a deep-linked WhatsApp Web / App chat URL with pre-filled inquiry text (SRS REQ-COMM-02)
 */
export function createWhatsAppInquiryLink({
  phone,
  propertyTitle,
  priceEtb,
  propertyId,
  lang = 'en',
}: WhatsAppLinkOptions): string {
  const normalizedPhone = normalizeEthiopianPhone(phone);
  const formattedPrice = new Intl.NumberFormat('en-US').format(priceEtb);
  const propertyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${lang}/properties/${propertyId}`
    : `https://ethred.com/${lang}/properties/${propertyId}`;

  const message =
    lang === 'am'
      ? `ሰላም! በኢትሬድ ላይ ባለው ቤትዎ ፍላጎት አለኝ፡ "${propertyTitle}" (${formattedPrice} ብር)። ተጨማሪ መረጃ ማግኘት እችላለሁ?\n${propertyUrl}`
      : `Hello! I am interested in your property listed on Ethred: "${propertyTitle}" (${formattedPrice} ETB). Can you share more details?\n${propertyUrl}`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
