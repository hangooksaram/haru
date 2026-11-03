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
  socialConflict?: string;
};

export function SocialLoginButtons({ next, socialConflict }: Props) {
  async function handleClick(provider: "google" | "kakao") {
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

  return (
    <div className="flex flex-col gap-2">
      {socialConflict && (
        <p className="text-destructive text-sm">
          이미 다른 계정에 연결된 소셜 계정이에요. 다시 눌러서 로그인해주세요.
        </p>
      )}
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
