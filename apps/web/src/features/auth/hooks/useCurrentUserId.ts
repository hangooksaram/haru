"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function useCurrentUserId() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  return userId;
}
