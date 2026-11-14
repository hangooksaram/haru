const FAQS = [
  {
    question: "시안은 정말 무료인가요?",
    answer: "네. 시안은 횟수 제한 없이 무료로 만들 수 있고, 마음에 들면 주문해요.",
  },
  { question: "수정은 몇 번 가능한가요?", answer: "[확정 후 입력]" },
  { question: "제작 기간은 얼마나 걸리나요?", answer: "[확정 후 입력]" },
  { question: "환불은 어떻게 하나요?", answer: "[확정 후 입력]" },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-10 sm:py-16">
      <span className="text-brand-deep text-sm font-bold">FAQ</span>
      <h2 className="font-heading mt-3 mb-8 text-2xl font-black tracking-tight sm:text-4xl">
        자주 묻는 질문
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {FAQS.map((faq) => (
          <div key={faq.question} className="rounded-2xl border p-5 sm:p-7">
            <h3 className="text-base font-bold sm:text-lg">{faq.question}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-[15px]">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
