"use server";

import {
  OrderForbiddenError,
  OrderNotFoundError,
} from "@/features/order/errors";
import { createServerClient } from "@/lib/supabase/server";

import { PaymentAmountMismatchError, TossPaymentConfirmError } from "../errors";
import { finalizePayment } from "../service/finalize-payment";

const UNAUTHENTICATED_MESSAGE = "로그인이 필요합니다.";
// 주문이 없는 경우와 본인 주문이 아닌 경우를 구분하면 주문 존재 여부가 노출되므로 같은 문구를 쓴다.
const ORDER_NOT_AVAILABLE_MESSAGE = "결제할 주문을 찾을 수 없습니다.";
const AMOUNT_MISMATCH_MESSAGE = "결제 금액이 주문 금액과 일치하지 않습니다.";

type FinalizePaymentInput = {
  orderId: string;
  paymentKey: string;
  amount: number;
};

type FinalizePaymentResult =
  { ok: true; orderId: string } | { ok: false; message: string };

export async function finalizePaymentAction(
  input: FinalizePaymentInput,
): Promise<FinalizePaymentResult> {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user || data.user.is_anonymous) {
    return { ok: false, message: UNAUTHENTICATED_MESSAGE };
  }

  try {
    await finalizePayment({ ...input, currentUserId: data.user.id });

    return { ok: true, orderId: input.orderId };
  } catch (error) {
    // 토스 승인 에러만 토스 메시지를 그대로 보여준다.
    if (error instanceof TossPaymentConfirmError) {
      return { ok: false, message: error.message };
    }

    if (
      error instanceof OrderNotFoundError ||
      error instanceof OrderForbiddenError
    ) {
      return { ok: false, message: ORDER_NOT_AVAILABLE_MESSAGE };
    }

    if (error instanceof PaymentAmountMismatchError) {
      return { ok: false, message: AMOUNT_MISMATCH_MESSAGE };
    }

    throw error;
  }
}
