import { NextResponse } from "next/server";

import { TemplateNotFoundError } from "@/features/draft/errors";
import { getTemplateTextElements } from "@/features/template/service/get-template-text-elements";

type Params = {
  params: Promise<{ templateId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { templateId } = await params;

  try {
    const elements = await getTemplateTextElements(templateId);

    return NextResponse.json(elements);
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
