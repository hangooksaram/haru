import { NextResponse } from "next/server";

import { TemplateNotFoundError } from "@/features/draft/errors";
import { createDraft } from "@/features/draft/service/create-draft";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const templateId = body?.templateId;

  if (typeof templateId !== "string" || templateId.length === 0) {
    return NextResponse.json(
      { error: "templateId가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();
    const draft = await createDraft(templateId, data.user?.id ?? null);

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    if (error instanceof TemplateNotFoundError) {
      return NextResponse.json(
        { error: "템플릿을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    throw error;
  }
}
