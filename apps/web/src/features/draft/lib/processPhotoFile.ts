import {
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_FILE_SIZE_BYTES,
} from "@/features/draft/constants";
import { InvalidPhotoFileError } from "@/features/draft/errors";
import { computePhotoResize } from "@/features/draft/lib/computePhotoResize";

type ProcessedPhotoFile = {
  file: File;
  isBlurryWarning: boolean;
};

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
  const resized = computePhotoResize(bitmap.width, bitmap.height);

  if (resized.width === bitmap.width && resized.height === bitmap.height) {
    bitmap.close();

    return { file, isBlurryWarning: resized.isBlurryWarning };
  }

  const canvas = document.createElement("canvas");
  canvas.width = resized.width;
  canvas.height = resized.height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("캔버스를 생성할 수 없습니다.");

  context.drawImage(bitmap, 0, 0, resized.width, resized.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type),
  );
  if (!blob) throw new Error("이미지를 처리할 수 없습니다.");

  const resizedFile = new File([blob], file.name, { type: file.type });

  return { file: resizedFile, isBlurryWarning: resized.isBlurryWarning };
}
