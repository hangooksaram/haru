import { prisma } from "@haru/db";

// 디버깅용: 템플릿·사용자는 유지하고 시안/주문 관련 데이터만 FK 순서대로 모두 삭제한다.
export async function resetOrderDraftData() {
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.orderPhoto.deleteMany(),
    prisma.order.deleteMany(),
    prisma.draftPhoto.deleteMany(),
    prisma.draft.deleteMany(),
  ]);
}
