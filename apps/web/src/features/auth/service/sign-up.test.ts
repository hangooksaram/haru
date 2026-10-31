import { describe, expect, it, vi } from "vitest";

import { EmailAlreadyRegisteredError } from "@/features/auth/errors";

import { signUp } from "./sign-up";

const { getUser, signUpMock, updateUser, signInWithPassword } = vi.hoisted(
  () => ({
    getUser: vi.fn(),
    signUpMock: vi.fn(),
    updateUser: vi.fn(),
    signInWithPassword: vi.fn(),
  }),
);
const { upsertUserProfile } = vi.hoisted(() => ({
  upsertUserProfile: vi.fn(),
}));
const { migrateAnonymousDrafts } = vi.hoisted(() => ({
  migrateAnonymousDrafts: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    auth: {
      getUser,
      signUp: signUpMock,
      updateUser,
      signInWithPassword,
    },
  }),
}));
vi.mock("@/features/auth/service/upsert-user-profile", () => ({
  upsertUserProfile,
}));
vi.mock("@/features/auth/service/migrate-anonymous-drafts", () => ({
  migrateAnonymousDrafts,
}));

function mockNotAnonymous() {
  getUser.mockResolvedValue({ data: { user: null } });
}

function mockAnonymous(anonUserId: string) {
  getUser.mockResolvedValue({
    data: { user: { id: anonUserId, is_anonymous: true } },
  });
}

describe("signUp", () => {
  it("비로그인 상태에서 새 이메일로 가입하면 가입 성공 후 프로필을 생성한다", async () => {
    mockNotAnonymous();
    signUpMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "a@test.com" } },
      error: null,
    });

    await signUp("a@test.com", "password1!");

    expect(upsertUserProfile).toHaveBeenCalledWith("user-1", "a@test.com");
  });

  it("비로그인 상태에서 이미 가입된 이메일이면 EmailAlreadyRegisteredError를 던진다", async () => {
    mockNotAnonymous();
    signUpMock.mockResolvedValue({
      data: { user: null },
      error: { code: "user_already_exists" },
    });

    await expect(signUp("a@test.com", "password1!")).rejects.toThrow(
      EmailAlreadyRegisteredError,
    );
  });

  it("익명 유저가 새 이메일로 연결하면 같은 유저 id로 프로필을 갱신하고 draft를 이전하지 않는다", async () => {
    mockAnonymous("anon-1");
    updateUser.mockResolvedValue({
      data: { user: { id: "anon-1", email: "new@test.com" } },
      error: null,
    });

    await signUp("new@test.com", "password1!");

    expect(upsertUserProfile).toHaveBeenCalledWith("anon-1", "new@test.com");
    expect(migrateAnonymousDrafts).not.toHaveBeenCalled();
  });

  it("익명 유저가 이미 가입된 이메일로 연결하고 비밀번호가 맞으면 draft를 이전한다", async () => {
    mockAnonymous("anon-1");
    updateUser.mockResolvedValue({
      data: { user: null },
      error: { code: "email_exists" },
    });
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "real-1" } },
      error: null,
    });

    await signUp("existing@test.com", "password1!");

    expect(migrateAnonymousDrafts).toHaveBeenCalledWith("anon-1", "real-1");
  });

  it("익명 유저가 이미 가입된 이메일로 연결했는데 비밀번호가 틀리면 EmailAlreadyRegisteredError를 던지고 draft를 이전하지 않는다", async () => {
    mockAnonymous("anon-1");
    updateUser.mockResolvedValue({
      data: { user: null },
      error: { code: "email_exists" },
    });
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { code: "invalid_credentials" },
    });

    await expect(signUp("existing@test.com", "wrong-password")).rejects.toThrow(
      EmailAlreadyRegisteredError,
    );
    expect(migrateAnonymousDrafts).not.toHaveBeenCalled();
  });
});
