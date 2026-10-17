import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { createServerClient } from "@/lib/supabase/server";

export async function ProfileBadge() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login">로그인</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{data.user.email}</span>
      <LogoutButton />
    </div>
  );
}
