"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Badge className="bg-brand-soft text-brand-deep rounded-full px-4 py-1.5 text-[13px]">
          시안 확인은 언제나 무료
        </Badge>
        <h1 className="font-heading mt-6 text-4xl leading-[1.25] font-extrabold tracking-tight text-balance sm:text-5xl">
          사진 몇 장으로
          <br />
          완성되는 축하 영상
        </h1>
        <p className="text-muted-foreground mt-6 max-w-md text-[17px] leading-relaxed">
          프로포즈, 축하, 기념일. 사진과 문구만 넣으면 하루가 자동으로 영상을
          만들어드려요. 마음에 들 때만 결제하세요.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full px-7">
            <a href="#start">무료로 시안 만들기</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-7"
          >
            <a href="#templates">템플릿 둘러보기</a>
          </Button>
        </div>
        <div className="mt-9 flex gap-6">
          <div className="flex flex-col">
            <b className="text-xl font-extrabold">9,000원~</b>
            <span className="text-muted-foreground text-xs">
              부담 없는 가격
            </span>
          </div>
          <div className="bg-border w-px" />
          <div className="flex flex-col">
            <b className="text-xl font-extrabold">무제한</b>
            <span className="text-muted-foreground text-xs">시안 재생성</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="relative mx-auto h-[420px] w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="bg-card ring-foreground/10 absolute top-1 left-0 w-[220px] -rotate-[8deg] rounded-2xl p-3.5 shadow-2xl ring-1"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="bg-brand-soft h-[190px] rounded-lg" />
          <div className="bg-muted mt-3 h-2.5 w-2/3 rounded" />
          <div className="bg-muted mt-2 h-2.5 w-2/5 rounded" />
        </motion.div>

        <motion.div
          className="bg-card ring-foreground/10 absolute top-10 right-0 w-[220px] rotate-[6deg] rounded-2xl p-3.5 shadow-2xl ring-1"
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="h-[190px] rounded-lg bg-rose-100" />
          <div className="bg-muted mt-3 h-2.5 w-2/3 rounded" />
          <div className="bg-muted mt-2 h-2.5 w-2/5 rounded" />
        </motion.div>

        <div className="bg-foreground absolute inset-x-0 bottom-0 z-10 mx-auto h-[330px] w-[180px] rounded-[26px] p-2 shadow-2xl">
          <div className="from-brand to-background flex h-full flex-col justify-end rounded-[18px] bg-gradient-to-b p-4">
            <span className="bg-background text-foreground w-fit rounded-full px-2.5 py-1 text-[11px] font-bold">
              미리보기
            </span>
            <span className="font-heading text-foreground mt-1.5 text-base font-extrabold">
              우리의 하루
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
