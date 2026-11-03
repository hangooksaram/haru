import { describe, expect, it, vi } from "vitest";

import { InvalidCredentialsError } from "@/features/auth/errors";

import { signIn } from "./sign-in";

const { getUser, signInWithPassword } = vi.hoisted(() => ({
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
}));
const { mergeAnonymousAccount } = vi.hoisted(() => ({
  mergeAnonymousAccount: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    auth: { getUser, signInWithPassword },
  }),
}));
vi.mock("@/features/auth/service/merge-anonymous-account", () => ({
  mergeAnonymousAccount,
}));

function mockNotAnonymous() {
  getUser.mockResolvedValue({ data: { user: null } });
}

function mockAnonymous(anonUserId: string) {
  getUser.mockResolvedValue({
    data: { user: { id: anonUserId, is_anonymous: true } },
  });
}

describe("signIn", () => {
  it("비로그인 상태에서 로그인에 성공하면 draft를 이전하지 않는다", async () => {
    mockNotAnonymous();
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    await signIn("a@test.com", "password1!");

    expect(mergeAnonymousAccount).not.toHaveBeenCalled();
  });

  it("비로그인 상태에서 로그인에 실패하면 InvalidCredentialsError를 던진다", async () => {
    mockNotAnonymous();
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { code: "invalid_credentials" },
    });

    await expect(signIn("a@test.com", "wrong")).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(mergeAnonymousAccount).not.toHaveBeenCalled();
  });

  it("익명 유저가 기존 계정으로 로그인에 성공하면 draft를 이전한다", async () => {
    mockAnonymous("anon-1");
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "real-1" } },
      error: null,
    });

    await signIn("existing@test.com", "password1!");

    expect(mergeAnonymousAccount).toHaveBeenCalledWith("anon-1", "real-1");
  });

  it("익명 유저가 로그인에 실패하면 draft를 이전하지 않는다", async () => {
    mockAnonymous("anon-1");
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { code: "invalid_credentials" },
    });

    await expect(signIn("existing@test.com", "wrong")).rejects.toThrow(
      InvalidCredentialsError,
    );
    expect(mergeAnonymousAccount).not.toHaveBeenCalled();
  });
});
