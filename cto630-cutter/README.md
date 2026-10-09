# CTO630 vinila griezējs

Darbvirsmas programma vinila uzlīmju griešanai ar Creation PCUT **CTO630**. Tā ielādē SVG, parāda dizainu uz vinila lapas, ļauj mainīt izmēru milimetros, pozīciju un rotāciju, un nosūta kontūras ploterim kā HP-GL komandas.

Pēc noklusējuma ieslēgts **simulators** un rūtiņa **Dry run**. Kamēr Dry run ir ieslēgts, CUT un TEST CUT neatver COM portu un uz reālu ploteri netiek sūtīts neviens baits.

Fizisks grieziens ar šo versiju **nav pārbaudīts**. Simulators un testi pārbauda SVG, ģeometriju un HP-GL tekstu, nevis nazi uz vinila.

## Ko programma dara

1. Atver lietotni.
2. Ielādē SVG.
3. Parāda dizainu uz vinila laukuma.
4. Maina izmēru milimetros, pozīciju un rotāciju.
5. Izvēlas vinila lapas izmēru.
6. Pieslēdzas CTO630 caur USB seriālo portu vai paliek pie simulatora.
7. Nospiež CUT.
8. Pārvērš kontūras plotera komandās un nosūta tās.
9. Rāda progresu. STOP pārtrauc sūtīšanu.

Atbalstītie SVG elementi: `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`. Transformācijas: `translate`, `scale`, `rotate`, `matrix`. Ja figūrai ir aizpildījums bez līnijas, tiek griezta aizpildījuma kontūra. Rastra attēlu programma atsaka.

Ekrāna vienība ir milimetri. Iekšēji arī tiek lietoti milimetri kā decimāldaļskaitļi.

## Instalēšana

Nepieciešams Python 3.12 vai jaunāks.

```bash
cd cto630-cutter
python -m venv .venv
```

Windows:

```bat
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Linux un macOS (simulators; tā pati programma):

```bash
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Testi:

```bash
python -m pytest
```

Bez displeja (pārbaude, ka logs vispār paceļas):

```bash
QT_QPA_PLATFORM=offscreen python app.py
```

## Simulatora režīms

Ierīču saraksta pirmā rinda ir **Simulator**. Tas ir drošais režīms bez kabeļa.

- CUT vai TEST CUT uzģenerē tās pašas HP-GL komandas, ko draiveris nosūtītu uz portu.
- Fails tiek ierakstīts `output/test_job.hpgl` (darba mapē, no kuras palaid `python app.py`).
- Žurnālā redzams komandu skaits un koordinātu rāmis milimetros.
- Progress iet pa kontūrām: `Path N / M`.

Pirms īsta grieziena atver šo failu un pārliecinies, ka tajā ir tikai `IN`, `PU`, `PD` un `PA`, ja vien JSON konfigurācijā apzināti neesi ielicis pārbaudītu ātruma vai spiediena komandu.

## Dry run

Plotera panelī, virs pogām TEST CUT un CUT, ir rūtiņa **Dry run**. Pēc noklusējuma tā ir ieslēgta. Šis režīms netiek saglabāts `settings.json` un nemaina `units_per_mm`, asu zīmes, ātrumu, spiedienu, `IN` vai STOP.

- Nospied **TEST CUT** vai **CUT**.
- Atveras logs ar ģenerēto HP-GL tekstu.
- Tajā ir rinda `Bytes sent to a physical port: 0` un `COM port opened: no`.
- Simulators joprojām ieraksta `output/test_job.hpgl`.
- Ja ierīču sarakstā ir COM ports, **Connect** to neatver, kamēr Dry run ir ieslēgts.
- Lai sūtītu uz ploteri, noņem Dry run, izvēlies COM portu un nospied Connect.

## SVG, izmērs un pozīcija

**Open SVG** ielādē failu. Žurnāls parāda izmēru un kontūru skaitu. Kreisajā panelī:

