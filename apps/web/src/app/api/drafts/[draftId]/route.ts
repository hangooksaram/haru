import { NextResponse } from "next/server";

import { getDraft } from "@/features/draft/service/get-draft";

type Params = {
  params: Promise<{ draftId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { draftId } = await params;
  const draft = await getDraft(draftId);

  if (!draft) {
    return NextResponse.json(
      { error: "시안을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json(draft);
}
