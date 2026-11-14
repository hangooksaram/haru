const R2_BASE_URL = "https://pub-9f7ce3750f70470ebab6603621ec2019.r2.dev";
// 아직 확정된 대표 영상 4편이 없어 임시로 같은 영상을 공유. 실제 영상이 정해지면 교체한다.
const TEMP_VIDEO_SRC_01 = `${R2_BASE_URL}/식전 영상.mp4`;
const TEMP_VIDEO_SRC_02 = `${R2_BASE_URL}/프러포즈 영상.mp4`;

const HERO_VIDEO_SRCS = [TEMP_VIDEO_SRC_01, TEMP_VIDEO_SRC_02];

export const VIDEO_AUTO_ADVANCE_MS = 5000;

export type HeroSlide = {
  title: string;
  href: string;
  videoSrc: string;
};

// 대표 템플릿을 HERO_VIDEO_SRCS와 순서대로 짝지어 히어로 슬라이드를 만든다.
export function buildHeroSlides(
  templates: { id: string; name: string }[],
): HeroSlide[] {
  return templates.map((template, index) => ({
    title: template.name,
    href: `/draft/${template.id}`,
    videoSrc: HERO_VIDEO_SRCS[index % HERO_VIDEO_SRCS.length],
  }));
}
