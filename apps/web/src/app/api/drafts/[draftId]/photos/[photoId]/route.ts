import { NextResponse } from "next/server";

import {
  DraftNotEditableError,
  DraftPhotoNotFoundError,
  InvalidPhotoFileError,
} from "@/features/draft/errors";
import { replaceDraftPhoto } from "@/features/draft/service/replace-draft-photo";

type Params = {
  params: Promise<{ draftId: string; photoId: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { photoId } = await params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "업로드할 파일이 없습니다." },
      { status: 400 },
    );
  }

  try {
    const photo = await replaceDraftPhoto(photoId, {
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      size: file.size,
    });

    return NextResponse.json(photo);
  } catch (error) {
    if (error instanceof DraftPhotoNotFoundError) {
      return NextResponse.json(
        { error: "사진을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    if (error instanceof DraftNotEditableError) {
      return NextResponse.json(
        { error: "더 이상 수정할 수 없는 시안입니다." },
        { status: 409 },
      );
    }
    if (error instanceof InvalidPhotoFileError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
