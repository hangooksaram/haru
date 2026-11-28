import { NextResponse } from "next/server";

import { DraftForbiddenError } from "@/features/draft/errors";
import { isDraftStep } from "@/features/draft/lib/isDraftStep";
import { deleteDraft } from "@/features/draft/service/delete-draft";
import { getDraft } from "@/features/draft/service/get-draft";
import { updateDraftLastStep } from "@/features/draft/service/update-draft-last-step";
import { createServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ draftId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { draftId } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  try {
    const draft = await getDraft(supabase, draftId, data.user?.id ?? null);

    if (!draft) {
      return NextResponse.json(
        { error: "시안을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(draft);
  } catch (error) {
    if (error instanceof DraftForbiddenError) {
      return NextResponse.json(
        { error: "시안을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    throw error;
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { draftId } = await params;
  const body = await request.json();
  const lastStep = body?.lastStep;

  if (!isDraftStep(lastStep)) {
    return NextResponse.json(
      { error: "lastStep이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  try {
    const updated = await updateDraftLastStep(
      draftId,
      data.user?.id ?? null,
      lastStep,
    );

    if (!updated) {
      return NextResponse.json(
        { error: "시안을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof DraftForbiddenError) {
      return NextResponse.json(
        { error: "시안을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { draftId } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  try {
    const deleted = await deleteDraft(supabase, draftId, data.user?.id ?? null);

    if (!deleted) {
      return NextResponse.json(
        { error: "시안을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof DraftForbiddenError) {
      return NextResponse.json(
        { error: "시안을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    throw error;
  }
}
