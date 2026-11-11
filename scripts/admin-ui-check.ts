// Izveido reālu admin sesiju DEV DB un izdrukā JWT cookie HTTP pārbaudei.
import { prisma } from "../src/lib/db/prisma";
import { createAdminSession } from "../src/lib/auth/admin-repository";
import { createSessionToken } from "../src/lib/auth/session-token";
import { randomBytes } from "node:crypto";

async function main() {
  const admin = await prisma.adminUser.findUnique({ where: { email: "dev-admin@identity-test.local" } });
  if (!admin) throw new Error("admin missing");
  const sessionId = await createAdminSession({
    adminId: admin.id,
    token: randomBytes(32).toString("hex"),
    expiresAt: new Date(Date.now() + 3600_000),
    userAgent: "dev-ui-check",
  });
  const jwt = await createSessionToken({
    sub: admin.id,
    email: admin.email,
    role: "ADMIN",
    sessionId,
    mfaVerified: true,
  });
  console.log("COOKIE=__nr_session=" + jwt);
  await prisma.$disconnect();
}
main();
