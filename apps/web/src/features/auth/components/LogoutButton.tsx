"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();

  function handleClick() {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
        router.refresh();
      },
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={logout.isPending}
    >
      로그아웃
    </Button>
  );
}
