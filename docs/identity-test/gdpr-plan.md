# Identity Test — GDPR plāns (eksports, piekļuve, dzēšana)

**Statuss:** plāns — automātiska dzēšana NAV aktivizēta (`retainUntil` lauks ir shēmā, bet bez izpildes loģikas).

## Personas dati Identity Test

| Vieta | Saturs | Aizsardzība |
|---|---|---|
| `IdentityTestSubmission` | izvēlēto uzskatu ID, locale, safetyTriggered | bez e-pasta; uzskatu izvēle = sensitīva (iesp. veselība) |
| `IdentityTestResult` | e-pasts (šifrēts), portreti (šifrēti), snapshot | AES-256-GCM + emailHash |
| `IdentityEmailConsent` | e-pasts (šifrēts), piekrišanas pierādījumi | šifrēts; juridiskais pamats glabāšanai |
| `IdentityEmailDelivery` | saņēmējs (šifrēts), statusi, kļūdas | bez e-pasta satura |
| `IdentityEmailSequence` | e-pasts (šifrēts), grafiks | — |
| `IdentityContentVersion` | tikai saturs, nav personas datu | — |

Mārketinga segmentēšana pēc `safetyFlags`/`safetyTriggered` ir aizliegta koda līmenī.

## 1. Eksports (Art. 15/20)

Admin darbība (manuāla, žurnāla `data.export`):

```
GET /admin/identity-test/submissions?q=<emailHash>
```

Procedūra (iesniegt admin darbības sadaļā):
1. Aprēķina `emailHash(email)` → atrod `consents`, `sequences`, `deliveries`, `results`, `submissions`.
2. Atšifrē laukus, apkopo JSON: submissions+results (portreti, snapshot), consent vēsture, delivery statusi (bez satura).
3. `logAuditEvent({action:"data.export", resource:"identity_test"})`, lejupielāde caur admin sesiju, fails netiek glabāts serverī.
4. Identitātes verifikācija — tikai pēc e-pasta apstiprināšanas (sūta eksportu uz to pašu adresi) — novērš datu noplūdi svešai personai.

## 2. Piekļuve/korekcija

- Lietotājs var iesniegt testu atkārtoti — "korekcija" = jauns rezultāts (vēsture saglabājas kā atsevišķi ieraksti, pēc dizaina).
- Unsubscribe: jebkurš secības e-pasts; vienreizējs, bez logina.

## 3. Dzēšana (Art. 17)

Manuāla admin darbība `data.delete` (nav automātiskas):

1. `emailHash` → ierakstu saraksts.
2. Dzēš `IdentityTestResult` + `IdentityTestSubmission` (cascade: result; consent/sequence/delivery ir `onDelete:SetNull` — paliek anonimizēti ar submissionId=null, email lauki jāiztīra atsevišķi).
3. `IdentityEmailConsent`: saglabāt minimālu pierādījumu (consentTimestamp, withdrawalTimestamp) — email lauks nulles/šifrēts "deleted"; **izņēmums**: suppressijas saraksts unsubscribe gadījumā (ja lietotājs pieprasa pilnu dzēšanu, dokumentēt, ka unsubscribe vairs nevarēs tikt izpildīts — izvēle lietotājam).
4. `IdentityEmailDelivery`/`IdentityEmailSequence`: dzēst vai anonimizēt recipient laukus.
5. Audit: `data.delete` ar ierakstu skaitu (bez e-pasta).

## 4. Glabāšanas politika (priekšlikums — NAV apstiprināts)

| Dati | Ieteiktais termiņš |
|---|---|
| Submission + Result | 12 mēn. |
| Consent pierādījumi | līdz atsaukšanai + 3 gadi (jurista apstiprinājums) |
| Delivery žurnāli | 12 mēn. |
| Suppressija (unsubscribed) | beztermiņa |
| ContentVersion | beztermiņa (nav personas datu) |

`retainUntil` lauks ir shēmā — automātiskas dzēšanas job tiks iesniegts atsevišķi pēc termiņu apstiprināšanas.

## 5. Kas jāimplementē (kad apstiprināts)

- [ ] Admin "Eksportēt personas datus" poga submissions lapā (sk. §1)
- [ ] Admin "Dzēst personas datus" darbība (sk. §3)
- [ ] `retainUntil` aizpilde submission izveidē + dzēšanas cron (pēc termiņu apstiprināšanas)
- [ ] Privacy policy teksta atjauninājums ar testa datu apstrādi
