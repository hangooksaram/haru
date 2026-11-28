type Props = {
  title: string;
  description: string;
};

// 시안·결제 스텝 본문 상단의 제목과 안내 문구.
export function DraftStepTitle({ title, description }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
