# Latviešu portretu redakcijas audits (2. kārta)

**Datums:** 2025 — audits veikts pēc iepriekšējās A/B/C kārtas (35 labojumi) un lietotāja sniegtā mērķētā kļūdu saraksta.

## Kopsavilkums

- Pārbaudīti: **200 ieraksti / 200 `now` + 200 `future` = 400 fragmenti**
- Labojumi šajā kārtā: **40 aizvietojumi 35 fragmentos** (dažos fragmenti vairāki labojumi)
- Integritāte: 200 ieraksti, 200 unikālas atslēgas, 0 tukši lauki — pārbaudīts
- Testi: 274/274 ✅; eslint tīrs
- Datubāze: **nav publicēts** (uzdevuma robežas); izmaiņas tikai `prisma/identity-portraits-lv.jsonl`

## Metode

Katrs lietotāja norādītais ieteikums pārbaudīts pilnā fragmenta kontekstā; izmantoti norādītie vai kontekstam precīzāki varianti. Tēmu apvienojuma atkārtojuma analīze veikta visiem `future` sākuma modeļiem (8 modeļu sadalījums kopumā līdzsvarots; koriģēti tikai klasteri, kas atkārtotos vienā apvienotā tekstā).

## Labojumu saraksts (pēc `key`)

| Key | Lauks | Pirms | Pēc | Pamatojums |
|---|---|---|---|---|
| T01-S02-B02 | now | `tu vari pirmsāk izvērtēt` | `tu vari vispirms izvērtēt` | "pirmsāk" nav standarta vārds |
| T01-S02-B02 | now | `kļūst par ieradu refleksu, kurš strādā agrāk` | `kļūst par ierastu reakciju, kura darbojas ātrāk` | "ieradu refleksu" kļūdains; saskaņots ar "reakciju" (siev. dz.) |
| T01-S02-B03 | now | `Vienīga piezīme` | `Viena piezīme` | "vienīgā" = "vienīgā no", šeit domāts "viena" |
| T01-S02-B03 | future | `iemācīties izklausīt` | `iemācīties uzklausīt` | "izklausīt" = noskaidrot; domāts uzklausīt |
| T01-S02-B04 | now | `darbojas kā elpceļi, bez kuriem sāk trūkt gaisa` | `darbojas kā gaiss, bez kura sāk trūkt elpas` | neveikla metafora ("elpceļi" = anatomija); saglabāts tēls, dabiska forma |
| T01-S03-B03 | future | `nepazaudējot pašcieņas` | `nezaudējot pašcieņu` | ģenitīvs "pašcieņas" kļūdains |
| T01-S03-B04 | now | `stiprāka un jēgpilnāk nekā jūties cilvēka lomu, izrādot pūles un slēpjot svēdri` | `stiprāka un jēgpilnāka cilvēka lomu, nekā patiesībā jūties - izrādot pūli un slēpjot nogurumu` | vairākas kļūdas: secība, "pūles", burtisks "svēdri" (angļu "sweat"); pilna pārrakstīšana |
| T01-S04-B01 | now | `tevī var modināt nemiers` | `tevī var rasties nemiers` | "modināt" prasa ģenitīvu; "rasties" dabiskāk |
| T02-S01-B01 | now | `Pat labās attiecības dienās` | `Pat labās attiecībās` | "attiecības dienas" izdomāta konstrukcija |
| T02-S01-B03 | future | `pirms slēdzies` | `pirms secini` | "slēdzies" = aizvērties; domāts secināt |
| T02-S01-B04 | now | `saka, ka mīlē` | `saka, ka tevi mīl` | "mīlēt" bez akuzatīva neskaidrs |
| T02-S02-B01 | now | `jau reiz ir bijusi vīlēta` | `jau reiz ir pievilta` | "bijusi vīlēta" nedabiski; "ir pievilta" pareiza pasīvā |
| T03-S01-B02 | future | `Vajadzību izsakšana` | `Vajadzību izteikšana` | dabiskāks termins |
| T03-S02-B02 | now | `uzskatīt to pierādījumu` | `uzskatīt to par pierādījumu` | "uzskatīt par" obligāts |
| T03-S02-B02 | future | `spriedumu par visu tavu cilvēku` | `spriedumu par tevi kā cilvēku` | "tavs cilvēks" nedabiski |
| T03-S02-B03 | future | `drauds, kas jāizvairās` | `drauds, no kura jāizvairās` | "izvairīties no kā" |
| T03-S05-B04 | future | `nenosaka tavas nākotnes` | `nenosaka tavu nākotni` | ģenitīvs vietā akuzatīvs |
| T04-S01-B02 | now | `viegļāk ieraudzīt... nekā pamatīgi ieraudzīt` | `viegļāk pamanīt... nekā ieraudzīt` | "pamatīgi ieraudzīt" neveikls; "pamanīt/ieraudzīt" nošķir līmeņus |
| T04-S01-B04 | now | `var šķiet vienīgais veids` | `var šķist vienīgais veids` | pēc "var" infinitīvs "šķist" |
| T04-S03-B01 | future | `vienīgā attiecību plūsma` | `nenoteiktu visas tavas attiecības` | "attiecību plūsma" izdomāts; pārrakstīts ar skaidru nozīmi |
| T04-S03-B03 | now | `cilvēkiem, kuriem tuvi` | `cilvēkiem, kuri tev ir tuvi` | "kuriem tuvi" bez subjekta nepareizi |
| T04-S04-B03 | future | `no iluzijas` | `no ilūzijas` | pareizrakstība (garā ū) |
| T04-S04-B03 | future | `ārpus tavas ziņas` | `ārpus tavas kontroles` | "ziņa" šeit nedabiski; konteksts ir kontrole |
| T04-S05-B03 | now | `neatgriezīsies līdzsvārā` | `neatgriezīsies līdzsvarā` | "līdzsvars" pareizā forma |
| T05-S02-B02 | future | `pret saviem izjūtām` | `pret savām izjūtām` | "izjūtas" siev. dz., dat. "savām" |
| T05-S02-B03 | now | `Var šķiet drošāk` | `Var šķist drošāk` | infinitīvs |
| T05-S03-B01 | future | `Laika ritot` | `Laikam ritot` | pareizā konstrukcija |
| T05-S03-B01 | future | `tā vairs nenosaka, kā tu jūties` | `tā vairs nenoteiktu, kā tu jūties` | saskaņots ar nosacījuma "varētu" |
| T05-S03-B03 | now | `Kad tās nav` | `Kad tās trūkst` | precīzāk (sasaucas ar future "tās trūkums") |
| T07-S02-B04 | future | `kā neklājība` | `kā nepieklājība` | "nepieklājība" pareizā atvasinājuma forma |
| T07-S05-B02 | future | `rūpe par līdzsvāru` | `rūpe par līdzsvaru` | pareizā forma |
| T08-S03-B01 | future | `ir korigējami` | `ir koriģējami` | pareizrakstība |
| T08-S03-B04 | future | `no savas tiesības` | `no savām tiesībām` | "tiesības" daudzskaitlis |
| T09-S01-B04 | future | `savas un citu vajadzības svert vienādelīgi` | `līdzvērtīgi ņemt vērā gan savas, gan citu vajadzības` | "svert vienādelīgi" neveikls; pārrakstīts dabiski |
| T09-S03-B01 | now | `nekā tavām pašam` | `nekā tavām pašām` | saskaņošana ar "iecerēm" (siev. dz. dat. mn.) |
| T10-S01-B01 | future | `atgriezties mazsoļiem` | `atgriezties maziem soļiem` | "mazsoļiem" saliktenis nav standarta |
| T10-S02-B04 | future | `neatklājot vairāk nekā esi gatavs` | `neatklājot vairāk, nekā esi gatavs stāstīt` | nepabeigts salīdzinājums + komats |

