import { getPlaceholderBgClass } from "@/features/template/lib/getPlaceholderBgClass";
import { cn } from "@/lib/utils";

type Props = {
  templateId: string;
  children?: React.ReactNode;
};

export function VideoThumbnail({ templateId, children }: Props) {
  return (
    <div
      className={cn(
        "flex aspect-3/4 items-end overflow-hidden rounded-2xl",
        getPlaceholderBgClass(templateId),
      )}
    >
      {children}
    </div>
  );
}
