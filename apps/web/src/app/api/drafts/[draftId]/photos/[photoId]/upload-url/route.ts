import { NextResponse } from "next/server";

import {
  DraftForbiddenError,
  DraftNotEditableError,
  DraftPhotoNotFoundError,
  InvalidPhotoFileError,
} from "@/features/draft/errors";
import { createReplaceDraftPhotoUploadUrl } from "@/features/draft/service/replace-draft-photo";
import { createServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ draftId: string; photoId: string }>;
};

type FileMetaInput = {
  contentType: string;
  size: number;
};

export async function POST(request: Request, { params }: Params) {
  const { photoId } = await params;
  const body = (await request.json()) as FileMetaInput;

  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();

    const result = await createReplaceDraftPhotoUploadUrl(
      supabase,
      photoId,
      body,
      data.user?.id ?? null,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof DraftPhotoNotFoundError ||
      error instanceof DraftForbiddenError
    ) {
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
