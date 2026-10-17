import { NextResponse } from "next/server";

import { signOut } from "@/features/auth/service/sign-out";

export async function POST() {
  await signOut();

  return NextResponse.json({});
}
