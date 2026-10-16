import { prisma } from "@haru/db";

export async function upsertUserProfile(
  id: string,
  email: string | null | undefined,
): Promise<void> {
  await prisma.user.upsert({
    where: { id },
    create: { id, email },
    update: { email },
  });
}
