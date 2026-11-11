# ENCRYPTION_KEY — pārvaldība, rotācija, atjaunošana

## Kam tiek izmantota

`src/lib/security/encryption.ts` — AES-256-GCM lauka līmeņa šifrēšana:

- `IdentityTestResult.email`, `portraitNow`, `portraitFuture`
- `IdentityEmailConsent.email`, `IdentityEmailSequence.email`, `IdentityEmailDelivery.recipient`
- esošie klientu piezīmju lauki

Papildu `emailHash`/`recipientHash` = HMAC-SHA256 (meklēšanai/dedup) — atkarīgs no `AUTH_SECRET` (ne `ENCRYPTION_KEY`).

## Atslēgas formāts

- 32 bytes, base64 kodēts (`openssl rand -base64 32`).
- Saglabāts: lokāli `.env` / `.env.local`; production — **tikai Vercel Environment Variables**. Atslēga nekad nav commit vai log failos.
- `isEncryptionEnabled()` = env ir iestatīts; `encryptField()` met kļūdu, ja atslēga nav derīgs base64-32B. **Bez atslēgas lietotne nav droši lietojama** — invalid vērtība nav "izslēgta", tā ir bojāta konfigurācija.

## Rotācija (plānota vai pēc kompromitācijas)

AES-GCM ciphertext satur IV+tag — vecā atslēga vajadzīga atšifrēšanai. Tāpēc rotācija = re-šifrēšana:

1. Iegūst jaunu atslēgu `openssl rand -base64 32` (glabā droši, 1Password/secrets manager).
2. Pagaidu skripts (atsevišķs, pārbaudāms): lasa katru šifrēto lauku ar **veco** atslēgu, pāršifrē ar **jauno**. Abas atslēgas kā env: `ENCRYPTION_KEY_OLD`, `ENCRYPTION_KEY_NEW`. Nekad abas vienā `ENCRYPTION_KEY` mainīgā.
3. Verificē: izlases ieraksti atšifrējas ar jauno.
4. Vercel: iestata jauno `ENCRYPTION_KEY`, redeploy.
5. Lokāli `.env`/`.env.local`: jaunā vērtība.
6. Veco atslēgu glabā 30 dienas secrets manager (rollback), pēc tam iznīcina.

## Atjaunošana pēc zaudējuma

- Ja atslēga pazudēta, šifrētie lauki **nav atjaunojami** (AES-256-GCM). Attiecīgie ieraksti jāatzīmē par nelasāmiem (`lastError="encryption_key_lost"` analogs) un jāinformē lietotāji par rezultātu zudumu.
- `emailHash` lauki paliek — var noteikt, kuri submissions ietekmēti.
- Tāpēc: glabā atslēgu secrets manager ar dublikātu pirms pirmās production izmantošanas.

## Development vs production

- `.env` un `.env.local` ir gitignore (`*.env*` paraugs) — pārbaudīts ar `git check-ignore`.
- Vercel env: `ENCRYPTION_KEY` tikai Production/Preview scope — dev atslēga atšķiras no production.
- Nekad nekopē production atslēgu lokāli; ja nepieciešams atšifrēt production datus — dari to Vercel vidē/pārbaudāmā skriptā ar laika ierobežotu piekļuvi.
