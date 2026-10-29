import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { SocialLoginButtons } from "@/features/auth/components/SocialLoginButtons";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-10 px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <SignUpForm next={next} />
          <Separator />
          <SocialLoginButtons next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
