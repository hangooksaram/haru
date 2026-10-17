import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-10 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>로그인</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <LoginForm />
          <Separator />
          <SocialLoginButtons />
        </CardContent>
      </Card>
    </div>
  );
}
