import { prisma } from "@haru/db";

import { getSupabaseAdminClient } from "@/lib/supabase";

export async function mergeAnonymousAccount(
  anonUserId: string,
  newUserId: string,
): Promise<void> {
  await prisma.draft.updateMany({
    where: { userId: anonUserId },
    data: { userId: newUserId },
  });

  await getSupabaseAdminClient().auth.admin.deleteUser(anonUserId);
}
