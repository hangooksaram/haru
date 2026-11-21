"use client";

import { Button } from "@/components/ui/button";
import { sanitizeNextPath } from "@/features/auth/lib/sanitizeNextPath";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8749 2.6836-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1736 0 7.5477 0 9s.3477 2.8264.9573 4.0418L3.964 10.71z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5814-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
      <rect width="20" height="20" rx="6" fill="#FEE500" />
      <path
        fill="#191919"
        d="M10 5c-3.0376 0-5.5 1.9494-5.5 4.3529 0 1.5412 1.0218 2.8947 2.5644 3.6712-.1131.4147-.7294 2.6682-.7536 2.8412 0 0-.0151.1274.0659.1764.081.049.1762.0118.1762.0118.2322-.0324 2.6914-1.7609 3.1101-2.0569.3487.0514.7072.0788 1.0871.0788 3.0376 0 5.5-1.9494 5.5-4.3529S13.0376 5 10 5Z"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
      <rect width="20" height="20" rx="4" fill="#03C75A" />
      <path fill="#fff" d="M12.6 5.5v5.1L7.4 5.5H5v9h2.4V9.4l5.2 5.1H15v-9z" />
    </svg>
  );
}

const PROVIDERS = [
  { id: "google", label: "구글로 계속하기", Icon: GoogleIcon },
  { id: "kakao", label: "카카오로 계속하기", Icon: KakaoIcon },
  { id: "naver", label: "네이버로 계속하기", Icon: NaverIcon },
] as const;

type Provider = (typeof PROVIDERS)[number]["id"];

type Props = {
  next?: string;
};

export function SocialLoginButtons({ next }: Props) {
  async function handleClick(provider: Provider) {
    if (provider === "naver") {
      const naverUrl = new URL("/auth/naver", window.location.origin);
      naverUrl.searchParams.set("next", sanitizeNextPath(next));
      window.location.href = naverUrl.toString();
      return;
    }

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
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          onClick={() => handleClick(id)}
          className="h-12 w-full justify-center gap-3 rounded-xl text-sm font-medium"
        >
          <Icon />
          {label}
        </Button>
      ))}
    </div>
  );
}
