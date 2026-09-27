// Plainly API 클라이언트 자리표시. 실제 엔드포인트/인증 방식은 추후 확정.

export interface PlainlyClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export function createPlainlyClient(_config: PlainlyClientConfig) {
  throw new Error("createPlainlyClient: not implemented yet");
}