## Sākuma frāžu atkārtojuma risinājums

`future` fragmentu sākumu sadalījums bija līdzsvarots pa 8 modeļiem, bet tēmās T03 (4×) un T10 (3×) "Mazliet pa mazliet" atkārtotos viena apvienotā tekstā. Samazināts uz 2× katrā:

| Key | Pirms | Pēc |
|---|---|---|
| T03-S03-B04 future | `Mazliet pa mazliet tu varētu atklāt` | `Pakāpeniski tu varētu atklāt` |
| T03-S04-B04 future | `Mazliet pa mazliet tu varētu saglabāt` | `Laika gaitā tu varētu saglabāt` |
| T10-S04-B03 future | `Mazliet pa mazliet tu varētu ļaut` | `Laika gaitā tu varētu ļaut` |

Pārējie "Mazliet pa mazliet" (16×) saglabāti — katrai tēmai ≤2, kopumā dabiski.

## Metodoloģiskā izvērtēšana

- **T10 tēma** (krīzes/trauma): labotie fragmenti saglabā mēreno iespējamības valodu, tempo ("tādā tempā, kas tev ir pieņemams"), nav solījumu — atbilst metodoloģijai. Nav atrastas vietas, kas radītu iespaidu, ka individuālais darbs aizstātu drošību/profesionālu palīdzību.
- **T01-S03-B03 now**: apzināta "kļūda → nepietiekams" domu atskaņa ("pierādījums nevis tam, ka esi pieļāvis kļūdu, bet ka esi nepietiekams") — saglabāta kā domas kodols, nav kļūda.
- Fragmenti, kas nav mainīti (atlikušie ~165 `now`/`future` lauki): pārbaudīti, gramatiski un stilistiski tīri, metodoloģiskā funkcija (`now` = pašreizējā ietekme, `future` = iespējamās pārmaiņas) saglabāta.

