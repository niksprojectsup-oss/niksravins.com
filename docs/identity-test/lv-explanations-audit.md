# Identity Test — LV skaidrojumu audits

Datums: 2025 (DEV stāvoklis). Avots: `src/content/i18n/lv.ts` (`identityTest`) + DEV `IdentityContentTranslation` (publishedValue, locale=lv).
Secība: ekrānu plūsma, kādā lietotājs tekstus redz. Izslēgts: uzskatu apgalvojumi, portretu fragmenti, e-pasta veidnes, admin teksti, Header/Footer (vietnes apvalks).

---

## 1. SEO / lapas meta (nav redzams testā, bet lietotājam redzams pārlūkā/SERPs)

Avots: `src/content/i18n/lv.ts` → `identityTest.seo`

| ID | Teksts |
|---|---|
| seo.title | Identitātes tests - Niks Ravins |
| seo.description | Atzīmē iekšējos uzskatus, kuros atpazīsti sevi, un saņem divus personalizētus portretus: kā šie uzskati ietekmē tavu ikdienu un kā varētu izskatīties dzīve pēc darba ar tiem. |

## 2. Ievada ekrāns (`step = intro`)

Avots: `src/content/i18n/lv.ts` → `identityTest.intro`

| ID | Teksts |
|---|---|
| intro.title | IERAUGI, KAS TEVI VADA. |
| intro.subtitle | Tavi iekšējie uzskati. Tava ikdiena. Tavas attiecības. |
| intro.lead | Atzīmē apgalvojumus, kuros atpazīsti sevi. Izvēlies tos, kuri visprecīzāk raksturo tavas domas, reakcijas vai ierasto rīcību. |
| intro.note | Nav jāizvēlas visi. Izvēlies tikai tos, kuri tev patiešām šķiet atbilstoši. |
| intro.startCta | Sākt testu |

## 3. Progresa soļu nosaukumi

Avots: `src/content/i18n/lv.ts` → `identityTest.steps`

`Ievads` → `Tēmas` → `Uzskati` → `Pārskats` → `E-pasts`

## 4. Tēmu ekrāns (`step = themes`)

### 4a. UI teksti

Avots: `src/content/i18n/lv.ts` → `identityTest.themeStep`

| ID | Teksts |
|---|---|
| themeStep.heading | Izvēlies vienu tēmu vai apskati visas. |
| themeStep.allThemes | Apskatīt visas tēmas |
| themeStep.next | Turpināt |
| themeStep.back | Atpakaļ |

### 4b. Tēmu nosaukumi un apraksti (DB: `IdentityContentTranslation`, entityType=THEME, field=name/description, locale=lv, sortOrder secībā)

| Slug | name | description |
|---|---|---|
| self-worth | Pašvērtība un identitāte | Uzskati par to, vai esi pietiekami labs un pelnījis mīlestību tāds, kāds esi. |
| relationships | Attiecības, tuvība un piesaiste | Modeļi, kā tuvinies, uzticies un paliec attiecībās. |
| family | Ģimene, bērnība un vecāku ietekme | Kā agrīnā ģimenes pieredze joprojām veido tavas izvēles. |
| safety-control | Drošība, kontrole un bailes | Uzskati par drošību, kontroli un to, kas var notikt. |
| emotions | Emocijas un iekšējā pasaule | Kā tu attiecies pret savām jūtām un iekšējo pieredzi. |
| work-career | Darbs, karjera un pašrealizācija | Uzskati par vērtību, sasniegumiem un redzamību darbā. |
| money | Nauda, materiālā drošība un labklājība | Attieksme pret naudu, pelnīšanu un tiesībām uz labklājību. |
| meaning-choices | Dzīves jēga, pārmaiņas un izvēles | Uzskati par jēgu, lēmumiem un tiesībām dzīvot savu dzīvi. |
| boundaries-agency | Robežas, vara un atbildība | Tiesības teikt nē, aizstāvēt sevi un noteikt savu dzīvi. |
| crisis-trauma | Krīzes, traumatiska pieredze un smagi dzīves notikumi | Uzskati, kas veidojušies smagu notikumu un drošības pieredzēs. |

