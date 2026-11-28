"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { sanitizeNextPath } from "@/features/auth/lib/sanitizeNextPath";

type Props = {
  next?: string;
};

export function LoginForm({ next }: Props) {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => router.push(sanitizeNextPath(next)) },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-muted-foreground text-sm font-medium">
          이메일
        </label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 rounded-xl px-4 text-base"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-muted-foreground text-sm font-medium">
          비밀번호
        </label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-12 rounded-xl px-4 text-base"
        />
      </div>
      {login.isError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {login.error instanceof Error
            ? login.error.message
            : "로그인에 실패했습니다."}
        </p>
      )}
      <Button
        type="submit"
        disabled={login.isPending}
        className="h-12 w-full rounded-xl text-base font-semibold"
      >
        로그인
      </Button>
    </form>
  );
}
