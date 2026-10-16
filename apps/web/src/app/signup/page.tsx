import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-10 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <SignUpForm />
          <Separator />
          <SocialLoginButtons />
        </CardContent>
      </Card>
    </div>
  );
}
