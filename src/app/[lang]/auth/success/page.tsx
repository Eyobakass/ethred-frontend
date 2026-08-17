// src/app/[lang]/auth/success/page.tsx
"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";

export default function AuthSuccessPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = use(params);
  const lang = rawLang === "am" ? "am" : "en";
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const init = async () => {
      try {
        const res: any = await authService.getMe();
        const user = res?.user || res;
        if (user?.id) {
          setAuth(user, "");
          const role: string = user.role || "BUYER";
          const destinations: Record<string, string> = {
            ADMIN: "/" + lang + "/admin/dashboard",
            AGENCY_ADMIN: "/" + lang + "/agencies/dashboard",
            AGENCY_AGENT: "/" + lang + "/seller/dashboard",
            SELLER: "/" + lang + "/seller/dashboard",
            BUYER: "/" + lang + "/buyer/dashboard",
          };
          router.replace(destinations[role] || "/" + lang);
        } else {
          router.replace("/" + lang + "/auth/login");
        }
      } catch {
        router.replace("/" + lang + "/auth/login");
      }
    };
    init();
  }, [lang, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-neutral-800 dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-neutral-500">Signing you in...</p>
      </div>
    </div>
  );
}