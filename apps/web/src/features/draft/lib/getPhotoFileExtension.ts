const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getPhotoFileExtension(contentType: string): string {
  return EXTENSION_BY_MIME_TYPE[contentType] ?? "jpg";
}
