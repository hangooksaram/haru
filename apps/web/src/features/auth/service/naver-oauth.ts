const NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize";
const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const NAVER_PROFILE_URL = "https://openapi.naver.com/v1/nid/me";

export function getNaverAuthUrl(state: string, redirectUri: string): string {
  const url = new URL(NAVER_AUTH_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.NAVER_CLIENT_ID!);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

type NaverTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeNaverCode(
  code: string,
  state: string,
): Promise<string> {
  const url = new URL(NAVER_TOKEN_URL);
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("client_id", process.env.NAVER_CLIENT_ID!);
  url.searchParams.set("client_secret", process.env.NAVER_CLIENT_SECRET!);
  url.searchParams.set("code", code);
  url.searchParams.set("state", state);

  const response = await fetch(url.toString());
  const data: NaverTokenResponse = await response.json();

  if (!data.access_token) {
    throw new Error(data.error_description ?? "네이버 토큰 발급에 실패했습니다.");
  }

  return data.access_token;
}

export type NaverProfile = {
  id: string;
  email?: string;
  name?: string;
  profileImage?: string;
};

type NaverProfileResponse = {
  resultcode: string;
  message: string;
  response?: {
    id: string;
    email?: string;
    name?: string;
    profile_image?: string;
  };
};

export async function fetchNaverProfile(
  accessToken: string,
): Promise<NaverProfile> {
  const response = await fetch(NAVER_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data: NaverProfileResponse = await response.json();

  if (data.resultcode !== "00" || !data.response) {
    throw new Error(data.message || "네이버 프로필 조회에 실패했습니다.");
  }

  return {
    id: data.response.id,
    email: data.response.email,
    name: data.response.name,
    profileImage: data.response.profile_image,
  };
}
