import { NextResponse } from "next/server";

import { TemplateNotFoundError } from "@/features/draft/errors";
import { createDraft } from "@/features/draft/service/create-draft";

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
    const draft = await createDraft(templateId);

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
