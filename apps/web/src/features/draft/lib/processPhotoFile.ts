import {
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_FILE_SIZE_BYTES,
  MAX_PHOTO_LONG_EDGE_PX,
  MIN_PHOTO_SHORT_EDGE_PX,
} from "@/features/draft/constants";
import { InvalidPhotoFileError } from "@/features/draft/errors";

type ProcessedPhotoFile = {
  file: File;
  isBlurryWarning: boolean;
};

// 정책: 1920px 초과 시 브라우저에서 축소, 짧은 변 720px 미만이면 경고(업로드는 허용)
export async function processPhotoFile(
  file: File,
): Promise<ProcessedPhotoFile> {
  if (
    !ALLOWED_PHOTO_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_PHOTO_MIME_TYPES)[number],
    )
  ) {
    throw new InvalidPhotoFileError(
      `지원하지 않는 파일 형식입니다: ${file.name}`,
    );
  }

  if (file.size > MAX_PHOTO_FILE_SIZE_BYTES) {
    throw new InvalidPhotoFileError(
      `파일 용량이 10MB를 초과합니다: ${file.name}`,
    );
  }

  const bitmap = await createImageBitmap(file);
  const longEdge = Math.max(bitmap.width, bitmap.height);
  const shortEdge = Math.min(bitmap.width, bitmap.height);

  if (longEdge <= MAX_PHOTO_LONG_EDGE_PX) {
    bitmap.close();

    return { file, isBlurryWarning: shortEdge < MIN_PHOTO_SHORT_EDGE_PX };
  }

  const scale = MAX_PHOTO_LONG_EDGE_PX / longEdge;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("캔버스를 생성할 수 없습니다.");

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type),
  );
  if (!blob) throw new Error("이미지를 처리할 수 없습니다.");

  const resizedFile = new File([blob], file.name, { type: file.type });
  const finalShortEdge = Math.min(width, height);

  return {
    file: resizedFile,
    isBlurryWarning: finalShortEdge < MIN_PHOTO_SHORT_EDGE_PX,
  };
}
