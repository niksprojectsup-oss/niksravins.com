import type { PublicContent } from "./types";

export const lvContent: PublicContent = {
  locale: "lv",
  translationStatus: "published",
  site: {
    name: "Niks Ravins",
    method: "Adaptive Association Processing (AAP)",
    availability: "Tiešsaistē visā pasaulē",
    brandDescriptor: "Automātisko nervu sistēmas reakciju pārrakstīšanas speciālists",
    email: "hello@niksravins.com",
    bookingUrl: "/book",
  },
  internationalNotice: {
    line1: "Tiešsaistē visā pasaulē",
    line2: "Sesijas notiek angļu valodā",
  },
  header: {
    book: "Rezervēt",
    bookSession: "Rezervēt sesiju",
    clientPortal: "Klienta portāls",
    openMenu: "Atvērt izvēlni",
    closeMenu: "Aizvērt izvēlni",
    primaryNavLabel: "Galvenā navigācija",
    mobileNavLabel: "Mobilā navigācija",
  },
  sectionLabels: {
    trustHeading: "Kāpēc cilvēki nāk šeit",
    aapLabel: "AAP",
    testimonialsLabel: "Novērotās pārmaiņas",
    testimonialsHeading: "Kas mainās ikdienā",
    contactHeading: "Saziņa",
    aboutImageAlt: "Niks Ravins portrets",
  },
  navigation: [
    { label: "Izpētīt iespējas", href: "#want-change" },
    { label: "Identitātes pārmaiņas", href: "#identity-shifts" },
    { label: "BUJ", href: "#faq" },
    { label: "Saziņa", href: "#contact" },
  ],
  hero: {
    name: "Niks Ravins",
    headline: "Jūs saprotat reakciju, bet tā tik un tā notiek.",
    explanation: [
      "Jūs varat zināt, ka esat drošībā, ka pietiekat, ka drīkstat teikt nē vai būt pats — un tomēr reaģēt tā, it kā nekas no tā nebūtu patiess.",
      "Jautājums zem tā bieži nav tikai tas, kāpēc jūs reaģējat, bet gan tas, par ko jūs iemācījāties kļūt, lai jūs mīlētu, izvēlētos, pieņemtu, lai jūs justos droši vai pietiekami.",
      "Šī atbilde var kļūt par iekšēju likumu. Un likums var turpināt organizēt reakciju ilgi pēc tam, kad apzināti jau zināt labāk.",
    ],
    primaryCta: { label: "Rezervēt sesiju", href: "/book" },
    secondaryCta: { label: "Izpētīt iespējas", href: "#want-change" },
    tertiaryCta: { label: "Identitātes pārmaiņas", href: "#identity-shifts" },
  },
  foundation: {
    intro: [
      { text: "Es strādāju ar " },
      { text: "dziļākajām emocionālajām saiknēm", bold: true },
      { text: " un " },
      { text: "pārliecībām", bold: true },
      { text: ", kas veido to, kā jūs " },
      { text: "piedzīvojat sevi", bold: true },
      { text: ", ko uzskatāt, ka " },
      { text: "esat pelnījis", bold: true },
      { text: ", un kas jums šķiet " },
      { text: "iespējams", bold: true },
      { text: "." },
    ],
    headline: [
      { text: "Mainiet iekšējo pamatu." },
      { text: "Radiet vietu citādai dzīvei.", bold: true },
    ],
  },
  journey: {
    heading: "Jūs vēlaties, lai kaut kas mainītos.",
    steps: [
      [
        { text: "Varbūt tās ir jūsu " },
        { text: "attiecības", bold: true },
        { text: ". Varbūt tas ir jūsu " },
        { text: "darbs", bold: true },
        { text: ". Varbūt tas, kā jūs jūtaties pret " },
        { text: "sevi", bold: true },
        { text: ". Varbūt jūs vienkārši zināt, ka vēlaties " },
        { text: "vairāk no dzīves", bold: true },
        { text: "." },
      ],
      [
        { text: "Jūs saprotat, kas " },
        { text: "nestrādā", bold: true },
        { text: "." },
      ],
      [
        { text: "Iespējams, jūs pat saprotat, kas jūs " },
        { text: "aiztur", bold: true },
        { text: "." },
      ],
      [
        { text: "Taču kaut ko zināt " },
        { text: "ne vienmēr nozīmē, ka tas mainās", bold: true },
        { text: "." },
      ],
    ],
  },
  alignment: {
    heading: "Kas nejūtas saskaņā?",
    items: [
      {
        title: "Jūsu attiecības.",
        body: "Jūs vēlaties attiecībās justies saistītāks, drošāks, mīlētāks vai brīvāks — bet kaut kas arvien atkal nāk ceļā.",
      },
      {
        title: "Jūsu darbs.",
        body: "Jūs ienīstat savu darbu. Jūs vēlaties kaut ko citu. Jūs zināt, ka spējat vairāk un esat pelnījis labāku, bet kaut kas jūs tur, kur esat.",
      },
      {
        title: "Jūsu pārliecība par sevi.",
        body: "Jūs vēlaties runāt, tikt pamanītam, uzticēties sev un ieņemt vietu, nemitīgi sevi neapšaubot.",
      },
      {
        title: "Jūsu attiecības ar sevi.",
        body: "Jūs esat noguris no šaubām, no sajūtas, ka nepietiekat, vai no pastāvīgas nepieciešamības pierādīt savu vērtību.",
      },
      {
        title: "Jūsu sapņi.",
        body: "Ir lietas, ko vēlaties radīt, piedzīvot vai sasniegt — bet jūs arvien sevi aizturat, atliekat vai paliekat pie tā, kas šķiet pazīstams.",
      },
      {
        title: "Jūsu dzīve.",
        body: "Jūs jūtaties iestrēdzis, atvienots vai it kā kaut kā trūkst. Jūs zināt, ka vēlaties vairāk, bet vēl neesat atradis ceļu uz priekšu.",
      },
    ],
  },
  underneath: {
    intro: "Atnesiet to, kas jūs nomāc.\nKas jūs aiztur. Ko vēlaties mainīt.",
    headline: "Kopā paskatāmies,\nkas varētu būt zem tā.",
  },
  identityShifts: {
    heading: "Pārmaiņas identitātes līmenī",
    intro:
      "Dažkārt jūs aiztur nevis pati situācija,\nbet tas, kam ticat par to, kas jūs esat un kas jums ir drošs, iespējams vai pelnīts.",
    rows: [
      {
        from: "Es nepietieku.",
        explanation:
          "Jūs varat pastāvīgi sevi pierādīt, salīdzināties ar citiem vai atturēties no iespējām, attiecībām un pieredzes, ko patiesībā vēlaties.",
        to: "Es pietieku.",
      },
      {
        from: "Es neesmu pelnījis labāku.",
        explanation:
          "Jūs varat palikt darbā, attiecībās vai situācijā, kas vairs nejūtas pareizi — pat ja zināt, ka vēlaties vairāk.",
        to: "Es esmu pelnījis labāku.",
      },
      {
        from: "Drošāk ir palikt tur, kur esmu.",
        explanation:
          "Jūs varat arvien izvēlēties pazīstamo, tā vietā lai riskētu virzīties uz to, ko patiesībā vēlaties.",
        to: "Es varu izvēlēties citādi.",
      },
      {
        from: "Es nevaru uzticēties cilvēkiem.",
        explanation:
          "Jums var būt grūti atvērties, pieņemt atbalstu vai ļaut kādam īsti tuvoties — pat ja dziļi vēlaties saikni.",
        to: "Es varu uzticēties.",
      },
      {
        from: "Man viss jādara pašam.",
        explanation:
          "Jums var būt grūti pieņemt, atslābt vai ļaut kādam citam parūpēties. Pat ja vēlaties vieglumu, maigumu un telpu, jūs turpināt kontrolēt un nest visu pats.",
        to: "Es varu uzticēties un ļaut.",
      },
      {
        from: "Es esmu par daudz.",
        explanation:
          "Jūs varat padarīt sevi mazāku, slēpt savas vajadzības vai aizturēt daļas no sevis, lai izvairītos no noraidījuma.",
        to: "Man ir atļauts būt pilnībā pašam.",
      },
    ],
    closingLead: "Šīs pārliecības ne vienmēr skan kā domas galvā.",
    closing:
      "Dažkārt tās parādās izvēlēs, ko veicat, attiecībās, kurās paliekat,\nlietās, no kurām izvairāties, vai dzīvē, ko sev neļaujat.",
  },
  roots: {
    intro:
      "Mēs strādājam ar pārliecībām un emocionālajām saiknēm zem tā — tām, kas var veidot jūsu izvēles, uzvedību, attiecības un to, kā jūs piedzīvojat sevi.",
    headline:
      "Kad mainās iekšējais pamats,\nvar mainīties arī tas, kā jūs ejat cauri dzīvei.",
  },
  trust: {
    statements: [
      "Jūs varat saprast, kāpēc reaģējat — un tomēr turpināt reaģēt.",
      "Greizsirdība, kontrole, trauksme, atkāpšanās, vēlme izpatikt, pārmērīga funkcionēšana, grūtības teikt nē, bailes no noraidījuma, vajadzība sevi pierādīt, pazaudēt sevi attiecībās — tas var izskatīties pēc atsevišķām problēmām.",
      "Bieži tās ir viena stumbra zari: iekšējs likums par to, kam jums bija jābūt, lai paliktu saistīts, drošībā vai vērtīgs.",
      "Šis darbs ir cilvēkiem, kuri jau ir pašapzināti — un ievēro, ka sapratne vien nav noteikti mainījusi to, kā reakcija jūtas, kad tā atnāk.",
    ],
  },
  about: {
    title: "Stumbrs un zari",
    story: [
      [
        "Viens veids, kā saprast šo modeli, ir vienkāršs tēls.",
        "Stumbrs ir iekšējais likums — piemēram: man jābūt viegli mīlamam.",
        "Zari ir tas, kā tas parādās: grūtības teikt nē, pārmērīga pielāgošanās, bailes no konflikta, otra noskaņojuma uzraudzīšana, savu vajadzību apspiešana, vainas sajūta, kad izvēlaties sevi.",
        "Mēs varam gadus strādāt ar zariem. Darbs bieži kļūst noderīgāks, kad paskatāmies uz stumbru — jo, kad pamatā esošais likums sāk mainīties, var sākt mainīties arī zari.",
      ],
      [
        "Identitātes pārrakstīšana ir tas, par ko šis darbs ir: atklāt iekšējos likumus, pēc kuriem iemācījāties dzīvot — un izzināt, kas kļūst iespējams, kad tiem vairs nav jāorganizē, kas jūs esat.",
        "Tas nav pozitīvais domāšana, piespiedu afirmācijas vai vēl viens jūsu modeļa skaidrojums. Šis darbs nav par kļūšanu par kādu citu. Tas ir par dzīvošanu ar mazāku nepieciešamību organizēt sevi ap veciem likumiem par to, kam jums bija jābūt.",
      ],
      "Es strādāju ar cilvēkiem, kuri jau daudz saprot par sevi — un tomēr ievēro, ka atnāk tā pati automātiskā reakcija. Gadiem es redzēju skaidru ieskatu līdzās nemainītai reakcijai. Šajā spraugā dzīvo šis darbs: ne vairāk sapratnē, bet sastopot iekšējo likumu pieredzē — emocionāli, attiecībās, ķermenī.",
    ],
  },
  aap: {
    title: "Kā darbs notiek sesijā",
    intro: [
      "Adaptive Association Processing (AAP) ir strukturēts terapeitisks process, ko es izmantoju psihoterapijā, lai strādātu ar iemācītajām saiknēm un dzīvo pieredzi, kas var uzturēt vecu iekšējo likumu aktīvu tagadnē.",
      "Identitātes pārrakstīšana ir tas, par ko darbs ir. AAP ir tas, kā tas notiek telpā.",
    ],
    points: [
      {
        title: "Ko šeit nozīmē „saikne”",
        description: [
          "Saikne ir iemācītā saite starp pieredzi un tagadējo reakciju.",
          "Piemēram: jūs varat iemācīties, ka vajadzību izteikšana apdraud saikni. Saikne — manas vajadzības rada briesmas — var turpināt darboties, pat ja racionāli zināt, ka esat drošībā. Tā jūs iemācījāties būt tas, kurš pielāgojas. AAP strādā tieši ar šo saiti, ne tikai ar stāstu par to.",
        ],
      },
      {
        title: "Kas notiek sesijā",
        description:
          "Mēs atrodam vienu konkrētu automātisko reakciju un strādājam ar saikni un dzīvo pieredzi, kas ar to saistīta. Sesijas ir strukturētas un fokusētas. Jums nelūdz uzstāties vai radīt ieskatu. Darbs ir pieredzes — tas notiek caur to, ko jūs patiešām jūtat un pie kā varat palikt, nevis bezgalīgi runājot par modeli.",
      },
      {
        title: "Kāpēc pagātne var būt nozīmīga — to nepārdzīvojot no jauna",
        description:
          "Pagātne var būt būtiska, jo saiknes tiek iemācītas pieredzē. Mēs varam īsi aktivizēt emocionālo atmiņu, kas saistīta ar jūsu reakciju — pietiekami, lai sasniegtu to, kas to uztur šodien. Mērķis nav atkārtoti apmeklēt bērnību, bet strādāt ar to, kas tagad uztur reakciju.",
      },
      {
        title: "Kas var mainīties",
        description:
          "Kad saikne pārbīdās un iekšējais likums atslābst, reakcija, kas tam sekoja, var kļūt mīkstāka vai mazāk nepieciešama. Tas nav solījums. Klienti bieži apraksta ne jaunu cilvēku, bet citu ikdienas pieredzi — mazāk organizētu ap veco likumu, vairāk spējīgu palikt pie sevis, nemaksājot par to ar vainu, kontroli vai sevis pamešanu.",
      },
    ],
  },
  testimonials: {
    intro:
      "Tās ir ikdienas pārmaiņas, ko cilvēki bieži ievēro, kad automātiskā reakcija sāk mainīties. Ne tāpēc, ka viņi cenšas vairāk vai domā citādi, bet tāpēc, ka pati reakcija vairs nav tā pati.",
    items: [
      {
        title: "Pārbaudīšana apstājas",
        description:
          "Vēlme uzraudzīt partnera sociālos tīklus vienkārši izzūd. Ne ar paškontroli vai disciplīnu, bet tāpēc, ka nervu sistēma to vairs neuztver kā kaut ko, kas jāpārbauda.",
      },
      {
        title: "Saspringums atslābst",
        description:
          "Krūšu saspringums pirms runāšanas darbā tagad nāk reti. Sagatavošanās paliek. Ķermenis vairs nereaģē tāpat.",
      },
      {
        title: "Dusmas atnāk retāk",
        description:
          "Dusmas, kam nebija sakara ar šo mirkli, vairs nenāca pirms domas. Situācija nemainījās. Reakcija — jā.",
      },
    ],
  },
  faq: {
    headingLabel: "Jautājumi",
    heading: "Ko cilvēki jautā",
    items: [
      {
        question: "Kas ir identitātes pārrakstīšana?",
        answer:
          "Identitātes pārrakstīšana ir nosaukums, ko izmantoju šī darba plašākajam virzienam: atklāt iekšējos likumus, pēc kuriem iemācījāties dzīvot — kam jums bija jābūt, lai jūs mīlētu, izvēlētos, pieņemtu, lai justos droši vai pietiekami — un izzināt, kas kļūst iespējams, kad šiem likumiem vairs nav jāorganizē jūsu reakcijas. Tā ir konceptuāla valoda darbam, nevis medicīnisks vai neirozinātnisks apgalvojums.",
      },
      {
        question: "Kas ir AAP — un ar ko tas atšķiras?",
        answer:
          "Adaptive Association Processing (AAP) ir strukturēts terapeitisks process, ko es izmantoju psihoterapijā. Tas strādā ar iemācīto saikni un dzīvo pieredzi, kas var uzturēt vecu iekšējo likumu aktīvu. Identitātes pārrakstīšana raksturo, par ko darbs ir; AAP ir tas, kā tas notiek telpā. Tie nav atsevišķi piedāvājumi vai konkurējošas metodes.",
      },
      {
        question: "Kas notiek sesijas laikā?",
        answer:
          "Mēs identificējam konkrētu automātisko reakciju un strādājam ar saikni un dzīvo pieredzi, kas ar to saistīta. Sesijas ir strukturētas, mierīgas un fokusētas. Jums nelūdz uzstāties vai radīt ieskatu — darbs notiek caur tiešu modeļa pieredzi, tādā tempā, kādā jūs varat palikt pie tā.",
      },
      {
        question: "Ko darīt, ja es jau saprotu savus modeļus?",
        answer:
          "Tas bieži ir sākuma punkts. Daudzi cilvēki šeit var skaidri izskaidrot savus modeļus — un tomēr ievēro, ka atnāk tā pati reakcija. Šis darbs adresē spraugu starp zināšanu un citādu piedzīvošanu: ne vēl vienu skaidrojumu, bet darbu ar to, kas modeli uztur dzīvu tagadnē.",
      },
      {
        question: "Kāda ir atšķirība starp pirmo sesiju un paketi?",
        answer: [
          "45 minūšu sākotnējā sesija ir jūsu pirmais solis: mēs izpētām jūsu modeļus, saprotam, kas tos uztur, un noskaidrojam visefektīvāko ceļu uz priekšu.",
          "5 × 45 minūšu Deep Transformation pakete ir saistīts process — ceļojums pāri sesijām, lai ietu dziļāk un sekotu tam, kas mainās. Pirmo sesiju rezervējat norēķinu laikā; pārējās plānojat klienta portālā.",
        ],
      },
      {
        question: "Vai sesijas notiek tiešsaistē un angļu valodā?",
        answer: "Jā. Visas sesijas notiek tiešsaistē, angļu valodā, ar klientiem visā pasaulē.",
      },
    ],
  },
  finalCta: {
    lines: [
      "Iespējams, jūs jau saprotat modeli.",
      "Interesantāks jautājums var būt, par ko jūs iemācījāties kļūt —",
      "un vai šim likumam joprojām jāorganizē jūsu dzīve.",
    ],
    button: { label: "Rezervēt sesiju", href: "/book" },
  },
  bookingPublic: {
    label: "Rezervācija",
    title: "Rezervēt sesiju",
    subtitle:
      "Sāciet procesu, lai mainītu automātiskās reakcijas, kas jums vairs neder. Starptautiskie klienti ir laipni gaidīti — sesijas notiek angļu valodā.",
  },
  bookingOffers: {
    "initial-aap-session": {
      title: "45 minūšu sākotnējā sesija",
      description:
        "Jūsu pirmais solis procesā. Kopā izpētām jūsu modeļus un automātiskās reakcijas, saprotam, kas tās uztur, un noskaidrojam jums visefektīvāko ceļu.",
      durationLabel: "45 minūtes",
      priceLabel: "€90",
    },
    "aap-transformation-package": {
      title: "5 × 45 minūšu Deep Transformation pakete",
      description:
        "Strukturēts transformācijas process — nevis piecas atsevišķas tikšanās, bet viens saistīts ceļojums, kas veidots ilgstošām pārmaiņām.",
      detail:
        "Jēgpilnām pārmaiņām parasti vajag vairāk nekā vienu sarunu. Darbs vairākās sesijās ļauj iet dziļāk, sekot tam, kas mainās, un veidot impulsu, nevis sākt no jauna katru reizi.",
      durationLabel: "5 sesijas · katra 45 minūtes",
      priceLabel: "€450 kopā",
      checkoutNote:
        "Jūsu pirmā sesija ir apstiprināta. Atlikušās 4 sesijas plānojiet klienta portālā.",
      highlights: [
        "Dziļāka savu modeļu izpratne",
        "Darbs ar pamatā esošajām reakcijām",
        "Pārmaiņu izsekošana laika gaitā",
        "Ilgtspējīgu pārmaiņu veidošana",
        "Nepārtrauktība un impulss",
      ],
      bonuses: [
        "Personal Reaction Map",
        "Pārdomu impulsi starp sesijām",
        "Prioritāra laiku plānošana",
      ],
    },
  },
  bookingUi: {
    hero: {
      title: "Rezervēt sesiju",
      subtitle: "Sāciet procesu, lai mainītu automātiskās reakcijas, kas jums vairs neder.",
    },
    services: {
      title: "Izvēlieties pakalpojumu",
      description: "Visi piedāvājumi ir maksas sesijas, kas notiek tiešsaistē.",
      choose: "Izvēlēties",
      selected: "Izvēlēts",
      includedBonuses: "Iekļautie bonusi",
    },
    steps: {
      progressLabel: "Rezervācijas progress",
      session: "Sesija",
      schedule: "Laiks",
      startDate: "Sākuma datums",
      details: "Dati",
      payment: "Maksājums",
    },
    calendar: {
      title: "Izvēlieties laiku",
      packageTitle: "Izvēlieties pirmo sesiju",
      packageDescription:
        "Rezervējiet pirmo sesiju tagad. 2.–5. sesiju varēsiet plānot vēlāk pa vienai klienta portālā.",
      description:
        "Izvēlieties pieejamu tiešsaistes sesiju. Jūs redzēsiet tikai laikus, kad Niks ir pieejams tiešsaistes darbam.",
      loading: "Ielādē pieejamos laikus…",
      noAvailability:
        "Nākamajā rezervācijas logā nav pieejamu tiešsaistes sesiju. Lūdzu, ieskatieties drīz atkal.",
      noSlots: "Šajā datumā nav pieejamu laiku.",
      showMoreTimes: "Rādīt vairāk laiku",
      showFewerTimes: "Rādīt mazāk laiku",
      courseStartTitle: "Izvēlieties sākuma datumu",
      courseStartDescription: "Izvēlieties, kad vēlaties, lai kurss vai programma sāktos.",
      courseStartLabel: "Kursa sākuma datums",
      weekdays: ["Pr", "Ot", "Tr", "Ce", "Pk", "Se", "Sv"],
      packageSessionNote: "Šodien rezervējat 1. no 5 sesijām.",
      packageFollowUpNote:
        "2.–5. sesiju varēsiet plānot vēlāk pa vienai klienta portālā.",
      localTimeNote: "Laiki tiek rādīti jūsu vietējā laikā ({timezone}).",
      previousMonth: "Iepriekšējais mēnesis",
      nextMonth: "Nākamais mēnesis",
      available: "pieejams",
      unavailable: "nav pieejams",
      today: "šodien",
      selected: "izvēlēts",
    },
    form: {
      title: "Jūsu dati",
      description:
        "Šī informācija palīdz sagatavoties sesijai. Viss, ko šeit dalāties, ir konfidenciāls.",
      firstName: "Vārds",
      lastName: "Uzvārds",
      email: "E-pasts",
      phoneOptional: "Tālrunis (neobligāti)",
      country: "Valsts",
      timezone: "Laika josla",
      selectCountry: "Izvēlieties valsti",
      selectTimezone: "Izvēlieties laika joslu",
      sessionIntentionLabel: "Sesijas nodoms",
      sessionIntentionPlaceholder:
        "Īsi aprakstiet reakciju vai modeli, ar kuru vēlaties strādāt.",
      countries: [
        { value: "Latvia", label: "Latvija" },
        { value: "United Kingdom", label: "Apvienotā Karaliste" },
        { value: "Germany", label: "Vācija" },
        { value: "France", label: "Francija" },
        { value: "United States", label: "Amerikas Savienotās Valstis" },
        { value: "Canada", label: "Kanāda" },
        { value: "Australia", label: "Austrālija" },
        { value: "Netherlands", label: "Nīderlande" },
        { value: "Sweden", label: "Zviedrija" },
        { value: "Norway", label: "Norvēģija" },
        { value: "Other", label: "Cita" },
      ],
      timezones: [
        { value: "Europe/Riga", label: "Rīga (EET/EEST)" },
        { value: "Europe/London", label: "Londona (GMT/BST)" },
        { value: "Europe/Berlin", label: "Berlīne (CET/CEST)" },
        { value: "Europe/Paris", label: "Parīze (CET/CEST)" },
        { value: "America/New_York", label: "Ņujorka (EST/EDT)" },
        { value: "America/Chicago", label: "Čikāga (CST/CDT)" },
        { value: "America/Los_Angeles", label: "Losandželosa (PST/PDT)" },
        { value: "Asia/Dubai", label: "Dubaija (GST)" },
        { value: "Asia/Singapore", label: "Singapūra (SGT)" },
        { value: "Australia/Sydney", label: "Sidneja (AEST/AEDT)" },
      ],
    },
    validation: {
      firstNameRequired: "Vārds ir obligāts.",
      lastNameRequired: "Uzvārds ir obligāts.",
      emailRequired: "E-pasts ir obligāts.",
      emailInvalid: "Ievadiet derīgu e-pasta adresi.",
      phoneInvalid: "Ievadiet derīgu tālruņa numuru.",
      countryRequired: "Valsts ir obligāta.",
      timezoneRequired: "Laika josla ir obligāta.",
      sessionIntentionRequired: "Lūdzu, norādiet sesijas nodomu.",
      futureStartDate: "Lūdzu, izvēlieties nākotnes sākuma datumu.",
      availabilityLoadError: "Neizdevās ielādēt pieejamos laikus. Lūdzu, mēģiniet vēlreiz.",
      incompleteDetails:
        "Jūsu rezervācijas dati ir nepilnīgi. Atgriezieties un aizpildiet visus obligātos laukus pirms apstiprināšanas.",
      checkoutError: "Neizdevās sākt norēķinu. Lūdzu, mēģiniet vēlreiz.",
      invalidSessionType: "Lūdzu, izvēlieties derīgu sesijas veidu.",
      selectCourseStartDate: "Lūdzu, izvēlieties kursa sākuma datumu.",
      invalidStartDate: "Izvēlētais sākuma datums nav derīgs.",
      selectTimeSlot: "Lūdzu, izvēlieties laiku.",
      selectScheduledTime: "Lūdzu, izvēlieties plānoto laiku.",
      invalidTime: "Izvēlētais laiks nav derīgs.",
      futureTimeSlot: "Lūdzu, izvēlieties nākotnes laiku.",
      serviceUnavailable: "Izvēlētais pakalpojums nav pieejams.",
      invalidPrice: "Nederīga pakalpojuma cena.",
      stripeNoUrl: "Stripe neatgrieza norēķinu URL.",
      stripeCreateFailed: "Neizdevās izveidot Stripe norēķinu sesiju.",
    },
    payment: {
      title: "Maksājums",
      description: "Pabeidziet rezervāciju droši ar kartes maksājumu.",
      stripeLabel: "Maksāt ar karti",
      redirecting: "Novirza…",
    },
    paymentSuccess: {
      title: "Maksājums apstiprināts",
      errorTitle: "Maksājumu neizdevās verificēt",
      message:
        "Paldies — jūsu maksājums ir saņemts. Rezervācija ir apstiprināta, un drīzumā saņemsiet apstiprinājuma e-pastu.",
      packageMessage:
        "Jūsu transformācijas pakete ir apstiprināta. Saņemsiet e-pastu ar rezervācijas datiem un piekļuvi klienta portālam.",
      courseMessage:
        "Jūsu kurss ir apstiprināts. Drīzumā saņemsiet e-pastu ar rezervācijas datiem.",
      closing:
        "Ja apstiprinājuma e-pasts dažu minūšu laikā neienāk, pārbaudiet surogātpasta mapi. Priecāšos jūs satikt.",
      sessionLanguageNote:
        "Jūsu sesija notiks angļu valodā. Tiešsaistes sesijas ir pieejamas visā pasaulē.",
      missingSessionId:
        "Mēs nevarējām verificēt jūsu maksājumu, jo netika norādīta norēķinu atsauce.",
      invalidSession:
        "Mēs nevarējām atrast derīgu norēķinu sesiju. Ja esat samaksājis, lūdzu, pārbaudiet e-pastu vai sazinieties ar mums.",
      notPaid:
        "Jūsu maksājums vēl nav pabeigts. Ja jums tika iekasēta maksa, lūdzu, sazinieties ar mums ar maksājuma datiem.",
      error:
        "Pašlaik nevarējām verificēt jūsu maksājumu. Lūdzu, mēģiniet drīz vēlreiz vai pārbaudiet e-pastu.",
      tryAgain: "Atgriezties pie rezervācijas",
    },
    confirmation: {
      title: "Jūsu sesija ir apstiprināta.",
      message:
        "Apstiprinājuma e-pasts ar sesijas datiem ir nosūtīts uz jūsu norādīto adresi.",
      closing:
        "Ja tas dažu minūšu laikā neienāk, pārbaudiet surogātpasta mapi. Priecāšos jūs satikt.",
      sessionLanguageNote:
        "Jūsu sesija notiks angļu valodā. Tiešsaistes sesijas ir pieejamas visā pasaulē.",
    },
    actions: {
      continue: "Turpināt",
      back: "Atpakaļ",
      confirmBooking: "Apstiprināt rezervāciju",
      returnHome: "Uz sākumu",
    },
  },
  seo: {
    home: {
      title: "Niks Ravins | Identitātes pārrakstīšana un Adaptive Association Processing",
      description:
        "Psihoterapija pašapzinātiem pieaugušajiem, kuru automātiskās reakcijas turpinās neskatoties uz sapratni. Darbs ar iekšējiem likumiem un iemācītajām saiknēm. Tiešsaistes sesijas angļu valodā visā pasaulē.",
    },
    book: {
      title: "Rezervēt sesiju",
      description:
        "Rezervējiet tiešsaistes transformācijas sesiju ar Niks Ravins. Sākotnējās sesijas un 5 sesiju ceļojumi pieejami visā pasaulē. Sesijas notiek angļu valodā.",
    },
    legal: {
      title: "Juridiskā informācija",
      description: "Juridiskā informācija par Niks Ravins. Visas tiesības aizsargātas.",
    },
  },
  legal: {
    heading: "Juridiskā informācija",
    body: "Niks Ravins. Visas tiesības aizsargātas.",
    contactLabel: "Saziņa:",
  },
  footer: {
    rights: "Visas tiesības aizsargātas.",
    backToTop: "Uz augšu",
    navLabel: "Kājene",
  },
  languageSwitcherLabel: "Izvēlēties valodu",
};
