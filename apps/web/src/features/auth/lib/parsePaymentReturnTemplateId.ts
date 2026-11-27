const PAYMENT_PATH = /^\/draft\/([^/?#]+)\/payment(?:[?#]|$)/;

// 로그인 후 돌아갈 경로(next)가 결제 스텝이면 그 템플릿 id를, 아니면 null을 돌려준다.
export function parsePaymentReturnTemplateId(
  next: string | undefined,
): string | null {
  return next?.match(PAYMENT_PATH)?.[1] ?? null;
}
