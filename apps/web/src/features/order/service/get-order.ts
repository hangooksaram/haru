import { prisma } from "@haru/db";

import { assertOrderOwner } from "@/features/order/lib/assertOrderOwner";

type OrderSummary = {
  orderNumber: string;
  templateName: string;
  price: number;
};

export async function getOrder(
  orderId: string,
  currentUserId: string | null,
): Promise<OrderSummary | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { template: { select: { name: true } } },
  });

  if (!order) return null;

  assertOrderOwner(orderId, order.userId, currentUserId);

  return {
    orderNumber: order.orderNumber,
    templateName: order.template.name,
    price: order.price,
  };
}
