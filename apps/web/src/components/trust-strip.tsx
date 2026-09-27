const items = [
  "결제 전까지 100% 무료",
  "평균 제작 5분 이내",
  "회원가입 없이 이용 가능",
];

export function TrustStrip() {
  return (
    <div className="bg-foreground text-background flex flex-wrap justify-center gap-8 px-6 py-5 text-[13px] font-semibold sm:gap-12">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}
