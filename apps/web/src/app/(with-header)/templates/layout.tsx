type Props = {
  children: React.ReactNode;
};

export default function TemplatesLayout({ children }: Props) {
  return (
    <main className="mx-auto max-w-[1280px] px-5 sm:px-10 lg:px-[72px]">
      {children}
    </main>
  );
}
