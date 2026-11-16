import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { NaverEmailConflictError } from "@/features/auth/errors";
import { sanitizeNextPath } from "@/features/auth/lib/sanitizeNextPath";
import {
  exchangeNaverCode,
  fetchNaverProfile,
} from "@/features/auth/service/naver-oauth";
import { signInWithNaver } from "@/features/auth/service/sign-in-with-naver";

const COOKIE_NAME = "naver_oauth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const cookieStore = await cookies();
  const saved = cookieStore.get(COOKIE_NAME)?.value;
  cookieStore.delete(COOKIE_NAME);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  let next = "/";

  try {
    if (!saved) throw new Error("state 쿠키가 없습니다.");

    const parsed = JSON.parse(saved) as { state: string; next: string };
    next = sanitizeNextPath(parsed.next);

    if (!code || !state || state !== parsed.state) {
      throw new Error("state가 일치하지 않습니다.");
    }

    const accessToken = await exchangeNaverCode(code, state);
    const profile = await fetchNaverProfile(accessToken);
    await signInWithNaver(profile);

    return NextResponse.redirect(`${origin}${next}`);
  } catch (error) {
    console.error("네이버 로그인 실패:", error);

    const errorCode =
      error instanceof NaverEmailConflictError ? "naver_email_conflict" : "social";

    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent(next)}&error=${errorCode}`,
    );
  }
}
