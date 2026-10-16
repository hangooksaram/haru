import { EmailAlreadyRegisteredError } from "@/features/auth/errors";
import { upsertUserProfile } from "@/features/auth/service/upsert-user-profile";
import { createServerClient } from "@/lib/supabase/server";

export async function signUp(email: string, password: string): Promise<void> {
  const supabase = await createServerClient();

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
