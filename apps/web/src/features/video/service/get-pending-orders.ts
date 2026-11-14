import { prisma } from "@haru/db";

import type { PendingOrderVideo } from "@/features/video/types";

export async function getPendingOrders(
  userId: string,
): Promise<PendingOrderVideo[]> {
  const orders = await prisma.order.findMany({
    where: { userId, status: "pending_payment" },
    orderBy: { updatedAt: "desc" },
    include: { template: { select: { name: true } } },
  });

  return orders.map((order) => ({
    id: order.id,
    templateId: order.templateId,
    templateName: order.template.name,
    updatedAt: order.updatedAt,
  }));
}
