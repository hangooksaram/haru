import { randomBytes } from "crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sanitizeNextPath } from "@/features/auth/lib/sanitizeNextPath";
import { getNaverAuthUrl } from "@/features/auth/service/naver-oauth";

const COOKIE_NAME = "naver_oauth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = sanitizeNextPath(searchParams.get("next"));
  const state = randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(
    getNaverAuthUrl(state, `${origin}/auth/callback/naver`),
  );
}
