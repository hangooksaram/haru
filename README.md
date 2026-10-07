# haru

Notion "개발 > 인프라", "개발 > DB 스키마" 문서를 기반으로 한 프로젝트 뼈대입니다.

## 인프라 결정 사항

- **DB / 스토리지**: Supabase (Postgres + Storage 통합)
- **배포**: Vercel (Next.js 16, Vercel Cron으로 렌더 재시도 배치 처리)
- **어드민**: 별도 페이지 없이 Supabase 대시보드(Table Editor) 사용
- 자동 클린업 배치(오래된 draft 삭제)는 초기 단계에서는 만들지 않음 — `drafts.status`/`updated_at`만 준비해두고 스토리지 사용량을 봐가며 추가

## 모노레포 구조

| 경로              | 역할                                                                                         |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `apps/web`        | Next.js 16 앱. 프론트엔드 + API 라우트(서버 로직) 전부 포함                                  |
| `packages/shared` | DB 스키마 기반 TypeScript 타입, Zod 검증 스키마, Plainly API 클라이언트(자리표시), 공통 유틸 |

## DB 스키마 요약

핵심 원칙: **"시안 확정 = 결제 상품 확정"**. 무료로 누구나 만들고 버리는 시안(`drafts`)과 결제된 주문(`orders`)은 라이프사이클이 달라 테이블을 분리했습니다. 결제가 시작되는 순간 `drafts`의 내용을 `orders`로 복사(전환)하고, 원본 draft는 정리 대상이 됩니다.

테이블: `users`, `templates`, `drafts` / `draft_photos` / `draft_texts`, `orders` / `order_photos` / `order_texts`, `preview_renders`, `payments`.

자세한 컬럼 정의는 [`packages/shared/src/types.ts`](./packages/shared/src/types.ts)와 Notion "DB 스키마" 페이지를 참고하세요.

## 시작하기

```bash
corepack enable
pnpm install
pnpm dev
```
