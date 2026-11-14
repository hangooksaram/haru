import { prisma } from "@haru/db";

import type { PurchasedOrderVideo } from "@/features/video/types";

export async function getPurchasedOrders(
  userId: string,
): Promise<PurchasedOrderVideo[]> {
  const orders = await prisma.order.findMany({
    where: { userId, status: "paid" },
    orderBy: { payment: { paidAt: "desc" } },
    include: { template: { select: { name: true } }, payment: true },
  });

  return orders.map((order) => ({
    id: order.id,
    templateId: order.templateId,
    templateName: order.template.name,
    // 결제 확정은 payments 행 생성과 같은 트랜잭션에서 이뤄지므로 paid 주문엔 항상 결제 기록이 있다.
    purchasedAt: order.payment?.paidAt ?? order.updatedAt,
    renderStatus: order.renderStatus,
    finalVideoUrl: order.finalVideoUrl,
  }));
}
