import { z } from "zod";

// packages/shared: 요청/응답 검증용 Zod 스키마 (DB 스키마 문서 기반 뼈대)

export const draftStatusSchema = z.enum(["editing", "converting", "converted"]);

export const orderStatusSchema = z.enum([
  "pending_payment",
  "paid",
  "rendering",
  "completed",
  "failed",
]);

export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const createDraftSchema = z.object({
  template_id: z.string(),
});

export const updateDraftPhotosSchema = z.object({
  draft_id: z.string(),
  photos: z.array(
    z.object({
      storage_path: z.string(),
      position: z.number().int().nonnegative(),
    }),
  ),
});

export const updateDraftTextsSchema = z.object({
  draft_id: z.string(),
  texts: z.array(
    z.object({
      field_key: z.string(),
      value: z.string(),
    }),
  ),
});

export const lookupOrderSchema = z.object({
  order_number: z.string(),
  guest_contact: z.string(),
});
