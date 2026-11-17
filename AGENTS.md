<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Database / scripts

- `.env` = PRODUCTION Neon, `.env.local` = DEV Neon (prisma.config.ts overrides with .env.local).
- `@prisma/client` in plain `tsx` scripts auto-loads `.env` only — a script without an explicit `DATABASE_URL` writes to PRODUCTION. Always run DB scripts with `DATABASE_URL="$(grep '^DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')"`.
- `npm test` uses `tsx --test` (not vitest). User-facing strings must not contain em/en dashes (typography test).

