// src/app/[lang]/payment/success/page.tsx
"use client";

import React, { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent({ lang }: { lang: string }) {
  const searchParams = useSearchParams();
  const txRef = searchParams.get("tx_ref") || searchParams.get("trx_ref");

  return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto flex flex-col items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Payment Successful!</h1>
      <p className="text-neutral-500 text-sm leading-relaxed">
        Your payment has been received and your listing promotion is now active.
        {txRef && (
          <>
            {" "}Reference:{" "}
            <code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
              {txRef}
            </code>
          </>
        )}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
        <Link
          href={"/" + lang + "/seller/dashboard"}
          className="inline-flex justify-center px-6 py-2.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm transition"
        >
          Back to Dashboard
        </Link>
        <Link
          href={"/" + lang + "/properties"}
          className="inline-flex justify-center px-6 py-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-sm transition"
        >
          Browse Properties
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === "am" ? "am" : "en";
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Suspense fallback={<div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" /></div>}>
        <PaymentSuccessContent lang={lang} />
      </Suspense>
    </div>
  );
}