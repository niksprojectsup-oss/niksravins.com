# Neon DEV zars — izveide un konfigurēšana

**Pašreizējais Neon savienojums = PRODUCTION** (`ep-summer-poetry-…/neondb`). Tas satur visas 5 esošās migrācijas un 0 Identity tabulu — nekas no jaunā koda tur nav izpildīts.

## 1. DEV zara izveide (Neon Dashboard — manuāla darbība)

1. Neon Console → projekts → **Branches** → **Create branch**.
2. Nosaukums: `dev` (vai `development`).
3. Parent: `main` (production zars) — izvēlieties **"data: copy"** (vai "schema only", ja kopēts lietotāju datu apjoms nav vēlams; Identity Test pārbaudēm pietiek schema+saturs bez klientu datiem — drošāk **schema only** + atsevišķs seed).
4. Iegūtais endpoint būs jauns `ep-…` hostā — tas ir DEV zara savienojuma adrese.

## 2. Lokālā konfigurēšana (gitignore faili)

`.env` un `.env.local` ir `.env*` gitignore paraugā — nekādā gadījumā necommit.

- `.env` → **production** `DATABASE_URL` (nemainīt).
- `.env.local` → **DEV** `DATABASE_URL` (jaunā zara string). Šī ir vienīgā vieta, kur mainīt.

`prisma.config.ts` tagad ielādē `.env` un tad `.env.local` ar override — tas nozīmē, ka Next dev serveris UN prisma CLI abi lieto DEV savienojumu, kad `.env.local` ir iestatīts. Production `.env` paliek nemainīts.

## 3. Verifikācija pirms komandām (obligāta)

```bash
npx prisma migrate status   # jārāda DEV host, nevis ep-summer-poetry
```

Ja redzams `ep-summer-poetry` — **APSTĀTIES** (tas ir production), pārbaudīt `.env.local`.

## 4. Migrācijas un seed uz DEV

```bash
npx prisma migrate deploy             # 2 pending migrācijas (identity_test, rate_limit_store)
npx tsx prisma/identity-test-seed.ts  # 10 tēmas / 50 apakštēmas / 200 uzskati (DRAFT)
```

Pēc tam pārbaudes:

```bash
npx tsx scripts/neon-check.ts        # Identity* tables: 17 (16 + SecurityRateLimitBucket)
npx tsx scripts/e2e-identity.ts      # pilns e2e scenārijs
```

## 5. Rollback

DEV zars ir izolēts — to var droši dzēst Neon Dashboard (Delete branch) bez ietekmes uz production. Production zaru nemaina nekas no šīs procedūras.