- Width / Height — izmērs milimetros pirms rotācijas. Lock proportions saglabā SVG proporciju.
- X / Y — jau pagrieztā rāmja apakšējais kreisais stūris, milimetros no lapas sākuma.
- Rotation — grādi. Pozitīvs virziens ir pretēji pulksteņrādītāja virzienam.
- Center horizontally / vertically — novieto dizainu vinila lapas vidū.
- Vinila platums un garums — lapas izmērs priekšskatījumā un pārbaudē pirms sūtīšanas.

Priekšskatījumā var vilkt dizainu ar peli, tuvināt ar ritenīti un bīdīt skatu ar vidējo pogu. Zīmējums, ko redzi, ir tās pašas līnijas, kas tiks grieztas.

Līknes tiek sadalītas nogriežņos ar pielaidi 0.1 mm (maināma iestatījumos). Ceļi, kuru gali jau ir tuvu (0.05 mm), tiek savienoti, lai būtu mazāk tukšo gājienu. Figūras forma netiek pārzīmēta.

Ja fails satur `<image>` vai citu rastra attēlu, parādās kļūda: «Šis fails satur rastra attēlu. CTO630 var griezt tikai vektora kontūras.» Python izsaukumu steks lietotājam netiek rādīts.

## Testa grieziens

**TEST CUT** izgriež kvadrātu no sākumpunkta `(0, 0)`. Malas garums pēc noklusējuma ir 20 mm, lauks «Test cut mm» to maina. Kvadrāts nav saistīts ar ielādēto SVG. Arī tas tiek pārbaudīts pret vinila un plotera izmēru.

Uz īsta plotera kvadrāta sākums ir tas sākumpunkts, ko esi uzstādījis uz iekārtas paneļa.

## Īstais CUT

Poga CUT vispirms pārbauda:

1. Ir izvēlēts simulators vai atvērts COM ports.
2. Dizains ievietojas vinila laukumā un plotera limitā (CT630 rokasgrāmatā: platums 640 mm, garums 20 000 mm; abi skaitļi ir konfigurējami).
3. Ja neievietojas, tiek parādīta kļūda un nekas netiek sūtīts.

Pēc tam ir kopsavilkums ar faila vārdu, izmēru, pozīciju, vinilu un kontūru skaitu. Tikai **CUT** šajā logā sāk sūtīšanu. Progress rāda procentus un `Path N / M`.

## Kā pieslēgt CTO630

1. Uzstādi ražotāja USB seriālo draiveri (rokasgrāmatā USB parādās kā COM ports, bieži COM3). Bez draivera Windows ierīču pārvaldniekā porta nebūs.
2. Ieslēdz ploteri un pārliecinies, ka ekrānā ir **On Line**. Bez tiešsaistes iekārta datus nepieņem.
3. Ar paneļa bultiņām aizved nazi tur, kur jāsākas darbs, un nospied sākumpunkta pogu. Programmas `(0, 0)` ir šis sākumpunkts, nevis fiksēts lapas stūris.
4. Ātrumu un naža spiedienu uzstādi uz plotera paneļa. Bieži lietotā sākuma vērtība rokasgrāmatā ir ātrums ap 50 un spiediens ap 100–120. Programmas lauki Speed un Force šos skaitļus tikai saglabā. **Uz portu tie netiek sūtīti.**
5. Programmā nospied **Refresh**, izvēlies COM portu (nevis Simulator) un **Connect**. Pieslēgšanās tikai atver portu. Neviena komanda vēl netiek sūtīta.
6. Statusam jābūt `Status: ● Connected`.
7. Vispirms **TEST CUT**, nomēri kvadrātu ar lineālu. Tikai tad griez dizainu.

Noklusējuma seriālie parametri, kurus var mainīt ar **Settings...**:

