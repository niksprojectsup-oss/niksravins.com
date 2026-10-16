export type CmsImageUploadAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

export function authorizeCmsImageUpload(input: {
  session: { role: string; mfaVerified: boolean } | null;
  sessionActive: boolean | "unavailable";
}): CmsImageUploadAuthResult {
  if (input.sessionActive === "unavailable") {
    return {
      ok: false,
      status: 503,
      error: "Could not verify the admin session.",
    };
  }

  if (
    !input.session ||
    input.session.role !== "ADMIN" ||
    !input.session.mfaVerified ||
    !input.sessionActive
  ) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true };
}
