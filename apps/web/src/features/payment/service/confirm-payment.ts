import { Prisma, prisma } from "@haru/db";

import { OrderNotFoundError } from "@/features/order/errors";
import { assertOrderOwner } from "@/features/order/lib/assertOrderOwner";

import { PaymentAmountMismatchError, TossPaymentConfirmError } from "../errors";

const TOSS_PAYMENTS_CONFIRM_URL =
  "https://api.tosspayments.com/v1/payments/confirm";

function buildTossAuthHeader(): string {
  const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY!;
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

type ConfirmPaymentParams = {
  orderId: string;
  paymentKey: string;
  amount: number;
  currentUserId: string | null;
};

export async function confirmPayment({
  orderId,
  paymentKey,
  amount,
  currentUserId,
}: ConfirmPaymentParams): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new OrderNotFoundError(orderId);
  assertOrderOwner(orderId, order.userId, currentUserId);

  // 정책: 같은 주문의 승인이 다시 요청돼도 시안 삭제를 한 번만 반영한다.
  // 이미 승인 처리된 주문이면 토스 승인 API를 다시 호출하지 않고,
  // 시안 소프트삭제가 아직 안 됐으면(이전 시도 실패 등) 그때 다시 시도한다.
  if (order.status === "paid") {
    await softDeleteDraft(order.draftId);
    return;
  }

  // 정책: 승인 요청의 amount가 저장된 주문 금액과 다르면 승인을 거부한다.
  if (order.price !== amount) {
    throw new PaymentAmountMismatchError(orderId);
  }

  const tossResponse = await fetch(TOSS_PAYMENTS_CONFIRM_URL, {
    method: "POST",
    headers: {
      Authorization: buildTossAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const tossResult = await tossResponse.json();

  if (!tossResponse.ok) {
    throw new TossPaymentConfirmError(
      tossResponse.status,
      tossResult.code,
      tossResult.message,
    );
  }

  // 결제 확정 사실(payments, orders.status)은 반드시 기록되어야 하므로 시안
  // 소프트삭제와 분리된 트랜잭션으로 처리한다. 소프트삭제가 실패해도 결제 확정
  // 자체는 실패시키지 않는다 (아래 softDeleteDraft에서 best-effort로 재시도).
  try {
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          orderId,
          amount,
          status: "paid",
          pgProvider: "tosspayments",
          pgTransactionId: paymentKey,
          paidAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "paid" },
      }),
    ]);
  } catch (error) {
    // 동시에 들어온 재요청이 먼저 커밋된 경우(payments.order_id unique 위반)로,
    // 이미 반영된 것이므로 멱등하게 무시한다.
    const isAlreadyConfirmed =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002";

    if (!isAlreadyConfirmed) throw error;
  }

  await softDeleteDraft(order.draftId);
}

// 정책: 승인에 성공하면 해당 주문의 시안을 소프트 삭제한다. (주문:시안 = 1:1)
// best-effort: 결제 확정과 분리되어 있으므로 실패해도 삼키고, 다음 확인 요청에서
// deletedAt이 비어 있으면 다시 시도된다.
async function softDeleteDraft(draftId: string): Promise<void> {
  try {
    const result = await prisma.draft.updateMany({
      where: { id: draftId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count === 0) {
      console.error(
        "[confirmPayment] draft soft-delete matched 0 rows",
        draftId,
      );
    }
  } catch (error) {
    console.error("[confirmPayment] draft soft-delete failed", draftId, error);
  }
}
