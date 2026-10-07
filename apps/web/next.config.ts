import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 루트 .claude/CLAUDE.md와 중복/혼동되지 않도록 Next.js의 AI 에이전트 파일 자동 생성을 끈다.
  agentRules: false,
};

export default nextConfig;