| Parametrs | Noklusējums | Piezīme |
| --- | --- | --- |
| Baud | 9600 | Rokasgrāmata min 300, 600, 1200, 4800, 9600, 19200. 9600 nav apstiprināts kā rūpnīcas noklusējums. |
| Datu biti | 8 | Rokasgrāmatā vārda garums ir 8 biti. |
| Paritāte | None | Tabulā rokasgrāmatā paritāte un stopbits ir sajaukti. 8N1 ir maināms pieņēmums. |
| Stopbits | 1 | Skatīt iepriekšējo rindu. |
| Plūsmas vadība | None | Portā ir RTS/CTS un DTR/DSR vadi. Ja darbs neaiziet, pamēģini RTS/CTS vai DTR/DSR. |

Iestatījumi tiek saglabāti:

- Windows: `%APPDATA%\CTO630Cutter\settings.json`
- Linux: `~/.config/CTO630Cutter/settings.json`
- macOS: `~/Library/Application Support/CTO630Cutter/settings.json`

Rūpnīcas kopija ir `config/default_settings.json`.

## USB un COM diagnostika

Ja parādās «Neizdevās pieslēgties CTO630»:

- Vai USB kabelis ir iesprausts ploterī un datorā, un ploteris ir ieslēgts.
- Vai Windows Device Manager rāda COM portu. Ja redzi tikai «Unknown device», vajag PCUT USB seriālo draiveri no ražotāja diska, nevis jaunu HP-GL komandu.
- Vai programmā izvēlētais ports ir tieši tas, ko rāda Device Manager. Pēc pārstartēšanas numurs mēdz mainīties — nospied Refresh.
- Vai cits programma (SignCut, Corel, terminālis) jau netur šo portu vaļā.
- Vai baud, datu biti, paritāte, stopbits un plūsmas vadība sakrīt ar to, ko sagaida iekārta. Sāc ar 9600 8N1 un bez plūsmas vadības. Ja rakstīšana uzkaras vai ploteris klusē, pārslēdz plūsmu uz RTS/CTS un pēc tam uz DTR/DSR.
- Vai ploteris ir On Line. Off Line stāvoklī tas klausās paneli, nevis datoru.
- Simulators šo ķēdi neizmanto. Ja simulators strādā, bet COM nē, problēma ir kabelis, draiveris, ports vai seriālie parametri, nevis SVG.

## STOP

Rokasgrāmatā nav drošas, pārbaudītas STOP komandas, ko drīkstētu sūtīt pa kabeli. Tāpēc **STOP nesūta nevienu papildu baitu**. Programma uzreiz pārstāj rakstīt portā.

Tas, kas jau ir operētājsistēmas vai plotera buferī, var turpināt griezt. Lai apturētu galvu, nospied **PAUSE** uz plotera. **RESET** notīra iekārtas buferi un no jauna inicializē sākumpunktu. Programma šīs pogas nospiest nevar.

## Sūtīšanas statuss

Šajā protokolā ploteris darbu neapstiprina. Ja Python seriālais slānis pieņem visus baitus un `flush` neizdod kļūdu, statuss ir **SENT**. Tas nav COMPLETED un nav fiziski pabeigts grieziens. Žurnāls pasaka, ka griezējs darbu nav apstiprinājis.

Ja `write` atgriež mazāk baitu nekā nosūtīts, iestājas taimauts, ports nav atvērts, vai `flush` neizdodas vai uzkaras, statuss ir **FAILED** vai **INCOMPLETE**. Žurnālā ir trīs atsevišķi fakti: paredzētais baitu skaits, baiti, ko pieņēma Python seriālais slānis, un kļūdas teksts.

Nezināma `flow_control` vērtība pieslēgšanos aptur ar kļūdu. Tā netiek klusējot uzskatīta par režīmu bez plūsmas vadības. Ja plūsmas vadība ir ieslēgta un līnija bloķējas, `flush` tiek ierobežots laikā un darbs netiek atzīmēts kā SENT.

