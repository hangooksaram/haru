import { prisma } from "@haru/db";

import { getDraftPhotoSignedUrl } from "@/features/draft/service/draft-photo-storage";
import { OrderNotFoundError } from "@/features/order/errors";
import { OrderNotPaidError } from "@/features/video/errors";
import { canStartVideoRender } from "@/features/video/lib/canStartVideoRender";
import {
  requestCreatomateDryRun,
  type DryRunResult,
} from "@/features/video/service/creatomate-dry-run";

import type { SupabaseClient } from "@supabase/supabase-js";

type TextItem = { name: string; text: string };

// 제작 요청 직전 사전 검증. valid: false / warnings 처리는 남은 과제라 결과를 그대로 돌려준다.
// supabase는 호출자의 세션 클라이언트다(세션 없는 호출 경로 처리는 남은 과제).
export async function validateVideoRequest(
  supabase: SupabaseClient,
  orderId: string,
): Promise<DryRunResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { photos: { orderBy: { position: "asc" } } },
  });

  if (!order) throw new OrderNotFoundError(orderId);
  if (!canStartVideoRender(order.status)) throw new OrderNotPaidError(orderId);

  const modifications: Record<string, string> = {};

  for (const { name, text } of order.texts as TextItem[]) {
    modifications[name] = text;
  }

  for (const photo of order.photos) {
    modifications[photo.name] = await getDraftPhotoSignedUrl(
      supabase,
      photo.storagePath,
    );
  }

  return requestCreatomateDryRun(order.templateId, modifications);
}
