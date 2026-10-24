import { NextResponse } from "next/server";

import {
  DraftForbiddenError,
  DraftNotEditableError,
  DraftNotFoundError,
  InvalidDraftTextError,
} from "@/features/draft/errors";
import { updateDraftTexts } from "@/features/draft/service/update-draft-texts";
import { createServerClient } from "@/lib/supabase/server";

import type { DraftTextInput } from "@/features/draft/types";

type Params = {
  params: Promise<{ draftId: string }>;
};

function isValidTextsPayload(texts: unknown): texts is DraftTextInput[] {
  if (!Array.isArray(texts)) return false;

  return texts.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { type?: unknown }).type === "string" &&
      typeof (item as { name?: unknown }).name === "string" &&
      typeof (item as { text?: unknown }).text === "string",
  );
}

export async function PUT(request: Request, { params }: Params) {
  const { draftId } = await params;
  const body = await request.json();
  const texts = body?.texts;

  if (!isValidTextsPayload(texts)) {
    return NextResponse.json(
      { error: "texts가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (texts.some((item) => /[\r\n]/.test(item.text))) {
    return NextResponse.json(
      { error: "text에 줄바꿈을 포함할 수 없습니다." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();

    await updateDraftTexts(draftId, texts, data.user?.id ?? null);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof DraftNotFoundError) {
      return NextResponse.json(
        { error: "시안을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    if (error instanceof DraftForbiddenError) {
      return NextResponse.json(
        { error: "이 시안에 접근할 권한이 없습니다." },
        { status: 403 },
      );
    }
    if (error instanceof DraftNotEditableError) {
      return NextResponse.json(
        { error: "더 이상 수정할 수 없는 시안입니다." },
        { status: 409 },
      );
    }
    if (error instanceof InvalidDraftTextError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }
}
