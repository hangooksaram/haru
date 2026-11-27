import { resetOrderDraftData } from "@/features/debug/service/reset-order-draft-data";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { success: false, message: "운영 환경에서는 사용할 수 없습니다." },
      { status: 403 },
    );
  }

  try {
    await resetOrderDraftData();
    return Response.json({ success: true });
  } catch {
    return Response.json(
      { success: false, message: "데이터 삭제 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
