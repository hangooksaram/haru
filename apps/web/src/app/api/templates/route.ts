import { NextResponse } from "next/server";

import { resolveTemplateLang } from "@/features/template/lib/resolveTemplateLang";
import { resolveTemplateSummary } from "@/features/template/lib/resolveTemplateSummary";
import { getPublicTemplates } from "@/features/template/service/get-public-templates";

import type { TemplateDetail } from "@/features/template/types";

// 시안 스텝의 템플릿 변경 목록에 쓸, 공개 처리된 템플릿 목록을 반환한다. summary는 요청 언어로 골라서 내려준다.
export async function GET(request: Request) {
  const lang = resolveTemplateLang(
    new URL(request.url).searchParams.get("lang"),
  );
  const templates = await getPublicTemplates();
  const response: TemplateDetail[] = templates.map((template) => ({
    ...template,
    summary: resolveTemplateSummary(template.summary, lang),
  }));

  return NextResponse.json(response);
}
