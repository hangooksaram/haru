"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

// 확인 전에는 undefined. 세션이 없으면 익명 유저가 아직 발급되지 않은 것이므로 true로 본다.
export function useIsAnonymousUser() {
  const [isAnonymous, setIsAnonymous] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsAnonymous(!data.user || data.user.is_anonymous === true);
    });
  }, []);

  return isAnonymous;
}
