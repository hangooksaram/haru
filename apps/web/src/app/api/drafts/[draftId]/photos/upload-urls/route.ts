import { NextResponse } from "next/server";

import {
  DraftForbiddenError,
  DraftNotEditableError,
  DraftNotFoundError,
  InvalidPhotoFileError,
} from "@/features/draft/errors";
import { createDraftPhotoUploadUrls } from "@/features/draft/service/add-draft-photos";
import { createServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ draftId: string }>;
};

type FileMetaInput = {
  contentType: string;
  size: number;
};

export async function POST(request: Request, { params }: Params) {
  const { draftId } = await params;
  const body = (await request.json()) as {
    label?: string;
    files?: FileMetaInput[];
  };

  if (!body.files || body.files.length === 0) {
    return NextResponse.json(
      { error: "업로드할 파일이 없습니다." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();

    const result = await createDraftPhotoUploadUrls(
      supabase,
      draftId,
      body.files,
      data.user?.id ?? null,
      typeof body.label === "string" ? body.label : undefined,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof DraftNotFoundError ||
      error instanceof DraftForbiddenError
    ) {
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
