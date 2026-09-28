const CREATOMATE_API_URL = "https://api.creatomate.com/v1";

export type CreatomateTemplate = {
  id: string;
  name: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type CreatomateElement = {
  type: string;
  name?: string;
  dynamic?: boolean;
  elements?: CreatomateElement[];
};

export type CreatomateTemplateDetail = CreatomateTemplate & {
  source: {
    width: number;
    height: number;
    duration: number;
    elements: CreatomateElement[];
  };
};

async function requestCreatomate(path: string): Promise<Response> {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) {
    throw new Error("CREATOMATE_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  return fetch(`${CREATOMATE_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });
}

export async function getTemplates(): Promise<CreatomateTemplate[]> {
  const response = await requestCreatomate("/templates");

  if (!response.ok) {
    throw new Error(
      `Creatomate 템플릿 조회 실패: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as CreatomateTemplate[];
}

export async function getTemplate(
  id: string,
): Promise<CreatomateTemplateDetail | null> {
  const response = await requestCreatomate(
    `/templates/${encodeURIComponent(id)}`,
  );

  // 존재하지 않는 id는 404, UUID 형식이 아닌 id는 400으로 응답한다.
  if (response.status === 404 || response.status === 400) return null;

  if (!response.ok) {
    throw new Error(
      `Creatomate 템플릿 상세 조회 실패: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as CreatomateTemplateDetail;
}

// Creatomate 에디터에서 템플릿 태그를 `price:12000`, `category:결혼` 형식으로 입력한다.
export function parseTemplateTags(tags: string[]): {
  price?: number;
  category?: string;
} {
  const result: { price?: number; category?: string } = {};

  for (const tag of tags) {
    const [key, ...rest] = tag.split(":");
    const value = rest.join(":").trim();
    if (value === "") continue;

    if (key.trim() === "price") {
      const price = Number(value);
      if (Number.isFinite(price)) result.price = price;
    } else if (key.trim() === "category") {
      result.category = value;
    }
  }

  return result;
}
