"use server";

import { updateTag } from "next/cache";

import { CREATOMATE_TEMPLATES_CACHE_TAG } from "@/lib/creatomate";

export async function refreshTemplateList() {
  updateTag(CREATOMATE_TEMPLATES_CACHE_TAG);
}
