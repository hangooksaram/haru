import { DraftForbiddenError } from "@/features/draft/errors";

// 정책: 서버는 시안 소유자가 아닌 유저의 시안 데이터(텍스트, 사진) 저장·조회·삭제 요청을 거부한다.
// 소유자가 없는 시안(draftUserId가 null)은 예외로 누구나 접근할 수 있다.
export function assertDraftOwner(
  draftId: string,
  draftUserId: string | null,
  currentUserId: string | null,
): void {
  if (draftUserId && draftUserId !== currentUserId) {
    throw new DraftForbiddenError(draftId);
  }
}
