import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

type Props = {
  searchParams: Promise<{
    next?: string;
    socialConflict?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, socialConflict, error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-10 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>로그인</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <LoginForm next={next} />
          <Separator />
          {error === "naver_email_conflict" && (
            <p className="text-sm font-medium text-destructive">
              이미 다른 방식으로 가입된 이메일입니다. 가입하신 방법으로
              로그인해주세요.
            </p>
          )}
          <SocialLoginButtons next={next} socialConflict={socialConflict} />
          <p className="text-muted-foreground text-center text-sm">
            계정이 없으신가요?{" "}
            <Link
              href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="text-foreground font-medium underline"
            >
              가입하기
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
