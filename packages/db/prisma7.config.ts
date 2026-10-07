import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Supabase의 트랜잭션 풀러(DATABASE_URL, pgbouncer)는 마이그레이션에 필요한
  // 세션 기능(advisory lock 등)을 지원하지 않아, CLI(마이그레이션/스키마 조회)는
  // 다이렉트 커넥션(DIRECT_URL)을 사용한다. 앱 런타임 커넥션은 src/client.ts 참고.
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
