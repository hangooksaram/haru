const R2_BASE_URL = "https://pub-9f7ce3750f70470ebab6603621ec2019.r2.dev";
// 아직 확정된 대표 영상 4편이 없어 임시로 같은 영상을 공유. 실제 영상이 정해지면 교체한다.
const TEMP_VIDEO_SRC_01 = `${R2_BASE_URL}/retro.mp4`;

const HERO_VIDEO_SRCS = [TEMP_VIDEO_SRC_01];

export type HeroSlide = {
  title: string;
  href: string;
  videoSrc: string;
};

// 템플릿별 실제 영상이 정해지기 전까지, 순서대로 영상을 순환 배정한다.
// 히어로 슬라이더와 영상 리스트가 같은 템플릿 순서를 쓰므로 이 로직을 공유한다.
export function getVideoSrcForIndex(index: number): string {
  return HERO_VIDEO_SRCS[index % HERO_VIDEO_SRCS.length];
}

// 대표 템플릿을 HERO_VIDEO_SRCS와 순서대로 짝지어 히어로 슬라이드를 만든다.
export function buildHeroSlides(
  templates: { id: string; name: string }[],
): HeroSlide[] {
  return templates.map((template, index) => ({
    title: template.name,
    href: `/draft/${template.id}`,
    videoSrc: getVideoSrcForIndex(index),
  }));
}
