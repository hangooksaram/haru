"use client";

import { Button } from "@/components/ui/button";
import { sanitizeNextPath } from "@/features/auth/lib/sanitizeNextPath";
import { createClient } from "@/lib/supabase/client";

const PROVIDERS = [
  { id: "google", label: "구글로 가입하기" },
  { id: "kakao", label: "카카오로 가입하기" },
] as const;

type Props = {
  next?: string;
};

export function SocialLoginButtons({ next }: Props) {
  async function handleClick(provider: "google" | "kakao") {
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", sanitizeNextPath(next));

    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() },
    });
  }

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
