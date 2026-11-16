"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function LogoutMenuItem() {
  const logout = useLogout();

  async function handleSelect() {
    try {
      await logout.mutateAsync();
      window.location.href = "/";
    } catch (error) {
      alert(
        `로그아웃에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return (
    <DropdownMenuItem onSelect={handleSelect} disabled={logout.isPending}>
      로그아웃
    </DropdownMenuItem>
  );
}
