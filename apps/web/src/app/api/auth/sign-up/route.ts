import { NextResponse } from "next/server";

import { EmailAlreadyRegisteredError } from "@/features/auth/errors";
import { signUp } from "@/features/auth/service/sign-up";

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
    await signUp(email, password);

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다." },
        { status: 409 },
      );
    }

    throw error;
  }
}
