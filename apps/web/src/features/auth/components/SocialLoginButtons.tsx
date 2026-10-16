"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const PROVIDERS = [
  { id: "google", label: "구글로 가입하기" },
  { id: "kakao", label: "카카오로 가입하기" },
] as const;

export function SocialLoginButtons() {
  async function handleClick(provider: "google" | "kakao") {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
