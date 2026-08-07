import { redirect } from "next/navigation";
import { isClientAuthSessionActive } from "@/lib/auth/client-repository";
import { getServerSession } from "@/lib/auth/session";
import type { SessionContext } from "@/lib/auth/types";

async function assertActiveClientSession(session: SessionContext): Promise<void> {
  const active = await isClientAuthSessionActive(session.sessionId);
  if (!active) {
    redirect("/client/login?error=Session%20expired.%20Please%20sign%20in%20again.");
  }
}

export async function requireClient(): Promise<SessionContext> {
  const session = await getServerSession();

  if (!session || session.role !== "CLIENT") {
    redirect("/client/login");
  }

  if (!session.clientId) {
    redirect("/client/login?error=Account%20is%20not%20linked%20to%20a%20client%20profile.");
  }

  await assertActiveClientSession(session);
  return session;
}

export async function getOptionalClientSession(): Promise<SessionContext | null> {
  const session = await getServerSession();
  if (!session || session.role !== "CLIENT" || !session.clientId) {
    return null;
  }

  const active = await isClientAuthSessionActive(session.sessionId);
  if (!active) return null;

  return session;
}
