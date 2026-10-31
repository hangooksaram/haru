import { InvalidCredentialsError } from "@/features/auth/errors";
import { migrateAnonymousDrafts } from "@/features/auth/service/migrate-anonymous-drafts";
import { createServerClient } from "@/lib/supabase/server";

export async function signIn(email: string, password: string): Promise<void> {
  const supabase = await createServerClient();

  const { data: currentUser } = await supabase.auth.getUser();
  const anonUserId = currentUser.user?.is_anonymous
    ? currentUser.user.id
    : null;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.code === "invalid_credentials") {
      throw new InvalidCredentialsError();
    }
    throw error;
  }

  if (anonUserId) {
    await migrateAnonymousDrafts(anonUserId, data.user.id);
  }
}