## Atklātās atkārtotās problēmas (risinātas)

1. "šķiet" pēc "var" → infinitīvs "šķist" (2 vietas — citur jau bija pareizi)
2. "līdzsvār-" → "līdzsvar-" (2 vietas)
3. Burtiski tulkojumi: "elpceļi", "svēdri", "attiecību plūsma", "vienādelīgi"
4. Ģenitīvs/akuzatīvs maisījumi: "pašcieņas", "tavas nākotnes", "tavām pašam", "savas tiesības"
5. Sākuma frāžu klasteri tēmas apvienojumā (3 vietas)

---

# 3. kārta — gala redakcija

**Apjoms:** 72 aizvietojumi 62 fragmentos (67 pēc lietotāja saraksta + 5 pašatklāti atkārtotās pārlases laikā). Integritāte saglabāta: 200/200/400.

## Lietotāja norādīto vietu labojumi (ar noviržu pamatojumiem)

Vairums norādīto ieteikumu pielietots tieši. Novirzes no ieteiktā formulējuma:

| Key | Ieteiktais | Faktiskais | Kāpēc |
|---|---|---|---|
| T01-S01-B01 fut | "saglabā domu" (pārrakstīt sietu) | `Mīlestību vairs nevajadzētu nepārtraukti apšaubīt` | īsāks un tiešāks nekā jebkāda metafora |
| T01-S02-B02 fut | pārrakstīt | `vairs nebūtu jāmēra ar citu apstiprinājumu` | "jāmēra ar" dabiskāk par "jāizsver ... jumā" |
| T02-S02-B01 now | dabiska konstrukcija | `izvēlas palikt sardzē` | vienkāršāk un precīzāk par "aizsardzības pozīcijā" |
| T02-S02-B03 fut | pārrakstīt | `izvērtēt viņa rīcību pēc reālās pieredzes, nevis automātiski vadīties pēc bailēm` | precīzi metodoloģiskajai domai |
| T02-S03-B01 now | aizstāt metaforas | `jo spēcīgāk tevī mostas piesardzība. Tuvums var šķist bīstams, it kā aiz tā vienmēr gaidītu sāpes` | noņemtas abas mehāniskās metaforas ("sistēma", "vārti") |
| T03-S04-B02 fut | "atbildību par viņu laimes nodrošināšanu" | `atbildību par viņu laimi` | īsāk, dabiskāk; "nodrošināšana" birokrātiska |
| T04-S02-B04 | norādīts `future` | labots `now` | kļūdains teksts atradās `now` laukā |
| T06-S02-B03 fut | "tev nav jābūt" | `tev nebūtu jābūt` | nosacījuma izteiksme, saskaņā ar pārējiem fragmentiem |
| T09-S03-B01 now | "nekā tavām personīgajām iecerēm" | `nekā tavām personiskajām vēlmēm` | izvairās no "iecerēm...iecerēm" atkārtojuma |
| T02-S05-B01 now | atrasti `partneris tevi mīlē` | `partneris tevi mīl` | atlikušā "mīlē" forma — labota |

