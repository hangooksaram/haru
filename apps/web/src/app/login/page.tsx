import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { PaymentLoginContext } from "@/features/auth/components/PaymentLoginContext";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

type Props = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-8 px-6 py-20">
      <div className="flex items-center justify-center gap-2 text-2xl font-black tracking-tight">
        <img src="/icon.svg" alt="" width={28} height={28} />
        haru<span className="text-brand-deep">.</span>
      </div>
      <div className="flex flex-col gap-6">
        <PaymentLoginContext next={next} />
        <SocialLoginButtons next={next} />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs">또는</span>
          <Separator className="flex-1" />
        </div>
        {error === "naver_email_conflict" && (
          <p className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm font-medium">
            이미 다른 방식으로 가입된 이메일입니다. 가입하신 방법으로
            로그인해주세요.
          </p>
        )}
        <LoginForm next={next} />
      </div>
      <p className="text-muted-foreground text-center text-sm">
        계정이 없으신가요?{" "}
        <Link
          href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-foreground font-semibold underline-offset-4 hover:underline"
        >
          가입하기
        </Link>
      </p>
    </div>
  );
}