## 5. Uzskatu ekrāns (`step = beliefs`)

### 5a. UI teksti

Avots: `src/content/i18n/lv.ts` → `identityTest.beliefStep`

| ID | Teksts |
|---|---|
| beliefStep.selectedSuffix | izvēlēti |
| beliefStep.next | Turpināt |
| beliefStep.back | Atpakaļ |

### 5b. Apakštēmu nosaukumi (DB: entityType=SUBCATEGORY, field=name, locale=lv; grupēti pa tēmām sortOrder secībā)

**self-worth**
- s01: Nepietiekamība un mazvērtība
- s02: Ārējais apstiprinājums un pieņemšana
- s03: Kauns un sevis slēpšana
- s04: Sasniegumi un pašvērtība
- s05: Identitāte un tiesības būt sev

**relationships**
- s01: Pamešana un emocionālā nedrošība
- s02: Uzticēšanās, greizsirdība un kontrole
- s03: Tuvības bailes un emocionāla nepieejamība
- s04: Pielāgošanās, vajadzības un robežas
- s05: Konflikti, pašsabotāža un mīlestības pieredze

**family**
- s01: Emocionāla nevērība un nepiepildītas vajadzības
- s02: Kritika, kauns un bailes kļūdīties
- s03: Nosacīta mīlestība un pieņemšana
- s04: Priekšlaicīga atbildība un ģimenes lomas
- s05: Vaina, lojalitāte un ģimenes noteikumi

**safety-control**
- s01: Pastāvīga apdraudējuma sajūta
- s02: Kontrole un vajadzība visu paredzēt
- s03: Uzticēšanās un paļaušanās
- s04: Bailes no zaudējuma un neveiksmes
- s05: Bezspēcība un rīcībspēja

**emotions**
- s01: Emociju apspiešana un noliegšana
- s02: Kauns un ievainojamība
- s03: Emocionāla atkarība un ārējs apstiprinājums
- s04: Emocionāla noslēgšanās un izvairīšanās
- s05: Pašpārmetumi un iekšējs konflikts

**work-career**
- s01: Pašvērtība un sasniegumi
- s02: Perfekcionisms un bailes kļūdīties
- s03: Redzamība un atzinība
- s04: Vilcināšanās un šaubas par sevi
- s05: Pārslodze un identitāte darbā

**money**
- s01: Trūkuma domāšana
- s02: Pel­nīšana un saņemšana  ⚠ satur neredzamu SOFT HYPHEN (U+00AD) starp "Pel" un "nīšana"; avots `prisma/identity-test-content.json` rinda ~399 → DEV DB
- s03: Ģimenes pārliecības un vaina
- s04: Risks un finanšu lēmumi
- s05: Saņemšana, tērēšana un pašierobežošana

**meaning-choices**
- s01: Jēga un virziens
- s02: Bailes no pārmaiņām
- s03: Izvēles un lēmumi
- s04: Pagātne un nožēla
- s05: Dzīvošana tagadnē

**boundaries-agency**
- s01: Personīgās robežas un tiesības atteikt
- s02: Bailes no konflikta un citu reakcijām
- s03: Vara, kontrole un bezspēcība
- s04: Atbildība, vaina un pienākums
- s05: Pašcieņa un pašnoteikšanās

**crisis-trauma**
- s01: Fiziska vardarbība un ķermeņa drošība
- s02: Seksuāla vardarbība un ķermeņa autonomija
- s03: Karš, dzīvības apdraudējums un izdzīvošana
- s04: Smags zaudējums, bezcerība un nomāktība
- s05: Paškaitējums, pašnāvības domas un tiesības dzīvot

## 6. Pārskata ekrāns (`step = review`)

