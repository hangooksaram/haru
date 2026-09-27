import type { Metadata } from "next";
import "./globals.css";
import { Gothic_A1 } from "next/font/google";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const gothicA1 = Gothic_A1({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-heading",
});

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "하루",
  description: "사진 몇 장으로 완성되는 축하 영상",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={cn("font-sans", gothicA1.variable, pretendard.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
