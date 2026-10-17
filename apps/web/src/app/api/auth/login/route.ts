import { NextResponse } from "next/server";

import { InvalidCredentialsError } from "@/features/auth/errors";
import { signIn } from "@/features/auth/service/sign-in";

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email;
  const password = body?.password;

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "email, password가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    await signIn(email, password);

    return NextResponse.json({});
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    throw error;
  }
}
