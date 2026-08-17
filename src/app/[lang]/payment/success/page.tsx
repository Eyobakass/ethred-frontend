// src/app/[lang]/payment/success/page.tsx
"use client";

import React, { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentSuccessContent({ lang }: { lang: string }) {
  const searchParams = useSearchParams();
  const txRef = searchParams.get("tx_ref") || searchParams.get("trx_ref");

  return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto">
      <span className="text-6xl block">SUCCESS</span>
      <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Payment Successful!</h1>
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
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={"/" + lang + "/seller/dashboard"}
          className="inline-flex justify-center px-6 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm"
        >
          Back to Dashboard
        </Link>
        <Link
          href={"/" + lang + "/properties"}
          className="inline-flex justify-center px-6 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-sm"
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
      <Suspense fallback={<div className="py-20 text-center"><div className="w-10 h-10 border-4 border-neutral-800 border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
        <PaymentSuccessContent lang={lang} />
      </Suspense>
    </div>
  );
}