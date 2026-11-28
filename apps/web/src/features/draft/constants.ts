import type { DraftStep } from "@/features/draft/types";

export const DRAFT_PHOTOS_BUCKET = "draft-photos";

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_PHOTO_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const MAX_PHOTO_LONG_EDGE_PX = 1920;

export const MIN_PHOTO_SHORT_EDGE_PX = 720;

// 시안 단계 순서. drafts.last_step은 이 순서로 앞뒤를 비교한다.
export const DRAFT_STEP_ORDER: DraftStep[] = [
  "basic_info",
  "photos",
  "subtitle",
  "payment",
];

// drafts.last_step 값과 시안 단계 주소(/draft/{templateId}/{segment})의 대응.
export const DRAFT_STEP_SEGMENTS: Record<DraftStep, string> = {
  basic_info: "basic-info",
  photos: "photos",
  subtitle: "subtitle",
  payment: "payment",
};
