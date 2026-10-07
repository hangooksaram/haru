"use server";

import { updateTag } from "next/cache";

import { CREATOMATE_TEMPLATES_CACHE_TAG } from "@haru/db";

// Server Action에서 "읽은 즉시 반영"이 필요하므로 revalidateTag 대신 updateTag를 쓴다.
export async function refreshTemplateList() {
  updateTag(CREATOMATE_TEMPLATES_CACHE_TAG);
}
