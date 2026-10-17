import { InvalidCredentialsError } from "@/features/auth/errors";
import { createServerClient } from "@/lib/supabase/server";

export async function signIn(email: string, password: string): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.code === "invalid_credentials") {
      throw new InvalidCredentialsError();
    }
    throw error;
  }
}
