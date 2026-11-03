import { NextResponse } from "next/server";

import { sanitizeNextPath } from "@/features/auth/lib/sanitizeNextPath";
import { mergeAnonymousAccount } from "@/features/auth/service/merge-anonymous-account";
import { upsertUserProfile } from "@/features/auth/service/upsert-user-profile";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createServerClient();

    const { data: currentUser } = await supabase.auth.getUser();
    const anonUserId = currentUser.user?.is_anonymous
      ? currentUser.user.id
      : null;

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await upsertUserProfile(data.user.id, data.user.email);

      if (anonUserId && anonUserId !== data.user.id) {
        await mergeAnonymousAccount(anonUserId, data.user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (searchParams.get("error_code") === "identity_already_exists") {
    const provider = searchParams.get("provider");
    const conflictParam = provider
      ? `&socialConflict=${encodeURIComponent(provider)}`
      : "";

    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent(next)}${conflictParam}`,
    );
  }

  return NextResponse.redirect(`${origin}/signup?error=social`);
}
