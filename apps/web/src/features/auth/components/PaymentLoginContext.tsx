import { parsePaymentReturnTemplateId } from "@/features/auth/lib/parsePaymentReturnTemplateId";
import { TemplateNotFoundError } from "@/features/draft/errors";
import { getPublicTemplate } from "@/features/template/service/get-public-template";

type Props = {
  next?: string;
};

async function getTemplateName(templateId: string): Promise<string | null> {
  try {
    const template = await getPublicTemplate(templateId, "ko");
    return template.name;
  } catch (error) {
    if (error instanceof TemplateNotFoundError) return null;
    throw error;
  }
}

// 결제 스텝에서 넘어온 로그인·가입 화면에만 보여준다. 작성 중인 시안이 유지된다는 걸 알려 이탈을 줄인다.
export async function PaymentLoginContext({ next }: Props) {
  const templateId = parsePaymentReturnTemplateId(next);
  if (!templateId) return null;

  const templateName = await getTemplateName(templateId);

  return (
    <div className="flex flex-col gap-2 rounded-xl border p-4">
      <p className="text-sm font-bold">로그인하면 바로 결제로 이어져요</p>
      <p className="text-muted-foreground text-xs">
        작성한 시안은 그대로 유지돼요.
      </p>
      {templateName && (
        <div className="flex items-center gap-2 border-t border-dashed pt-2 text-xs">
          <span className="min-w-0 truncate font-medium">{templateName}</span>
          <span className="bg-brand-soft text-brand-deep ml-auto shrink-0 rounded-md px-1.5 py-0.5 font-semibold">
            영상 제작 중
          </span>
        </div>
      )}
    </div>
  );
}
