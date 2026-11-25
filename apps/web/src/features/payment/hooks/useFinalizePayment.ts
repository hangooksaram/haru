"use client";

import { useMutation } from "@tanstack/react-query";

import { finalizePaymentAction } from "../actions/finalize-payment-action";

const DEFAULT_ERROR_MESSAGE = "결제를 확인할 수 없습니다.";

type FinalizePaymentVariables = {
  orderId: string;
  paymentKey: string;
  amount: number;
};

export function useFinalizePayment() {
  return useMutation({
    mutationFn: async (variables: FinalizePaymentVariables) => {
      // 알 수 없는 서버 에러는 액션에서 throw되어 Next.js가 일반 메시지로 내려보내므로,
      // 화면에는 기본 메시지를 보여준다.
      const result = await finalizePaymentAction(variables).catch(() => {
        throw new Error(DEFAULT_ERROR_MESSAGE);
      });

      if (!result.ok) throw new Error(result.message);

      return result;
    },
  });
}
