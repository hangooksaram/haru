"use client";

import { useRouter } from "next/navigation";
import { useCallback, useLayoutEffect, useState } from "react";

import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { createClient } from "@/lib/supabase/client";

import { useCreateOrderFromDraft } from "./useCreateOrderFromDraft";

function pendingOrderKey(templateId: string): string {
  return `haru:pendingOrder:${templateId}`;
}

// loginReturnPath: 비회원이 로그인한 뒤 돌아와 주문을 이어갈 페이지 경로
export function useCreateOrderWithGuestResume(
  templateId: string,
  loginReturnPath: string,
) {
  const router = useRouter();
  const { draftId, acknowledgeResume } = useDraftId();
  const createOrder = useCreateOrderFromDraft();
  const [message, setMessage] = useState<string | null>(null);

  const createOrderAndNavigate = useCallback(
    async (id: string) => {
      setMessage(null);
      try {
        const order = await createOrder.mutateAsync(id);
        router.push(`/draft/${templateId}/payment?orderId=${order.id}`);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "주문 생성에 실패했습니다.",
        );
      }
    },
    [createOrder, router, templateId],
  );

  // 비회원이 주문 버튼을 누르면 로그인 후 이 페이지로 돌아오는데,
  // 그때 버튼을 다시 누르지 않아도 주문이 이어지도록 pending 플래그를 확인한다.
  // "작성 중이던 시안이 있어요" 모달이 잠깐이라도 뜨지 않도록, 페인트 전에
  // acknowledgeResume부터 동기적으로 호출한다(useEffect는 페인트 이후 실행됨).
  useLayoutEffect(() => {
    if (!draftId) return;

    const key = pendingOrderKey(templateId);
    if (sessionStorage.getItem(key) !== draftId) return;

    sessionStorage.removeItem(key);
    acknowledgeResume();

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user?.is_anonymous) createOrderAndNavigate(draftId);
    });
  }, [draftId, templateId, createOrderAndNavigate, acknowledgeResume]);

  async function handleOrderClick() {
    if (!draftId) return;

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (data.user?.is_anonymous) {
      sessionStorage.setItem(pendingOrderKey(templateId), draftId);
      router.push(`/login?next=${encodeURIComponent(loginReturnPath)}`);
      return;
    }

    await createOrderAndNavigate(draftId);
  }

  return { handleOrderClick, message, isPending: createOrder.isPending };
}
