import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutMenuItem } from "@/features/auth/components/LogoutMenuItem";
import { createServerClient } from "@/lib/supabase/server";

function getAvatarUrl(userMetadata: unknown): string | undefined {
  if (typeof userMetadata !== "object" || userMetadata === null) {
    return undefined;
  }

  const { avatar_url, picture } = userMetadata as Record<string, unknown>;

  if (typeof avatar_url === "string") return avatar_url;
  if (typeof picture === "string") return picture;
  return undefined;
}

export async function ProfileBadge() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user || data.user.is_anonymous) {
    return (
      <Button asChild variant="outline" size="sm" className="text-foreground">
        <Link href="/login">로그인</Link>
      </Button>
    );
  }

  const avatarUrl = getAvatarUrl(data.user.user_metadata);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-ring/50 cursor-pointer rounded-full outline-none focus-visible:ring-3">
        <Avatar size="lg">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="프로필 사진" /> : null}
          <AvatarFallback>
            <Image src="/icon.svg" alt="프로필" width={24} height={24} />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-muted-foreground truncate">
          {data.user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my-videos">내 영상</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <LogoutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
