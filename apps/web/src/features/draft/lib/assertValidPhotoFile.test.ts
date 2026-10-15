import { describe, expect, it } from "vitest";

import { MAX_PHOTO_FILE_SIZE_BYTES } from "@/features/draft/constants";
import { InvalidPhotoFileError } from "@/features/draft/errors";

import { assertValidPhotoFile } from "./assertValidPhotoFile";

describe("assertValidPhotoFile", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])(
    "%s 형식은 허용한다",
    (contentType) => {
      expect(() =>
        assertValidPhotoFile({ contentType, size: 1024 }),
      ).not.toThrow();
    },
  );

  it("허용되지 않은 형식이면 거부한다", () => {
    expect(() =>
      assertValidPhotoFile({ contentType: "image/gif", size: 1024 }),
    ).toThrow(InvalidPhotoFileError);
  });

  it("10MB 이하 파일은 허용한다", () => {
    expect(() =>
      assertValidPhotoFile({
        contentType: "image/jpeg",
        size: MAX_PHOTO_FILE_SIZE_BYTES,
      }),
    ).not.toThrow();
  });

  it("10MB를 초과하면 거부한다", () => {
    expect(() =>
      assertValidPhotoFile({
        contentType: "image/jpeg",
        size: MAX_PHOTO_FILE_SIZE_BYTES + 1,
      }),
    ).toThrow(InvalidPhotoFileError);
  });
});
