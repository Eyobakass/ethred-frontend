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
      <div className="py-20 text-center space-y-4">
        <span className="text-5xl block">❌</span>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Invalid Invitation</h1>
        <p className="text-neutral-500 text-sm">This invitation link is invalid or has expired.</p>
        <Link href={"/" + lang} className="inline-flex px-6 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto">
      <span className="text-5xl block">🏢</span>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Agency Invitation</h1>
      <p className="text-neutral-500 text-sm">
        You have been invited to join an agency on Ethred. Sign in or create an account with{" "}
        <strong>{email}</strong> to accept.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href={"/" + lang + "/auth/login?redirect=/" + lang + "/agencies/" + agencyId + "/dashboard"}
          className="inline-flex justify-center px-6 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm"
        >
          Sign In to Accept
        </Link>
        <Link
          href={"/" + lang + "/auth/register?email=" + encodeURIComponent(email) + "&redirect=/" + lang + "/agencies/" + agencyId + "/dashboard"}
          className="inline-flex justify-center px-6 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-sm"
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
      <Suspense fallback={<div className="py-20 text-center"><div className="w-10 h-10 border-4 border-neutral-800 border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
        <JoinContent lang={lang} />
      </Suspense>
    </div>
  );
}