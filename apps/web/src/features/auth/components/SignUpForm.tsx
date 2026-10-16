"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@/features/auth/hooks/useSignUp";

export function SignUpForm() {
  const router = useRouter();
  const signUp = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    signUp.mutate({ email, password }, { onSuccess: () => router.push("/") });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          이메일
        </label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          비밀번호
        </label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {signUp.isError && (
        <p className="text-sm font-medium text-destructive">
          {signUp.error instanceof Error
            ? signUp.error.message
            : "가입에 실패했습니다."}
        </p>
      )}
      <Button type="submit" disabled={signUp.isPending}>
        가입하기
      </Button>
    </form>
  );
}
