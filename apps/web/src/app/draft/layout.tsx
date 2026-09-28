import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default function DraftLayout({ children }: Props) {
  return (
    <main className="mx-auto max-w-[1280px] px-6">
      <header className="flex items-center border-b py-5">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          하루
        </Link>
      </header>
      {children}
    </main>
  );
}
