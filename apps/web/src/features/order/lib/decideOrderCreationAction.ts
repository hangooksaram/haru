export type OrderCreationAction = "reuse" | "cancel_and_create" | "create";

// 정책(주문 생성):
// - 시안이 converted이고 연결된 주문이 대기(pending_payment)면 그 주문을 재사용한다.
// - 시안이 editing으로 돌아온 뒤면 기존 대기 주문을 취소하고 새 주문을 만든다.
// - 연결된 주문이 대기가 아니면(결제완료 등) 새 주문을 만든다.
export function decideOrderCreationAction(
  draftStatus: "editing" | "converted",
  existingOrderStatus: string | null,
): OrderCreationAction {
  if (existingOrderStatus !== "pending_payment") return "create";

  return draftStatus === "converted" ? "reuse" : "cancel_and_create";
}
