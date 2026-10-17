import { createServerClient } from "@/lib/supabase/server";

export async function signOut(): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}
