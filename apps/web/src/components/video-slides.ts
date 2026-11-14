const R2_BASE_URL = "https://pub-9f7ce3750f70470ebab6603621ec2019.r2.dev";
// 아직 확정된 대표 영상 4편이 없어 임시로 같은 영상을 공유. 실제 템플릿이 정해지면 title/videoSrc를 교체한다.
const TEMP_VIDEO_SRC = `${R2_BASE_URL}/46a8a6ec-0484-41e7-afba-3217594ebb4b.mp4`;

export const VIDEO_SLIDES = [
  { title: "[영상 ① 제목]", videoSrc: TEMP_VIDEO_SRC },
  { title: "[영상 ② 제목]", videoSrc: TEMP_VIDEO_SRC },
  { title: "[영상 ③ 제목]", videoSrc: TEMP_VIDEO_SRC },
  { title: "[영상 ④ 제목]", videoSrc: TEMP_VIDEO_SRC },
];

export const CREATE_FROM_VIDEO_HREF = "/templates/tags";
export const VIDEO_AUTO_ADVANCE_MS = 5000;