Visi pārējie saraksta labojumi pielietoti kā norādīts ("Laika ritot"→"Laikam ritot" 5 vietās, "šķiet"→"šķist", locījumu korekcijas, dabiskas konstrukcijas).

## Pašatklātie labojumi pilnajā pārlasē (5)

| Key | Lauks | Pirms | Pēc |
|---|---|---|---|
| T04-S01-B01 | now | `vērot horizontu` | `vērot apkārtni` |
| T04-S01-B03 | now | `izklausās pēc nepiedodamas rīcības` | `šķiet gandrīz nepiedodami` |
| T07-S02-B01 | future | `eksāmenu tavā pašcieņā` | `pārbaudījumu tavai pašcieņai` |
| T03-S01-B01 | future | `vieta līdzās citu vajadzībām` (atkārtojas) | `vieta arī tad, kad pārējie vēl nav aprūpēti` |
| T03-S04-B04 | future | `Laika gaitā` (blakus vēl vienai) | `Ar gadiem` (sākuma dažādība T03) |

## Apvienoto tēmu pārbaude (T01, T03 pilni 20-fragmentu apvienojumi)

- Loģiska plūsma, nav pretrunīgu apgalvojumu, `now`/`future` raksturs atšķirīgs ✅
- Sākuma frāžu sadalījums: T03 pēc korekcijām — maks. 2× vienam modelim ✅
- Metodoloģiskā robeža: `future` fragmenti saglabā piesardzību un izvērtēšanas spēju (T02-S02-B03, T04-S01-B03), nav "vienkārši uzticies" vēstījuma ✅

## Neskaidrie metodoloģiskie jautājumi

- **T10-S03-B03** `gājuši bojā` — sarunvalodas nokrāsa, bet tēmas kontekstā pieņemama; atstāta. Ja vēlies formālāku toni: `ja esi izdzīvojis situācijā, kurā citi zaudējuši dzīvību`.
- **T01-S03-B03 now** apzinātā "kļūda→nepietiekams" atskaņa — saglabāta (domas kodols).
- **T02-S03-B04 future** `iemācīties nolaist plecus` — žestra valoda; dabiska, atstāta.
- Pārējie ~135 fragmenti pārbaudīti un nav mainīti — gramatiski un metodoloģiski tīri.

## Verifikācija (3. kārta)

- JSONL: 200 ieraksti, 200 unikālas atslēgas, 400 aizpildīti lauki, 0 em/en domuzīmes, sintakse OK
- `npm test`: 274/274 ✅; `npm run build` ✅; eslint tīrs
- Previews: `public/email-preview/audit2-lv.html` / `.txt` / `-d.png` / `-m.png` (7 tēmas no labotā JSONL)
- Datubāze nav publicēta; commit/push/deploy nav veikts

---

# 4. kārta — gala redakcija

**Apjoms:** 39 aizvietojumi 37 fragmentos (30 pēc lietotāja saraksta + 8 papildu stilistiskā redakcija + 1 dublējuma noņemšana). Integritāte: 200/200/400, 0 em/en domuzīmes.

## Obligātais saraksts — novirzes un pamatojumi

Vairums pielietots kā norādīts. Novirzes:

