import { NextResponse } from "next/server";

import { DraftForbiddenError } from "@/features/draft/errors";
import { getDraft } from "@/features/draft/service/get-draft";
import { createServerClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ draftId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { draftId } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  try {
    const draft = await getDraft(draftId, data.user?.id ?? null);

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
        { error: "이 시안에 접근할 권한이 없습니다." },
        { status: 403 },
      );
    }

    throw error;
  }
}
