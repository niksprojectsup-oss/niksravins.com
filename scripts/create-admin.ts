import { createAdminUser } from "../src/lib/auth/admin-repository";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const displayName = process.argv[4];

  if (!email || !password) {
    console.error("Usage: npm run admin:create -- <email> <password> [displayName]");
    process.exit(1);
  }

  const admin = await createAdminUser({
    email,
    password,
    displayName,
  });

  console.log(`Admin user created: ${admin.email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
