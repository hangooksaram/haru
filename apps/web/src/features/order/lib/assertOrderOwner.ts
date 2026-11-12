import { OrderForbiddenError } from "@/features/order/errors";

// 정책: 서버는 본인 주문이 아닌 유저의 조회 요청을 거부한다.
export function assertOrderOwner(
  orderId: string,
  orderUserId: string | null,
  currentUserId: string | null,
): void {
  if (orderUserId !== currentUserId) {
    throw new OrderForbiddenError(orderId);
  }
}
