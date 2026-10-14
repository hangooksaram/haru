import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 서버 전용 클라이언트. 서비스 롤 키를 쓰므로 클라이언트 번들에 노출되면 안 된다.
// 빌드 시점(환경변수 미설정)에 모듈 평가만으로 실패하지 않도록 지연 생성한다.
let client: SupabaseClient | undefined;

export function getSupabaseAdminClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  return client;
}