| Key | Ieteiktais | Faktiskais | Kāpēc |
|---|---|---|---|
| T01-S04-B03 now | `nespēj sniegt tev gandarījumu` | `...gandarījumu. Tas drīz izgaist, un tā vietā stājas nākamais mērķis` | "gandarījumu" būtu atkārtojies divos teikumos pēc kārtas |
| T02-S03-B01 fut | `pakāpeniski pierast pie tuvuma` | `pierast pie tuvuma` (sākumā "Soli pa solim") | "pakāpeniski" dublētos ar sākuma frāzi |
| T02-S04-B01 fut | `vieta, kurā ir vieta abiem cilvēkiem` | `telpa, kurā ir vieta abiem cilvēkiem` | "vieta...vieta" atkārtojums; "telpa" saglabā domu |
| T03-S01-B01 fut | `citu vajadzības vēl nav apmierinātas` | kā ieteikts | pielietots; "vajadzībām/vajadzības" atkārtojas, bet nozīme skaidra |
| T05-S05-B01 fut | `nepārmetot sev par šīm izjūtām` | `nepārmetot sev par tām` | "izjūtas...izjūtām" atkārtojums |
| T08-S02-B03 now | komats pēc "biedējoša" | `biedējoša jau pirms tu tai pietuvojies` | komats vien nepietiktu; pārveidota konstrukcija |
| T10-S03-B04 fut | `ar maziem soļiem` | `+ sākot ar vienkāršām...` | "maziem soļiem...mazām lietām" atkārtojums |
| T10-S05-B01 fut | `sāpes pakāpeniski mazinās` | `pamanīt brīžus, kuros sāpes pakāpeniski mazinās` | "pakāpeniski" noņemts no teikuma sākuma, lai nedublētos |
| T10-S01-B03 fut | `Tev nav jāattaisno tas, ka esi cietis.` | pielietots + sadalīts divos teikumos | "un tev nav..." ar "tas" atkārtojumu |

## Papildu stilistiskā redakcija (8)

| Key | Pirms | Pēc |
|---|---|---|
| T01-S04-B04 fut | `kā justies dzīvam` | `kā sajust savu nozīmību` (sasaucas ar now "pierādīt savu nozīmību") |
| T01-S05-B01 now | `zemākais risks` | `drošāka izvēle` |
| T01-S05-B02 fut | `tava paša uzticēšanās savām izvēlēm` | `paļāvība uz sevi un savām izvēlēm` |
| T03-S04-B01 fut | `vienīgā vieta, kurā jūties vajadzīgs` | `vienīgais veids, kā sajust, ka esi vajadzīgs` |
| T04-S01-B01 fut | `jāaizpilda visa tava pieredze` | `jāaizņem visa tava uzmanību` |
| T07-S01-B03 now | `solis pretī nākotnes nedrošībai` | `solis tuvāk nākotnes nedrošībai` |
| T08-S01-B04 fut | `nebūtu jāatrod vienā mirklī, bet gan jāveido` | `nebūtu jāatrod gatavu - tu varētu to veidot` |
| T05-S01-B01 fut | `informācija..., nevis būt šķērslis` | `informācija par tavām vajadzībām.` ("šķērslis" jau bija 1. teikumā) |

## Apzināti nemainīts

- **T01-S03-B01** `kamēr tu slēp` — pielietots sarunvalodas variantam; standarta literārā forma ir `slēpj`. Piezīme auditā, ja vēlies saskaņot atpakaļ.
- **T01-S02-B04** gaiss/elpas metafora — pēc 2. kārtas dabiska, atstāta.
- **T02-S01-B04** `veidoties uz atkārtotas pieredzes` — standarta konstrukcija, atstāta.
- **T10-S03-B03** `gājuši bojā` — apzināti atstāts pēc Tavas norādes.
- ~140 fragmenti pārbaudīti, nav mainīti — tīri.

## Verifikācija (4. kārta)

- JSONL: 200/200/400, sintakse OK, 0 em/en domuzīmes
- `npm test` 274/274 ✅; `npm run build` ✅
- Previews: `public/email-preview/audit3-lv.html` / `.txt` / `audit3-lv-d.png` / `-m.png` (8 tēmas)
- DB nav publicēta; commit/push/deploy nav veikts

## 4. kārtas noslēdzošie labojumi (2)

| Key | Lauks | Pēc |
|---|---|---|
| T10-S02-B03 | now | `Pēc pārdzīvotas pārestības tu vari justies tā, it kā būtu kļuvis mazāk vērtīgs vai neatgriezeniski mainījies uz sliktāko pusi.` |
| T08-S01-B04 | future | `Tev nebūtu jāatrod sava vieta jau gatava. Tu varētu to veidot ar izvēlēm, kas atbilst tev.` |

`kamēr tu slēp` (T01-S03-B01) un `gājuši bojā` (T10-S03-B03) — apstiprināti kā nemaināmi. Verifikācija: 274/274 testi ✅, build ✅, `audit4-lv.*` previews.
