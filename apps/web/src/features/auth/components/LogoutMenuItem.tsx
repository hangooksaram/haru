"use client";

import { useRouter } from "next/navigation";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function LogoutMenuItem() {
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
    <DropdownMenuItem onClick={handleClick} disabled={logout.isPending}>
      로그아웃
    </DropdownMenuItem>
  );
}
