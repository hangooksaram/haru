export type OrderCreationAction = "reuse" | "create";

// 정책(주문 생성):
// - 시안에 연결된 대기(pending_payment) 주문이 있으면 그 주문을 재사용한다. (복사본과 금액은 덮어쓴다)
// - 연결된 대기 주문이 없으면 새 주문을 만든다.
export function decideOrderCreationAction(
  existingOrderStatus: string | null,
): OrderCreationAction {
  return existingOrderStatus === "pending_payment" ? "reuse" : "create";
}
