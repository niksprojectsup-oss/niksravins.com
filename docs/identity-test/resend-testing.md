# Resend / Identity Test e-pastu testēšanas procedūra

Tikai development/test konfigurācija. Īstas mārketinga kampaņas aizliegtas.

## Priekšnoteikumi

- `RESEND_API_KEY` — test režīma atslēga vai Resend `onboarding` no-adrese; **mērķa adrese** = tava testa adrese (+alias varianti, piem. `niks+idtest1@gmail.com`).
- `EMAIL_FROM` — Resend verificēts sūtītājs (dev var izmantot `onboarding@resend.dev`, kas sūta tikai uz Resend konta e-pastu).
- `CRON_SECRET` — `openssl rand -hex 32`, izmanto `Authorization: Bearer` cron izsaukumam.
- `ENCRYPTION_KEY`, `AUTH_SECRET` — derīgi (sk. `docs/security/encryption-keys.md`).
- Dev DB: `npx prisma dev` + `DATABASE_URL` uz lokālo instanci.
- Adminā: publicēt RESULT + DAY_1/3/5 veidnes (LV/EN subject+body), stumbru/zaru/portretu fragmentus testa uzskatiem.

## Scenāriji

### A. RESULT e-pasts
1. Publicē 2 testa uzskatus ar fragmentiem → aizpildi publisko testu ar testa e-pastu.
2. Pārbaudi: e-pasts ierodas; tēma = veidnes subject; abi portreti redzami; LV/EN variants atbilst testa valodai; booking CTA uz `/book` vai `/{locale}/book`.
3. Dev DB: `IdentityEmailDelivery.status=SENT`, `providerMessageId` aizpildīts.
4. Atkārtots submit ar to pašu `requestId` → **nav** jauna e-pasta (P2002 → esošais submission).
5. Jauns submit (jauns `requestId`) → jauns e-pasts (atkārtota piegāde ir atļauta — atsevišķs requestId).

### B. DAY_1 / DAY_3 / DAY_5 secība
1. Submit ar `marketingConsent=true` → `IdentityEmailSequence` ACTIVE, `nextStep=DAY_1`, `nextSendAt=now+delay`.
2. Testam: adminā uzliec `delayDays=0` vai `nextSendAt` pagājienē (`update ... set "nextSendAt"=now()` dev DB).
3. Cron: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/identity-email-sequence`.
4. Pārbaudi: DAY_1 ierodas, sequence→`nextStep=DAY_3`; atkārto cron → nav dublikāta (`claimSequence` PROCESSING + requestId `seq:{id}:{step}` P2002).
5. Bez consent → `!consent.marketingConsent` → secība CANCELLED, e-pasts nenosūtās.
6. Secība virzās DAY_3→DAY_5→COMPLETED.

### C. Unsubscribe / piekrišanas atsaukšana
1. Secības e-pastā → unsubscribe saite (HMAC tokens).
2. `GET /api/identity-test/unsubscribe?token=...` → consent `withdrawalTimestamp`, secība CANCELLED.
3. Cron vairs nesūta; viljots tokens → 4xx/nekas netiek atcelts.
4. Sacensības: unsubscribe kamēr cron PROCESSING — otrā consent pārbaude tieši pirms `sendEmail` sašaurina logu uz ~ms (dokumentēts ierobežojums: jau sūtīšanas lidojumā esoša vēstule ir neatgriezeniska).

### D. Krīzes saturs
1. Publicē uzskatu ar `CRISIS` karogu → submit ar consent → **secība neveidojas**, `marketingConsent=false` consent ierakstā, rezultāta e-pasts tomēr iet ar drošības bloku.
2. Adminā nekur nav "segmentēt pēc karoga" funkcijas — `safetyFlags` nav pieejami mārketinga vaicājumos.

### E. HTML mobilajās ierīcēs
1. Atver RESULT + DAY_x e-pastus: Gmail iOS, Apple Mail, Outlook web; pārbaudi `max-width` ~600px, pogu lielumus ≥44px, fontus, attēlu/nepastāvošu bildes izturību.
2. Teksta versija (`text`) — pārbaudi plain-text klientā.

### F. Kļūdas un timeout
1. `RESEND_API_KEY` noņemts → `skipped` → `FAILED:not_configured` (bez retry), submission joprojām VALIDATED, lietotājam kļūdas UI ar retry.
2. Resend 5xx/timeout (simulē ar `mockFail` e2e) → `PENDING` + `nextRetryAt` backoff; atkārtojas līdz 5 mēģinājumiem → `FAILED`, redzams adminā ar `lastError`.
3. Stale `PROCESSING` >30min → atkārtoti claimējams.
4. Admin retry: `/admin/identity-test/emails` → "Atkārtot" uz FAILED RESULT (izveido `:retry:{ts}` requestId — jauns mēģinājums, bet tas pats rezultāts).

## Automātiskā pārklājuma karte

E2E (`scripts/e2e-identity.ts`) jau sedz: idempotenci, requestId dedup, ambiguous→PENDING, claim ekskluzivitāti, skipped→FAILED, consent→sequence, unsubscribe→CANCELLED, crisis→no-marketing. Šis fails ir atkārtojams pret dev DB.
