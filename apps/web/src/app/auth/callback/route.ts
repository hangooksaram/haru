import { NextResponse } from "next/server";

import { upsertUserProfile } from "@/features/auth/service/upsert-user-profile";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await upsertUserProfile(data.user.id, data.user.email);
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/signup?error=social`);
}
