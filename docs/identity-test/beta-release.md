# Identity Test — Closed Beta Release sagatavošana

## Beta piekļuves mehānisms (implementēts)

- `IdentityBetaInvite` tabula: `tokenHash` (SHA-256), `label`, `maxUses`, `uses`, `expiresAt`, `revokedAt`, `createdById`.
- Uzaicinājuma saite: `{baseUrl}/api/identity-test/redeem?token=<t>&locale=<lv|en>` — izveido adminā `/admin/identity-test/beta` (parādās VIENU reizi).
- `redeem` maršruts: validē tokenu, atomiski `uses+1`, iestata `__it_beta` HttpOnly cookie (7d, Secure prod).
- Servera vārti (ne tikai UI paslēpšana):
  - `/identity-test` un `/[locale]/identity-test` → `isBetaRequestAllowed()` → slēgtā beta paziņojums (`identityTest.closed` i18n).
  - `POST /api/identity-test/submit` → 403 `beta_closed` bez derīga cookie.
  - `redeem` ir rate-limited (10/min/IP).
- Atcelšana: admin "Atsaukt" → `revokedAt`; automātiski: `expiresAt`/`maxUses`.
- Pēc beta: mehānismu izslēdz, noņemot abus vārtu izsaukumus (2 lapas + submit) — 3 vietas; vai atstāj (invite sistēma der arī atvērtajai versijai).

## Release commitu saraksts (`merge-validation`, 47 commits virs main; main ir ancestors — zudumu nav)

| Commit | Saturs |
|---|---|
| `0a6dc05` | Latvian Booking ON/OFF iestatījums (iepriekšējs darbs) |
| `cf2cef8` | Homepage journey merge |
| `957bed1` | Identity Test implementācija (schema, public, admin, email pipeline) |
| `09abd4d` | Delivery/state fix, Postgres rate limit, env precedence |
| `526b922`,`a80cae9` | Verifikācijas skripti |
| `4ca3384` | Krīzes bloka noņemšana no UI |
| `0c0df8a` | UX/UI pārveide |
| jauns | Beta piekļuves mehānisms + closed i18n |

## Production migrāciju plāns

1. **Backup:** Neon Dashboard → production zars → Create branch `pre-identity-backup` (vai Snapshot). Atjaunošana: restore from branch/snapshot — dokumentēts Neon UI solis, nav datu kopiēšanas skripta.
2. **Drift:** verificēts — prod = tieši 5 baseline migrācijas + `playing_with_neon` demo tabula (nav mūsu shēmā; atstāt).
3. **Secība:** `prisma migrate deploy` → 3 migrācijas šajā secībā: `add_identity_test` → `add_rate_limit_store` → `add_beta_invites`. Visas 100% additīvas, `SET CONSTRAINTS` nav, LOCK risks minimāls.
4. **Seed:** `tsx prisma/identity-test-seed.ts` — 10/50/200/4 kā DRAFT. **NEKOPĒT** DEV publicēšanas statusus/descriptions (tie ir tikai dev vizuālie dati).
5. **Pārbaude:** `migrate status` + tabulu skaits 52+ (16 Identity + RL + BetaInvite) + 0 drift diff.

## Production konfigurācija (vercel env ls)

| Mainīgais | Stāvoklis |
|---|---|
| DATABASE_URL | ✓ Production+Preview |
| ENCRYPTION_KEY | ✓ (esošā atslēga — saderīga; identity šifrēšana izmanto to pašu) |
| AUTH_SECRET | ✓ |
| CSRF_SECRET | ✓ |
| RESEND_API_KEY | ✓ |
| EMAIL_FROM | ✓ |
| ADMIN_NOTIFICATION_EMAIL | ✓ |
| NEXT_PUBLIC_APP_URL | ✓ |
| **CRON_SECRET** | **✗ TRŪKST — jāpievieno pirms cron** |
| **IDENTITY_BETA*** | nav vajadzīgs (gaita no DB) |

## Beta testēšanas plāns (pirms plašākas uzaicināšanas)

1. Adminā `/admin/identity-test/beta`: izveidot saiti sev → atvērt inkognito → tests atveras.
2. Bez saites: `/lv/identity-test` → slēgtā beta ekrāns; `curl` uz submit → 403.
3. Saites `maxUses`/`expiresAt`/`revoke` uzvedība.
4. Testētājam: iziet visu plūsmu (10 tēmas, apgalvojumi, pārskats, e-pasts) → saņem RESULT e-pastu.
5. Unsubscribe links e-pastā → secība CANCELLED.
6. Mobile Safari/Chrome.
7. Admin: satura publicēšana, portretu fragmenti, translations.

## Riski

1. `CRON_SECRET` nav Vercel env — secību cron nedarbosies (pagaidām OK, mārketinga secības nebūs aktīvas).
2. Satura portreti (`portraitNow`/`portraitFuture`) ir DRAFT — bez tiem submit atgriež `template_unpublished`/`belief_not_published`. **Pirms beta vajag saturiski pabeigt vismaz publicētās tēmas** (admin preview rīks).
3. RESULT/DAY_* veidņu saturs DRAFT — e-pasts nenosūtīsies.
4. Resend domain verifikācija `niksravins.com` — jāpārbauda Resend konsolē (EMAIL_FROM jau konfigurēts, bet domain statusu nevaru pārbaudīt no koda).
5. `IdentityEmailSequence` cron `vercel.json` — aktivizēsies automātiski pēc deploy, ja `CRON_SECRET` iestatīts; bez tā route atgriež 401 (droši).
6. Neon Hobby/scale-to-zero — pirmā pieprasījuma latency.

## Rollback plāns

- Kods: `git revert` release merge / Vercel redeploy iepriekšējā commit (1 solis).
- DB: migrācijas ir additīvas — rollback NEPRASA schema izmaiņu (jaunās tabulas ir inertas). Ja jānoņem: drop 18 tabulu (identity+beta+RL) — sagatavots SQL pieejams pēc pieprasījuma.
- Piekļuve: beta vārti atslēdzami tikai koda līmenī; ātri avārijas "off" = Vercel preview env rollback.

## Paredzamā izvietošanas secība

1. `merge-validation` → merge uz `main` (pēc Tava apstiprinājuma).
2. `CRON_SECRET` + pārējo env pārbaude Vercel.
3. Deploy `main` → Vercel Production.
4. Neon backup zars → `prisma migrate deploy` (prod) → `identity-test-seed.ts` (prod).
5. Admin: satura apstiprināšana (portreti, LV/EN, e-pasta veidnes) — satura darbs.
6. Beta saites izveide → sūtīšana testētājiem.
7. Cron aktivizācija (`CRON_SECRET` jau iestatīts → vercel.json cron sāk darboties).
