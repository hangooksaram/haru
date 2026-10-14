import { NextResponse } from "next/server";

import {
  DraftNotEditableError,
  DraftNotFoundError,
  InvalidPhotoOrderError,
} from "@/features/draft/errors";
import { reorderDraftPhotos } from "@/features/draft/service/reorder-draft-photos";

type Params = {
  params: Promise<{ draftId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const { draftId } = await params;
  const body = await request.json();
  const photoIds = body?.photoIds;

  if (
    !Array.isArray(photoIds) ||
    photoIds.some((id) => typeof id !== "string")
  ) {
    return NextResponse.json(
      { error: "photoIds가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    await reorderDraftPhotos(draftId, photoIds);

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
    if (error instanceof InvalidPhotoOrderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
