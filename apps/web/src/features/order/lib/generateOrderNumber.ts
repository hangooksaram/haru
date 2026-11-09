import { randomBytes } from "crypto";

// 유저에게 보여줄 주문번호. 노션 정책엔 형식이 정해지지 않아 타임스탬프+랜덤으로 생성한다.
export function generateOrderNumber(now: Date = new Date()): string {
  const timestamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const random = randomBytes(3).toString("hex").toUpperCase();

  return `${timestamp}-${random}`;
}
