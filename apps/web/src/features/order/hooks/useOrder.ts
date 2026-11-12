"use client";

import { useQuery } from "@tanstack/react-query";

import { OrderForbiddenError } from "@/features/order/errors";

type OrderSummary = {
  orderNumber: string;
  templateName: string;
  price: number;
};

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async (): Promise<OrderSummary> => {
      const response = await fetch(`/api/orders/${orderId}`);

      if (response.status === 403) {
        throw new OrderForbiddenError(orderId ?? "");
      }
      if (!response.ok) throw new Error("주문을 불러오지 못했습니다.");

      const data = await response.json();

      return {
        orderNumber: data.order_number,
        templateName: data.template_name,
        price: data.price,
      };
    },
    enabled: orderId !== null,
  });
}