Avots: `src/content/i18n/lv.ts` → `identityTest.review`

| ID | Teksts |
|---|---|
| review.heading | Tava izvēle |
| review.subheading | Pārskati atzīmētos apgalvojumus - vari labot, ja vajag. |
| review.submitCta | Saņemt manu personīgo rezultātu |
| review.back | Atpakaļ |

## 7. E-pasta ekrāns (`step = email`)

### 7a. UI teksti

Avots: `src/content/i18n/lv.ts` → `identityTest.emailStep`

| ID | Teksts |
|---|---|
| emailStep.heading | Uz kuru e-pastu nosūtīt rezultātu? |
| emailStep.lead | Nosūtīsim abus tavus personalizētos portretus: |
| emailStep.lead1 | 1. Kā izvēlētie uzskati var ietekmēt tavu ikdienu, emocijas un attiecības. |
| emailStep.lead2 | 2. Kā varētu izskatīties tava dzīve pēc darba ar šiem uzskatiem. |
| emailStep.privacyNote | E-pasta ievade ir nepieciešama rezultāta piegādei. |
| emailStep.emailLabel | E-pasta adrese |
| emailStep.emailPlaceholder | tavs@epasts.lv |
| emailStep.submitCta | Nosūtīt manu rezultātu |
| emailStep.sendingLabel | Sūta… |

### 7b. Mārketinga piekrišana

Avots: DB `CONSENT_TEXT`, entityId=`marketing-consent`, field=`label`, locale=lv

> Vēlos saņemt turpmākus e-pastus ar materiāliem par iekšējo uzskatu darbu un individuālām sesijām (var atteikties jebkurā brīdī).

## 8. Apstiprinājuma ekrāns (`step = done`)

Avots: `src/content/i18n/lv.ts` → `identityTest.confirmation`

| ID | Teksts |
|---|---|
| confirmation.heading | Rezultāts ir ceļā |
| confirmation.body | Tavs personīgais rezultāts ir nosūtīts uz norādīto e-pasta adresi. |
| confirmation.spamNote | Lūdzu, pārbaudi arī mēstuļu mapi. |
| confirmation.sessionLead | Ja šajā aprakstā atpazini savus ikdienas modeļus, iespējams, ir pienācis laiks pievērsties uzskatiem, kas tos uztur. Individuālā sesijā varam izpētīt, kuri no šiem uzskatiem tev ir būtiskākie un kā ar tiem strādāt. |
| confirmation.sessionCta | Pieteikties individuālai sesijai |

*(LV locale `sessionLead`/`sessionCta` ekrānā `done` netiek rādīti — `IdentityTestFlow` paslēpj sesijas bloku LV; teksti saglabāti koda konstantē.)*

## 9. Krīzes teksts

### 9a. UI teksts (ja izvēlēts sensitīvs uzskats — drošības brīdinājuma konteksts)

Avots: `src/content/i18n/lv.ts` → `identityTest.crisis`

| ID | Teksts |
|---|---|
| crisis.heading | Atbalsts ir pieejams |
| crisis.body | Šis tests nav krīzes izvērtēšanas instruments. Ja tu vai kāds tuvinieks atrodies tūlītējā apdraudējumā, zvani 112 vai 113. Mēs iesakām sazināties ar uzticamu cilvēku un kvalificētu krīzes vai veselības aprūpes speciālistu. |

### 9b. Drošības bloks e-pastā (ja rezultātā ietilpst safety-flagged uzskats)

Avots: DB `SAFETY_TEXT`, entityId=`crisis-block`, field=`body`, locale=lv

> Ja atklāti par to, ko piedzīvoji, rodas pārņemošas sajūtas - Tev nav jāpaliek ar tām vienam. Ja ir domas par paškaitējumu vai tu jūties briesmās - zvani 112 vai 113, vai sazinies ar uzticamu cilvēku. Tavas izjūtas ir reālas, un palīdzība ir pieejama.

