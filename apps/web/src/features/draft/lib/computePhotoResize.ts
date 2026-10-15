import {
  MAX_PHOTO_LONG_EDGE_PX,
  MIN_PHOTO_SHORT_EDGE_PX,
} from "@/features/draft/constants";

type PhotoResizeResult = {
  width: number;
  height: number;
  isBlurryWarning: boolean;
};

// 정책: 긴 변 1920px 초과 시 비율 유지하며 축소, 짧은 변 720px 미만이면 흐림 경고(업로드는 허용)
export function computePhotoResize(
  width: number,
  height: number,
): PhotoResizeResult {
  const longEdge = Math.max(width, height);

  if (longEdge <= MAX_PHOTO_LONG_EDGE_PX) {
    return {
      width,
      height,
      isBlurryWarning: Math.min(width, height) < MIN_PHOTO_SHORT_EDGE_PX,
    };
  }

  const scale = MAX_PHOTO_LONG_EDGE_PX / longEdge;
  const resizedWidth = Math.round(width * scale);
  const resizedHeight = Math.round(height * scale);

  return {
    width: resizedWidth,
    height: resizedHeight,
    isBlurryWarning: Math.min(resizedWidth, resizedHeight) < MIN_PHOTO_SHORT_EDGE_PX,
  };
}
