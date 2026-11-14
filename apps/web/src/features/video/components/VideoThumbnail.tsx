import { getPlaceholderColor } from "@/features/template/lib/getPlaceholderColor";

type Props = {
  templateId: string;
  children?: React.ReactNode;
};

export function VideoThumbnail({ templateId, children }: Props) {
  return (
    <div
      className="flex aspect-3/4 items-end overflow-hidden rounded-2xl"
      style={{ backgroundColor: getPlaceholderColor(templateId) }}
    >
      {children}
    </div>
  );
}