## 10. Slēgtās piekļuves ekrāns (beta vārti)

Avots: `src/content/i18n/lv.ts` → `identityTest.closed` (komponents `IdentityTestClosedNotice`)

| ID | Teksts |
|---|---|
| closed.heading | Tests šobrīd ir pieejams tikai uzaicinātiem testētājiem. |
| closed.body | Identity Test pašlaik darbojas slēgtā beta režīmā. Ja esi saņēmis personīgu uzaicinājuma saiti, atver to, lai sāktu. |

## 11. Kļūdu teksti

Avots: `src/content/i18n/lv.ts` → `identityTest.errors`

| ID | Teksts |
|---|---|
| errors.generic | Radās kļūda. Lūdzu, mēģini vēlreiz. |
| errors.invalidEmail | Lūdzu, ievadi derīgu e-pasta adresi. |
| errors.sendFailed | Rezultātu neizdevās nosūtīt. Lūdzu, mēģini vēlreiz. |
| errors.retry | Mēģināt vēlreiz |

## 12. Citi

Avots: `src/content/i18n/lv.ts`

| ID | Teksts |
|---|---|
| languageSwitcherLabel | Izvēlēties valodu |

## 13. Savienotājfrāzes (DB: CONNECTOR, locale=lv)

Tiek iekomponētas snapshot agregātu portretu tekstos (`composePortraits`); pašreizējā tēmu-veidnē e-pastā netiek rādītas, bet glabājas vēsturisko rezultātu snapshotos.

| Atslēga | Veids | Teksts |
|---|---|---|
| opening | OPENING | Paldies, ka veltīji laiku šai izpētei. Zemāk - uzmanīgs apraksts par to, kā izvēlētie uzskati var izpausties ikdienas dzīvē. Tas nav diagnoze un ne spriedums - tikai spogulis, kas palīdz pamanīt modeļus, kuri varbūt jau sen darbojas fonā. |
| join-similar | JOIN_SIMILAR | Tas bieži savienojas ar līdzīgu izjūtu: |
| join-contrast | JOIN_CONTRAST | Reizēm tas izpaužas arī savādāk: |
| transition | TRANSITION | Un tagad - kā tava dzīve varētu izskatīties, ja šie uzskati vairs nenoteiktu tavas izvēles. Tas nav solījums un ne pozitīvs apgalvojums - tikai iespēja, kuru vari izpētīt savā tempā. |
| closing | CLOSING | Ja kāds no šiem aprakstiem šķita pazīstams, tas nozīmē, ka esi sācis pamanīt savus modeļus - un pamanīšana pati par sevi jau ir virzība uz izvēles brīvību. |
| closing-future | CLOSING | Šīs izmaiņas nenotiek vienu dienu - tās veidojas mazos, atkārtotos soļos. Katrs brīdis, kad pamanī veco modeli un izvēlies ko citu, ir reāla pārmaiņa, un tā pieder tev. |

---

## Novērojumi (nav labojumu — tikai konstatācijas)

1. **SOFT HYPHEN (U+00AD)** `SUBCATEGORY` `money/s02` name: `Pel\xadnīšana un saņemšana` — neredzama rakstzīme, avots `prisma/identity-test-content.json` (~399. rinda) → DEV DB. Kārtējamā teksta vizuāli "Pelnīšana", bet saturs satīrs. Ne labots — atzīmēts labošanai.
2. `identityTest.confirmation.sessionLead/sessionCta` LV ekrānā `done` netiek rādīti (CTA slēpts LV) — teksti pastāv koda konstantē, bet lietotājam neparādās.
3. `emailStep.sendingLabel` satur ellipsis rakstzīmi `…` (viena rakstzīme, nevis trīs punkti) — stilistiski konsekventi.
4. Visi DB teksti nāca no `publishedValue` (DEV); LV testa plūsmā `localeFallbackChain` ir `lv → en → lv`, t.i. trūkstošs LV lauks kristu atpakaļ uz EN.
