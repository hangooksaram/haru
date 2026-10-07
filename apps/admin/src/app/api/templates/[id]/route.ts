import { prisma } from "@haru/db";

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

  const data: { price?: number | null; isActive?: boolean } = {};

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
