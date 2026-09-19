// src/app/[lang]/agencies/join/page.tsx
"use client";

import React, { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function JoinContent({ lang }: { lang: string }) {
  const searchParams = useSearchParams();
  const agencyId = searchParams.get("agency");
  const email = searchParams.get("email");

  if (!agencyId || !email) {
    return (
      <div className="py-20 text-center space-y-4 flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Invalid Invitation</h1>
        <p className="text-neutral-500 text-sm">This invitation link is invalid or has expired.</p>
        <Link href={"/" + lang} className="inline-flex px-6 py-2.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm transition">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto flex flex-col items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 dark:text-neutral-600"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Agency Invitation</h1>
      <p className="text-neutral-500 text-sm">
        You have been invited to join an agency on Ethred. Sign in or create an account with{" "}
        <strong>{email}</strong> to accept.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
        <Link
          href={"/" + lang + "/auth/login?redirect=/" + lang + "/agencies/" + agencyId + "/dashboard"}
          className="inline-flex justify-center px-6 py-2.5 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm transition"
        >
          Sign In to Accept
        </Link>
        <Link
          href={"/" + lang + "/auth/register?email=" + encodeURIComponent(email) + "&redirect=/" + lang + "/agencies/" + agencyId + "/dashboard"}
          className="inline-flex justify-center px-6 py-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-sm transition"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function AgencyJoinPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === "am" ? "am" : "en";
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Suspense fallback={<div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin" /></div>}>
        <JoinContent lang={lang} />
      </Suspense>
    </div>
  );
}