export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_PHOTO_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const MAX_PHOTO_LONG_EDGE_PX = 1920;

export const MIN_PHOTO_SHORT_EDGE_PX = 720;
