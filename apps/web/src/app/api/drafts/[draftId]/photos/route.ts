import { NextResponse } from "next/server";

import {
  DraftForbiddenError,
  DraftNotEditableError,
  DraftNotFoundError,
} from "@/features/draft/errors";
import { confirmDraftPhotos } from "@/features/draft/service/add-draft-photos";
import { createServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ draftId: string }>;
};

type ConfirmItemInput = {
  path: string;
  label: string;
};

export async function POST(request: Request, { params }: Params) {
  const { draftId } = await params;
  const body = (await request.json()) as { items?: ConfirmItemInput[] };

  if (!body.items || body.items.length === 0) {
    return NextResponse.json(
      { error: "확정할 사진이 없습니다." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();

    const result = await confirmDraftPhotos(
      supabase,
      draftId,
      body.items,
      data.user?.id ?? null,
    );

    return NextResponse.json(result, { status: 201 });
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

    throw error;
  }
}
