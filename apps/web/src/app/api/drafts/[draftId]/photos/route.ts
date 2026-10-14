import { NextResponse } from "next/server";

import {
  DraftNotEditableError,
  DraftNotFoundError,
  InvalidPhotoFileError,
} from "@/features/draft/errors";
import { addDraftPhotos } from "@/features/draft/service/add-draft-photos";

type Params = {
  params: Promise<{ draftId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { draftId } = await params;
  const formData = await request.formData();
  const fileEntries = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);

  if (fileEntries.length === 0) {
    return NextResponse.json(
      { error: "업로드할 파일이 없습니다." },
      { status: 400 },
    );
  }

  const files = await Promise.all(
    fileEntries.map(async (file) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      size: file.size,
    })),
  );

  try {
    const result = await addDraftPhotos(draftId, files);

    return NextResponse.json(result, { status: 201 });
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
    if (error instanceof InvalidPhotoFileError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
