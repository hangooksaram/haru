import { CreatomateRequestError } from "@/features/video/errors";

const CREATOMATE_RENDERS_URL = "https://api.creatomate.com/v2/renders";

export type DryRunResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  // modifications가 적용된 최종 RenderScript
  source: unknown;
};

// 렌더링 없이 검증만 하며 크레딧이 소모되지 않는다. 200이면 valid 여부와 관계없이 결과를 그대로 돌려준다.
export async function requestCreatomateDryRun(
  templateId: string,
  modifications: Record<string, string>,
): Promise<DryRunResult> {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) {
    throw new Error("CREATOMATE_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(CREATOMATE_RENDERS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      modifications,
      dry_run: true,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const retryAfter = response.headers.get("Retry-After");
    const retryHint = retryAfter ? ` (Retry-After: ${retryAfter}s)` : "";
    throw new CreatomateRequestError(
      `Creatomate dry_run 실패: ${response.status}${retryHint} ${await response.text()}`,
    );
  }

  return (await response.json()) as DryRunResult;
}
