import { NextResponse } from "next/server";

import { TemplateNotFoundError } from "@/features/draft/errors";
import { resolveTemplateLang } from "@/features/template/lib/resolveTemplateLang";
import { getPublicTemplate } from "@/features/template/service/get-public-template";

type Params = {
  params: Promise<{ templateId: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { templateId } = await params;
  const lang = resolveTemplateLang(
    new URL(request.url).searchParams.get("lang"),
  );

  try {
    const template = await getPublicTemplate(templateId, lang);

    return NextResponse.json(template);
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
