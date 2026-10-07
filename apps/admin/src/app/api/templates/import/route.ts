import { importOrUpdateTemplate } from "@/lib/template-import";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : null;

  if (!id) {
    return Response.json(
      { success: false, step: "validate", message: "id가 필요합니다." },
      { status: 400 },
    );
  }

  const result = await importOrUpdateTemplate(id);
  return Response.json(result, { status: result.success ? 200 : 422 });
}
