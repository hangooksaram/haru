import Link from "next/link";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#templates", label: "템플릿" },
  { href: "#how", label: "이용 방법" },
  { href: "#start", label: "가격" },
];

export function SiteHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b py-5">
      <span className="text-xl font-extrabold tracking-tight">하루</span>
      <nav className="order-3 flex w-full justify-center gap-8 sm:order-none sm:w-auto sm:justify-start">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <Button asChild size="lg" className="rounded-full">
        <Link href="/draft">무료로 시작하기</Link>
      </Button>
    </header>
  );
}
