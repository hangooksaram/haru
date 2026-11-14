import { NextResponse } from "next/server";

import { OrderForbiddenError, OrderNotFoundError } from "@/features/order/errors";
import {
  PaymentAmountMismatchError,
  TossPaymentConfirmError,
} from "@/features/payment/errors";
import { confirmPayment } from "@/features/payment/service/confirm-payment";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { paymentKey, orderId, amount } = body ?? {};

  if (
    typeof paymentKey !== "string" ||
    typeof orderId !== "string" ||
    typeof amount !== "number"
  ) {
    return NextResponse.json(
      { error: "paymentKey, orderId, amount가 필요합니다." },
      { status: 400 },
    );
  }

  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user || data.user.is_anonymous) {
    return NextResponse.json(
      { error: "인증 정보가 없습니다." },
      { status: 401 },
    );
  }

  try {
    await confirmPayment({
      orderId,
      paymentKey,
      amount,
      currentUserId: data.user.id,
    });

    return NextResponse.json({ orderId });
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (error instanceof OrderForbiddenError) {
      return NextResponse.json(
        { error: "본인 주문이 아닙니다." },
        { status: 403 },
      );
    }

    if (error instanceof PaymentAmountMismatchError) {
      return NextResponse.json(
        { error: "결제 금액이 일치하지 않습니다." },
        { status: 400 },
      );
    }

    if (error instanceof TossPaymentConfirmError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status },
      );
    }

    throw error;
  }
}
