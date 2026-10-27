import { NextResponse } from "next/server";

import {
  DraftNotEditableError,
  DraftNotFoundError,
  InvalidPhotoSwapError,
} from "@/features/draft/errors";
import { swapDraftPhotos } from "@/features/draft/service/swap-draft-photos";

type Params = {
  params: Promise<{ draftId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { draftId } = await params;
  const body = await request.json();
  const { from, to } = body ?? {};

  if (typeof from !== "string" || typeof to !== "string") {
    return NextResponse.json(
      { error: "from, to가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    await swapDraftPhotos(draftId, from, to);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof DraftNotFoundError) {
      return NextResponse.json(
        { error: "시안을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    if (error instanceof DraftNotEditableError) {
      return NextResponse.json(
        { error: "더 이상 수정할 수 없는 시안입니다." },
        { status: 409 },
      );
    }
    if (error instanceof InvalidPhotoSwapError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
