import { EmailAlreadyRegisteredError } from "@/features/auth/errors";
import { migrateAnonymousDrafts } from "@/features/auth/service/migrate-anonymous-drafts";
import { upsertUserProfile } from "@/features/auth/service/upsert-user-profile";
import { createServerClient } from "@/lib/supabase/server";

export async function signUp(email: string, password: string): Promise<void> {
  const supabase = await createServerClient();

  const { data: currentUser } = await supabase.auth.getUser();
  const anonUserId = currentUser.user?.is_anonymous
    ? currentUser.user.id
    : null;

  if (anonUserId) {
    await linkAnonymousAccount(supabase, anonUserId, email, password);
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.code === "user_already_exists") {
      throw new EmailAlreadyRegisteredError();
    }
    throw error;
  }

  if (!data.user) throw new Error("가입에 실패했습니다.");

  await upsertUserProfile(data.user.id, data.user.email);
}

async function linkAnonymousAccount(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  anonUserId: string,
  email: string,
  password: string,
): Promise<void> {
  const { data, error } = await supabase.auth.updateUser({
    email,
    password,
  });

  if (!error) {
    if (!data.user) throw new Error("계정 연결에 실패했습니다.");
    await upsertUserProfile(data.user.id, data.user.email);
    return;
  }

  if (error.code !== "email_exists") throw error;

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError || !signInData.user) {
    throw new EmailAlreadyRegisteredError();
  }

  await migrateAnonymousDrafts(anonUserId, signInData.user.id);
}
