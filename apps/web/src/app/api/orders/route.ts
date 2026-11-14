import { NextResponse } from "next/server";

import {
  DraftForbiddenError,
  DraftNotFoundError,
} from "@/features/draft/errors";
import {
  OrderCreationConflictError,
  TemplatePriceNotSetError,
} from "@/features/order/errors";
import { createOrderFromDraft } from "@/features/order/service/create-order-from-draft";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const draftId = body?.draftId;

  if (typeof draftId !== "string" || draftId.length === 0) {
    return NextResponse.json(
      { error: "draftId가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user || data.user.is_anonymous) {
      return NextResponse.json(
        { error: "인증 정보가 없습니다." },
        { status: 401 },
      );
    }

    const order = await createOrderFromDraft(supabase, draftId, data.user.id);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (
      error instanceof DraftNotFoundError ||
      error instanceof DraftForbiddenError
    ) {
      return NextResponse.json(
        { error: "시안을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (error instanceof OrderCreationConflictError) {
      return NextResponse.json(
        { error: "주문 생성이 진행 중입니다. 잠시 후 다시 시도해주세요." },
        { status: 409 },
      );
    }

    if (error instanceof TemplatePriceNotSetError) {
      return NextResponse.json(
        { error: "템플릿 가격이 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    throw error;
  }
}
