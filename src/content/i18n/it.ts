import type { PublicContent } from "./types";

const internationalFaq = {
  question: "In quale lingua si svolgono le sessioni?",
  answer:
    "Le sessioni si svolgono in inglese. I clienti internazionali sono i benvenuti — le sessioni online sono disponibili in tutto il mondo.",
};

export const itContent: PublicContent = {
  locale: "it",
  translationStatus: "published",
  site: {
    name: "Niks Ravins",
    method: "Adaptive Association Processing (AAP)",
    availability: "Online in tutto il mondo",
    brandDescriptor: "Specialista nella riscrittura delle risposte automatiche del sistema nervoso",
    email: "hello@niksravins.com",
    bookingUrl: "/book",
  },
  internationalNotice: {
    line1: "Online in tutto il mondo",
    line2: "Le sessioni si svolgono in inglese",
  },
  header: {
    book: "Prenota",
    bookSession: "Prenota una sessione",
    clientPortal: "Area clienti",
  },
  sectionLabels: {
    trustHeading: "Perché le persone vengono qui",
    aapLabel: "AAP",
    testimonialsLabel: "Cambiamenti osservati",
    testimonialsHeading: "Cosa cambia nella vita quotidiana",
    contactHeading: "Contatti",
    aboutImageAlt: "Ritratto di Niks Ravins",
  },
  navigation: [
    { label: "Chi sono", href: "#about" },
    { label: "AAP", href: "#aap" },
    { label: "FAQ", href: "#faq" },
    { label: "Contatti", href: "#contact" },
  ],
  hero: {
    name: "Niks Ravins",
    headline: "Capisci la reazione. Eppure accade lo stesso.",
    explanation: [
      "Le reazioni emotive automatiche possono continuare perché il sistema nervoso le collega ancora a esperienze passate specifiche.",
      "La maggior parte di chi viene qui comprende già i propri schemi. Parlarne li ha spiegati. Non ha cambiato la reazione.",
      "Le sessioni si concentrano sull'identificare e modificare quelle associazioni emotive apprese.",
    ],
    primaryCta: { label: "Prenota una sessione", href: "/book" },
    secondaryCta: { label: "Come funziona l'AAP", href: "#aap" },
  },
  trust: {
    statements: [
      "Le persone non vengono perché non si capiscono.",
      "La maggior parte lo fa già.",
      "Vengono perché la comprensione da sola non ha cambiato la reazione.",
      "Questo lavoro si concentra sul cambiare la reazione stessa.",
    ],
  },
  about: {
    title: "Perché esiste questo lavoro",
    story: [
      "Per anni ho osservato la stessa cosa nei miei clienti: chiarezza, reazione immutata. Potevano descrivere lo schema alla perfezione. L'ansia arrivava comunque. Il blocco compariva lo stesso. La rabbia precedeva il pensiero.",
      "L'AAP è nato da quell'osservazione — e dalla mia esperienza personale con reazioni che la comprensione da sola non riusciva a raggiungere. Non da una teoria che volevo dimostrare, ma da una domanda che non se ne andava: se qualcuno sa già perché reagisce, cosa deve ancora cambiare esattamente?",
      "La risposta, come la vedo, è l'associazione stessa — il legame appreso tra un'esperienza passata e una risposta presente. Questo lavoro esiste per raggiungere quel legame direttamente, attraverso un framework di sessione strutturato, costruito su un ampio lavoro pratico e sull'osservazione continua di come si trasformano le reazioni emotive automatiche.",
    ],
  },
  aap: {
    title: "Come funziona l'AAP",
    intro:
      "L'Adaptive Association Processing non è qualcosa che si studia. È qualcosa che accade nella sessione — in silenzio, con precisione, al ritmo che il tuo sistema consente.",
    points: [
      {
        title: "Cosa accade in una sessione",
        description:
          "Individuiamo una reazione specifica — quella che continua ad arrivare automaticamente — e la rintracciamo fino all'associazione emotiva che la mantiene attiva. La sessione resta concentrata su quel legame. Nessuna performance, nessuna fretta di insight.",
      },
      {
        title: "Perché la stessa reazione ritorna",
        description:
          "Una reazione si ripete quando il sistema nervoso tratta ancora un momento presente come collegato al passato. L'associazione è stata appresa. Può essere difficile sovrascriverla con la sola comprensione, perché opera prima del pensiero.",
      },
      {
        title: "Come un ricordo arriva al presente",
        description:
          "Un'associazione emotiva non richiede un richiamo consapevole. Un tono, uno sguardo, una situazione possono attivare la stessa risposta prodotta dall'esperienza originale — anche quando la persona sa, razionalmente, che il passato non è il presente.",
      },
      {
        title: "Cosa può cambiare",
        description:
          "Quando un'associazione si trasforma, la reazione che la seguiva può attenuarsi o smettere del tutto di comparire. Non è una promessa. È ciò che i clienti spesso descrivono: non una nuova comprensione, ma una risposta diversa nella vita quotidiana.",
      },
    ],
  },
  testimonials: {
    intro:
      "Questi sono cambiamenti quotidiani che le persone spesso notano quando una reazione automatica inizia a trasformarsi. Non perché si sforzino di più o pensino diversamente, ma perché la reazione stessa non è più la stessa.",
    items: [
      {
        title: "Il controllo si ferma",
        description:
          "L'impulso a controllare i social media del partner semplicemente svanisce. Non per autocontrollo o disciplina, ma perché il sistema nervoso non lo tratta più come qualcosa da controllare.",
      },
      {
        title: "La tensione si allenta",
        description:
          "L'oppressione al petto prima di parlare al lavoro raramente compare ora. La preparazione continua. Il corpo non risponde più allo stesso modo.",
      },
      {
        title: "La rabbia arriva meno",
        description:
          "Una rabbia che non c'entrava con il momento presente ha smesso di precedere il pensiero. La situazione non è cambiata. La reazione, sì.",
      },
    ],
  },
  faq: {
    headingLabel: "Domande",
    heading: "Cosa chiedono le persone",
    items: [
      internationalFaq,
      {
        question: "Cosa accade durante una sessione?",
        answer:
          "Identifichiamo una reazione automatica specifica e lavoriamo con l'associazione emotiva collegata. Le sessioni sono strutturate e focalizzate. Non ti viene chiesto di performare o produrre insight — il lavoro avviene a livello dell'associazione stessa.",
      },
      {
        question: "Dovrò rivivere il mio passato?",
        answer: [
          "Non nel modo in cui la maggior parte delle persone lo immagina.",
          "L'obiettivo non è rivivere esperienze dolorose o restare in emozioni difficili.",
          "Durante la sessione, attiviamo brevemente il ricordo emotivo specifico o l'associazione appresa collegata alla tua reazione automatica. Questo dà al sistema nervoso accesso allo schema che mantiene ancora quella risposta oggi.",
          "Da lì, l'attenzione si sposta verso il cambiamento della risposta del sistema nervoso. L'obiettivo non è rivisitare ripetutamente il passato, ma permettere che cambi la reazione collegata a quel ricordo.",
          "La maggior parte dei clienti resta sorpresa da quanto poco tempo si dedica a parlare del passato, rispetto al tempo dedicato a creare il cambiamento.",
        ],
      },
      {
        question: "L'AAP è psicoterapia?",
        answer:
          "Sì. L'AAP è un framework di sessione strutturato utilizzato all'interno della psicoterapia. Non è coaching, e non è una tecnica autonoma applicata al di fuori di una relazione terapeutica.",
      },
      {
        question: "Quante sessioni fanno di solito le persone?",
        answer:
          "Varia. Alcune persone lavorano su un singolo schema per diverse sessioni. Altre continuano più a lungo. Non c'è una durata prescritta — lavoriamo finché la reazione per cui sei venuto non si è trasformata abbastanza da contare nella tua vita quotidiana.",
      },
      {
        question: "Può aiutare se ho già provato la terapia?",
        answer:
          "Spesso sì — soprattutto se una terapia precedente ti ha aiutato a comprendere i tuoi schemi ma le reazioni automatiche sono rimaste. L'AAP affronta uno strato diverso: non la storia sulla reazione, ma l'associazione che la produce.",
      },
      {
        question: "E se sono in crisi?",
        answer:
          "Questa pratica non è equipaggiata per le emergenze. Se sei in pericolo immediato o stai attraversando una crisi di salute mentale, contatta i servizi di emergenza locali o una linea di crisi nella tua zona.",
      },
    ],
  },
  finalCta: {
    lines: [
      "Se ti comprendi da anni",
      "ma le tue reazioni restano automatiche,",
      "forse non è la comprensione ciò che manca.",
    ],
    button: { label: "Prenota una sessione", href: "/book" },
  },
  bookingPublic: {
    label: "Prenotazione",
    title: "Prenota una sessione",
    subtitle:
      "Inizia il processo di cambiare le reazioni automatiche che non ti servono più. Clienti internazionali benvenuti — le sessioni si svolgono in inglese.",
  },
  bookingUi: {
    hero: {
      title: "Prenota una sessione",
      subtitle:
        "Inizia il processo di cambiare le reazioni automatiche che non ti servono più.",
    },
    services: {
      title: "Seleziona un servizio",
      description: "Tutte le offerte sono sessioni a pagamento svolte online.",
    },
    calendar: {
      title: "Scegli un orario",
      packageTitle: "Scegli la tua prima sessione",
      packageDescription:
        "Prenota ora la tua prima sessione. Le sessioni 2–5 possono essere programmate in seguito, una alla volta, dal tuo Area clienti.",
      description:
        "Seleziona una sessione online disponibile. Vedrai solo gli orari in cui Niks è disponibile per il lavoro online.",
      loading: "Caricamento degli orari disponibili…",
      noAvailability:
        "Nessuna sessione online disponibile nella prossima finestra di prenotazione. Torna a controllare presto.",
      noSlots: "Nessun orario disponibile in questa data.",
      showMoreTimes: "Mostra più orari",
      showFewerTimes: "Mostra meno orari",
      courseStartTitle: "Scegli la data di inizio",
      courseStartDescription:
        "Seleziona quando desideri iniziare il tuo corso o programma.",
      courseStartLabel: "Data di inizio del corso",
    },
    form: {
      title: "I tuoi dati",
      description:
        "Queste informazioni aiutano a preparare la tua sessione. Tutto ciò che condividi qui è confidenziale.",
      sessionIntentionLabel: "Intenzione della sessione",
      sessionIntentionPlaceholder:
        "Descrivi brevemente la reazione o lo schema su cui vorresti lavorare.",
    },
    payment: {
      title: "Pagamento",
      description: "Completa la prenotazione in modo sicuro con carta.",
      stripeLabel: "Paga con carta",
    },
    paymentSuccess: {
      title: "Pagamento confermato",
      errorTitle: "Impossibile verificare il pagamento",
      message:
        "Grazie — il tuo pagamento è stato ricevuto con successo. La tua prenotazione è confermata e riceverai un'e-mail di conferma a breve.",
      packageMessage:
        "Il tuo percorso di trasformazione è confermato. Riceverai un'e-mail con i dettagli della prenotazione e l'accesso al Client Portal.",
      courseMessage:
        "Il tuo corso è confermato. Riceverai un'e-mail con i dettagli della prenotazione a breve.",
      closing:
        "Se l'e-mail di conferma non arriva entro pochi minuti, controlla la cartella spam. Non vedo l'ora di incontrarti.",
      sessionLanguageNote:
        "La tua sessione si svolgerà in inglese. Le sessioni online sono disponibili in tutto il mondo.",
      missingSessionId:
        "Non siamo riusciti a verificare il pagamento perché non è stato fornito un riferimento al checkout.",
      invalidSession:
        "Non abbiamo trovato una sessione di checkout valida. Se hai completato il pagamento, controlla la tua e-mail o contattaci.",
      notPaid:
        "Il pagamento non è ancora stato completato. Se ti è stato addebitato un importo, contattaci con i dettagli del pagamento.",
      error:
        "Non siamo riusciti a verificare il pagamento in questo momento. Riprova tra poco o controlla la tua e-mail per una conferma.",
      tryAgain: "Torna alla prenotazione",
    },
    confirmation: {
      title: "La tua sessione è confermata.",
      message:
        "Un'e-mail di conferma con i dettagli della tua sessione è stata inviata all'indirizzo che hai fornito.",
      closing:
        "Se non arriva entro pochi minuti, controlla la cartella spam. Non vedo l'ora di incontrarti.",
      sessionLanguageNote:
        "La tua sessione si svolgerà in inglese. Le sessioni online sono disponibili in tutto il mondo.",
    },
    actions: {
      continue: "Continua",
      back: "Indietro",
      confirmBooking: "Conferma prenotazione",
      returnHome: "Torna alla home",
    },
  },
  seo: {
    home: {
      title: "Niks Ravins | Trasformazione profonda e Adaptive Association Processing",
      description:
        "Sessioni di trasformazione profonda online con Niks Ravins e Adaptive Association Processing (AAP). Lavora su schemi emotivi, relazioni e trasformazione personale. Sessioni in inglese, disponibili in tutto il mondo.",
    },
    book: {
      title: "Prenota una sessione",
      description:
        "Prenota una sessione di trasformazione online con Niks Ravins. Sessioni iniziali e percorsi da 5 sessioni disponibili in tutto il mondo. Le sessioni si svolgono in inglese.",
    },
  },
  footer: {
    rights: "Tutti i diritti riservati.",
  },
  languageSwitcherLabel: "Scegli la lingua",
};
