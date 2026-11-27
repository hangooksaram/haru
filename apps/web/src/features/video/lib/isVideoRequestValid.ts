// 정책: 서버는 영상 요청 검증을 통과하지 못하면 주문 생성을 거부한다.
// warnings만 있는 경우는 통과로 본다.
export function isVideoRequestValid(result: {
  valid: boolean;
  errors: string[];
}): boolean {
  return result.valid && result.errors.length === 0;
}
