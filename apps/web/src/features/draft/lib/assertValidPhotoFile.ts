import {
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_FILE_SIZE_BYTES,
} from "@/features/draft/constants";
import { InvalidPhotoFileError } from "@/features/draft/errors";

export function assertValidPhotoFile(file: {
  contentType: string;
  size: number;
}): void {
  if (
    !ALLOWED_PHOTO_MIME_TYPES.includes(
      file.contentType as (typeof ALLOWED_PHOTO_MIME_TYPES)[number],
    )
  ) {
    throw new InvalidPhotoFileError(
      `지원하지 않는 파일 형식입니다: ${file.contentType}`,
    );
  }

  if (file.size > MAX_PHOTO_FILE_SIZE_BYTES) {
    throw new InvalidPhotoFileError("파일 용량이 10MB를 초과합니다.");
  }
}
