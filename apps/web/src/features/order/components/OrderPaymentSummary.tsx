"use client";

import { useOrder } from "@/features/order/hooks/useOrder";

type Props = {
  orderId: string;
};

export function OrderPaymentSummary({ orderId }: Props) {
  const { data: order, isLoading, isError } = useOrder(orderId);

  if (isLoading) {
    return <p className="text-muted-foreground">불러오는 중...</p>;
  }

  if (isError || !order) {
    return (
      <p className="text-sm font-medium text-amber-600">
        주문 정보를 불러오지 못했습니다.
      </p>
    );
  }

  return (
    <div className="text-muted-foreground flex flex-col gap-1 text-sm">
      <p>주문번호 {order.orderNumber}</p>
      <p>{order.templateName}</p>
      <p>{order.price.toLocaleString("ko-KR")}원</p>
    </div>
  );
}
