import { NextResponse } from "next/server";

import {
  DraftForbiddenError,
  DraftNotEditableError,
  DraftPhotoNotFoundError,
} from "@/features/draft/errors";
import { confirmReplaceDraftPhoto } from "@/features/draft/service/replace-draft-photo";
import { createServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ draftId: string; photoId: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { photoId } = await params;
  const body = (await request.json()) as { path?: string };

  if (!body.path) {
    return NextResponse.json(
      { error: "확정할 사진이 없습니다." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();

    const photo = await confirmReplaceDraftPhoto(
      supabase,
      photoId,
      body.path,
      data.user?.id ?? null,
    );

    return NextResponse.json(photo);
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

    throw error;
  }
}
