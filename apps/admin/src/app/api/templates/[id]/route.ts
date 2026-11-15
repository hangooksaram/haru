import { prisma, Prisma } from "@haru/db";

const SUMMARY_MAX_LENGTH = 40;
const SUMMARY_LANGUAGES = ["ko", "en"] as const;
type SummaryLanguage = (typeof SUMMARY_LANGUAGES)[number];
type Summary = Partial<Record<SummaryLanguage, string>>;

function isSummaryLanguage(value: string): value is SummaryLanguage {
  return (SUMMARY_LANGUAGES as readonly string[]).includes(value);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return Response.json(
      { success: false, message: "요청 본문이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const data: {
    price?: number | null;
    isActive?: boolean;
    summary?: Prisma.InputJsonValue | typeof Prisma.JsonNull;
  } = {};

  if ("price" in body) {
    if (body.price !== null && typeof body.price !== "number") {
      return Response.json(
        { success: false, message: "price는 숫자여야 합니다." },
        { status: 400 },
      );
    }
    data.price = body.price;
  }

  if ("isActive" in body) {
    if (typeof body.isActive !== "boolean") {
      return Response.json(
        { success: false, message: "isActive는 boolean이어야 합니다." },
        { status: 400 },
      );
    }
    data.isActive = body.isActive;
  }

  const template = await prisma.template.findUnique({
    where: { id },
    select: { isActive: true, summary: true },
  });

  if (!template) {
    return Response.json(
      { success: false, message: "템플릿을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  let mergedSummary: Summary = { ...(template.summary as Summary | null) };

  if ("summary" in body) {
    if (!body.summary || typeof body.summary !== "object") {
      return Response.json(
        { success: false, message: "summary 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    for (const [lang, text] of Object.entries(body.summary)) {
      if (!isSummaryLanguage(lang)) {
        return Response.json(
          { success: false, message: `지원하지 않는 언어입니다: ${lang}` },
          { status: 400 },
        );
      }
      if (typeof text !== "string") {
        return Response.json(
          { success: false, message: "소개 문구는 문자열이어야 합니다." },
          { status: 400 },
        );
      }
      if (text.length > SUMMARY_MAX_LENGTH) {
        return Response.json(
          {
            success: false,
            message: `소개 문구는 언어별 ${SUMMARY_MAX_LENGTH}자 이하로 입력해주세요.`,
          },
          { status: 400 },
        );
      }

      if (text === "") {
        delete mergedSummary[lang];
      } else {
        mergedSummary[lang] = text;
      }
    }

    data.summary =
      Object.keys(mergedSummary).length === 0
        ? Prisma.JsonNull
        : mergedSummary;
  }

  const finalIsActive = data.isActive ?? template.isActive;
  if (finalIsActive && (!mergedSummary.ko || !mergedSummary.en)) {
    return Response.json(
      {
        success: false,
        message: "공개하려면 ko, en 소개 문구가 모두 필요합니다.",
      },
      { status: 400 },
    );
  }

  try {
    await prisma.template.update({ where: { id }, data });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[템플릿 공개 관리] 업데이트 실패", error);
    return Response.json(
      { success: false, message: "업데이트 중 오류가 발생했습니다." },
      { status: 404 },
    );
  }
}
