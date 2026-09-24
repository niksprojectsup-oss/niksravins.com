export const CMS_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const CMS_IMAGE_ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export type CmsImageValidationResult =
  | { ok: true; extension: string }
  | { ok: false; error: string };

export function validateCmsImageUpload(input: {
  size: number;
  mimeType: string;
}): CmsImageValidationResult {
  if (input.size <= 0 || input.size > CMS_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: "Image must be between 1 byte and 5 MB.",
    };
  }

  const normalizedMime = input.mimeType.trim().toLowerCase();
  if (normalizedMime === "image/svg+xml" || normalizedMime.includes("svg")) {
    return {
      ok: false,
      error: "SVG uploads are not allowed.",
    };
  }

  const extension = CMS_IMAGE_ALLOWED_TYPES.get(normalizedMime);
  if (!extension) {
    return {
      ok: false,
      error: "Unsupported image type.",
    };
  }

  return { ok: true, extension };
}
