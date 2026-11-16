"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { sanitizeNextPath } from "@/features/auth/lib/sanitizeNextPath";
import { createClient } from "@/lib/supabase/client";

const PROVIDERS = [
  { id: "google", label: "구글로 가입하기" },
  { id: "kakao", label: "카카오로 가입하기" },
] as const;

type Provider = (typeof PROVIDERS)[number]["id"];

type Props = {
  next?: string;
  socialConflict?: string;
};

export function SocialLoginButtons({ next, socialConflict }: Props) {
  const hasRetried = useRef(false);

  async function handleClick(provider: Provider) {
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", sanitizeNextPath(next));
    callbackUrl.searchParams.set("provider", provider);

    const { data } = await supabase.auth.getUser();
    const shouldLink = data.user?.is_anonymous && provider !== socialConflict;

    if (shouldLink) {
      await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo: callbackUrl.toString() },
      });
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() },
    });
  }

  useEffect(() => {
    if (!socialConflict || hasRetried.current) return;
    hasRetried.current = true;
    void handleClick(socialConflict as Provider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socialConflict]);

  return (
    <div className="flex flex-col gap-2">
      {PROVIDERS.map(({ id, label }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          onClick={() => handleClick(id)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
