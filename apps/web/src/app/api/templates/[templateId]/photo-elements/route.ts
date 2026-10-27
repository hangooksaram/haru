import { NextResponse } from "next/server";

import { TemplateNotFoundError } from "@/features/draft/errors";
import { getTemplatePhotoElements } from "@/features/template/service/get-template-photo-elements";

type Params = {
  params: Promise<{ templateId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { templateId } = await params;

  try {
    const labels = await getTemplatePhotoElements(templateId);

    return NextResponse.json(labels);
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
