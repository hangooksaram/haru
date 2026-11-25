// 정책: 서버는 결제완료(paid) 주문에 대해서만 영상 제작을 시작한다.
export function canStartVideoRender(orderStatus: string): boolean {
  return orderStatus === "paid";
}