## Kas ir pārbaudīts HP-GL un kas vēl ir TODO

PCUT sērijas rokasgrāmata (modeļi CT630, CT760, CT900, CT1080, CT1200) saka, ka plotera valoda ir **HP-GL un DM-PL ar automātisku atpazīšanu**, savienojums ir RS-232 vai USB 1.0 kā COM ports, vārda garums ir 8 biti, un CT630 maksimālais griešanas platums ir 640 mm, garums 20 000 mm. Ātrums un naža spiediens tiek mainīti uz paneļa. Sākumpunktu uzstāda operators. Šī programma CTO630 uztver kā šīs sērijas iekārtu. Ja uz korpusa ir cits pilnais modeļa kods, pirms griešanas salīdzini platumu.

Komandas, ko programma sūta, ir parastais HP-GL, piemēram:

```text
IN;
PU;
PA0,0;
PD;
PA800,0;
PU;
```

`PA` koordinātas ir veseli skaitļi. Noklusējums ir 40 vienības uz milimetru (HP-GL solis 0.025 mm). Tas **nav** nolasīts no CTO630 rokasgrāmatas.

Vēl nav pārbaudīts uz īsta CTO630, tāpēc programma to neizdomā un pēc noklusējuma nesūta:

| Jautājums | Kur tas stāv | Ko programma dara tagad |
| --- | --- | --- |
| Vai `IN;` ir vajadzīgs | `plotter.emit_initialize` | Sūta `IN;`, jo tā ir standarta HP-GL inicializācija. Var izslēgt JSON laukā. |
| Ātruma un spiediena operkods | `speed_command`, `force_command` | Tukši. Netiek sūtīts nekas. Neliec tur minējumus. |
| Aparatūras STOP | — | Netiek sūtīts. STOP tikai aptur rakstīšanu. |
| USB handshake | — | Tiek tikai atvērts COM ports. Zondes komanda netiek sūtīta. |
| Vienības un asu virziens | `units_per_mm`, `x_sign`, `y_sign` | 40 vienības/mm, abas asis `+1`. Y augšup ir pieņēmums. |

Šie lauki ir `config/default_settings.json` un lietotāja `settings.json`. Iestatījumu logs tos nepārraksta ar minējumiem. `units_per_mm` un asu zīmes GUI nerāda, lai nejauši nesagrieztu spoguļattēlu.

## Pirms pirmā īstā grieziena

1. Nomēri testa kvadrātu. Ja 20 mm kvadrāts nav 20 mm, maini `plotter.units_per_mm` un atkārto tikai testa kvadrātu.
2. Pārbaudi, vai Y nav spoguļattēls. Ja ir, maini `plotter.y_sign` uz `-1` un atkal griez tikai kvadrātu.
3. Atstāj `speed_command` un `force_command` tukšus, kamēr nav noķerta īsta komanda no šī plotera.
4. Iestati ātrumu un spiedienu uz paneļa, nevis programmā.
5. Pārliecinies, ka dizains priekšskatījumā ir uz lapas un CUT kopsavilkuma izmērs sakrīt ar to, ko gribi.
6. Neliec vinila platumu lielāku par reālo griešanas platumu (noklusējums 640 mm).

Ja kvadrāts ir pareizā izmērā un pareizajā virzienā, tikai tad drīkst sūtīt dizainu.

## Uzbūve

```text
GUI → Job → Geometry → Plotter Driver → Transport
```

Logs HP-GL tekstu neveido. To dara tikai `plotter/hpgl.py`, un to izsauc draiveris.

```text
cto630-cutter/
├── app.py
├── ui/            logs, priekšskatījums, iestatījumi
├── core/          SVG, ģeometrija, optimizācija, pārbaude, darbs
├── plotter/       draiveris, HP-GL, seriālais ports, simulators
├── config/        noklusējuma JSON
└── examples/sample.svg
```
