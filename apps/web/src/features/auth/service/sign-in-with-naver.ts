import { prisma } from "@haru/db";

import { NaverEmailConflictError } from "@/features/auth/errors";
import { mergeAnonymousAccount } from "@/features/auth/service/merge-anonymous-account";
import { upsertUserProfile } from "@/features/auth/service/upsert-user-profile";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase/server";
import type { NaverProfile } from "@/features/auth/service/naver-oauth";

type SupabaseAdminClient = ReturnType<typeof getSupabaseAdminClient>;
type SupabaseServerClient = Awaited<ReturnType<typeof createServerClient>>;

function getNaverId(userMetadata: unknown): string | undefined {
  if (typeof userMetadata !== "object" || userMetadata === null) {
    return undefined;
  }

  const { naverId } = userMetadata as Record<string, unknown>;
  return typeof naverId === "string" ? naverId : undefined;
}

async function findOrCreateNaverUser(
  admin: SupabaseAdminClient,
  profile: NaverProfile & { email: string },
): Promise<string> {
  const existingProfile = await prisma.user.findFirst({
    where: { email: profile.email },
  });
  const existingUser = existingProfile
    ? (await admin.auth.admin.getUserById(existingProfile.id)).data.user
    : null;

  if (existingUser) {
    if (getNaverId(existingUser.user_metadata) !== profile.id) {
      throw new NaverEmailConflictError();
    }

    return existingUser.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: profile.email,
    email_confirm: true,
    user_metadata: {
      naverId: profile.id,
      name: profile.name,
      picture: profile.profileImage,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error("네이버 계정 생성에 실패했습니다.");
  }

  await upsertUserProfile(data.user.id, profile.email);
  return data.user.id;
}

async function issueSessionForEmail(
  admin: SupabaseAdminClient,
  supabase: SupabaseServerClient,
  email: string,
): Promise<void> {
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({ type: "magiclink", email });

  if (linkError || !linkData.properties) {
    throw linkError ?? new Error("로그인 세션 발급에 실패했습니다.");
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
  });

  if (verifyError) {
    throw verifyError;
  }
}

export async function signInWithNaver(profile: NaverProfile): Promise<void> {
  if (!profile.email) {
    throw new Error("네이버 계정에 이메일 동의가 필요합니다.");
  }

  const supabase = await createServerClient();
  const { data: currentUser } = await supabase.auth.getUser();
  const anonUserId = currentUser.user?.is_anonymous
    ? currentUser.user.id
    : null;

  const admin = getSupabaseAdminClient();
  const userId = await findOrCreateNaverUser(admin, {
    ...profile,
    email: profile.email,
  });

  await issueSessionForEmail(admin, supabase, profile.email);

  if (anonUserId && anonUserId !== userId) {
    await mergeAnonymousAccount(anonUserId, userId);
  }
}
