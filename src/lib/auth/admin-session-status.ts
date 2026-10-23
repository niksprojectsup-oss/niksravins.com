const TRANSIENT_DATABASE_CODES = new Set(["P1001", "P1002", "P1017"]);

export type AdminSessionExpiry = {
  expiresAt: Date;
};

export function isTransientDatabaseError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const record = error as { code?: unknown; errorCode?: unknown; message?: unknown };
  const code =
    typeof record.code === "string"
      ? record.code
      : typeof record.errorCode === "string"
        ? record.errorCode
        : "";

  if (TRANSIENT_DATABASE_CODES.has(code)) return true;

  const message = typeof record.message === "string" ? record.message : "";
  return /can't reach database server|server has closed the connection|kind: closed|connection closed/i.test(
    message,
  );
}

export function adminSessionIsActive(
  session: AdminSessionExpiry | null,
  now = Date.now(),
): boolean {
  if (!session) return false;
  return session.expiresAt.getTime() > now;
}

export async function lookupAdminSessionActive(
  sessionId: string,
  findUnique: (sessionId: string) => Promise<AdminSessionExpiry | null>,
  now = Date.now(),
): Promise<boolean> {
  const read = () => findUnique(sessionId);
  let session: AdminSessionExpiry | null;

  try {
    session = await read();
  } catch (error) {
    if (!isTransientDatabaseError(error)) throw error;
    session = await read();
  }

  return adminSessionIsActive(session, now);
}
