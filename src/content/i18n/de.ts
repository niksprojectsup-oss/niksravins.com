import type { PublicContent } from "./types";

const internationalFaq = {
  question: "In welcher Sprache finden die Sitzungen statt?",
  answer:
    "Sitzungen werden auf Englisch durchgeführt. Internationale Klienten sind willkommen — Online-Sitzungen sind weltweit verfügbar.",
};

export const deContent: PublicContent = {
  locale: "de",
  translationStatus: "published",
  site: {
    name: "Niks Ravins",
    method: "Adaptive Association Processing (AAP)",
    availability: "Weltweit online",
    brandDescriptor: "Spezialist für die Umschreibung automatischer Nervensystem-Reaktionen",
    email: "hello@niksravins.com",
    bookingUrl: "/book",
  },
  internationalNotice: {
    line1: "Weltweit online",
    line2: "Sitzungen werden auf Englisch durchgeführt",
  },
  header: {
    book: "Buchen",
    bookSession: "Sitzung buchen",
    clientPortal: "Klientenportal",
  },
  sectionLabels: {
    trustHeading: "Warum Menschen hierher kommen",
    aapLabel: "AAP",
    testimonialsLabel: "Beobachtete Veränderungen",
    testimonialsHeading: "Was sich im Alltag verschiebt",
    contactHeading: "Kontakt",
    aboutImageAlt: "Porträt von Niks Ravins",
  },
  navigation: [
    { label: "Über mich", href: "#about" },
    { label: "AAP", href: "#aap" },
    { label: "FAQ", href: "#faq" },
    { label: "Kontakt", href: "#contact" },
  ],
  hero: {
    name: "Niks Ravins",
    headline: "Sie verstehen die Reaktion. Sie tritt trotzdem auf.",
    explanation: [
      "Automatische emotionale Reaktionen können anhalten, weil das Nervensystem sie noch mit bestimmten vergangenen Erfahrungen verknüpft.",
      "Die meisten Menschen, die hierher kommen, verstehen ihre Muster bereits. Reden hat sie erklärt. Es hat die Reaktion nicht verändert.",
      "In den Sitzungen geht es darum, diese gelernten emotionalen Verknüpfungen zu erkennen und zu verändern.",
    ],
    primaryCta: { label: "Sitzung buchen", href: "/book" },
    secondaryCta: { label: "So funktioniert AAP", href: "#aap" },
  },
  trust: {
    statements: [
      "Menschen kommen nicht, weil sie sich selbst nicht verstehen.",
      "Die meisten tun es bereits.",
      "Sie kommen, weil Verstehen allein die Reaktion nicht verändert hat.",
      "Diese Arbeit konzentriert sich darauf, die Reaktion selbst zu verändern.",
    ],
  },
  about: {
    title: "Warum diese Arbeit existiert",
    story: [
      "Jahrelang habe ich dasselbe bei Klienten beobachtet: klare Einsicht, unveränderte Reaktion. Sie konnten das Muster perfekt beschreiben. Die Angst kam trotzdem. Der Rückzug trat trotzdem ein. Die Wut war schneller als jeder Gedanke.",
      "AAP ist aus dieser Beobachtung entstanden — und aus meiner eigenen Erfahrung mit Reaktionen, die Verstehen allein nicht erreichen konnte. Nicht aus einer Theorie, die ich beweisen wollte, sondern aus einer Frage, die nicht verschwand: Wenn jemand bereits weiß, warum er reagiert — was genau muss sich dann noch verändern?",
      "Die Antwort, wie ich sie sehe, ist die Verknüpfung selbst — die gelernte Verbindung zwischen einer vergangenen Erfahrung und einer gegenwärtigen Reaktion. Diese Arbeit existiert, um diese Verbindung direkt zu erreichen — durch einen strukturierten Sitzungsrahmen, der aus umfangreicher praktischer Arbeit und kontinuierlicher Beobachtung entstanden ist, wie sich automatische emotionale Reaktionen verschieben.",
    ],
  },
  aap: {
    title: "So funktioniert AAP",
    intro:
      "Adaptive Association Processing ist nichts, was man studiert. Es geschieht im Raum — leise, präzise, in dem Tempo, das Ihr System zulässt.",
    points: [
      {
        title: "Was in einer Sitzung passiert",
        description:
          "Wir lokalisieren eine bestimmte Reaktion — die, die noch automatisch auftritt — und verfolgen sie bis zur emotionalen Verknüpfung, die sie am Laufen hält. Die Sitzung bleibt auf diese Verbindung fokussiert. Es gibt keine Performance, keinen Druck zu Einsichten.",
      },
      {
        title: "Warum dieselbe Reaktion zurückkehrt",
        description:
          "Eine Reaktion wiederholt sich, wenn das Nervensystem den gegenwärtigen Moment noch als mit der Vergangenheit verbunden behandelt. Die Verknüpfung wurde gelernt. Sie lässt sich durch Verstehen allein schwer übersteuern, weil sie vor dem Denken wirkt.",
      },
      {
        title: "Wie eine Erinnerung in die Gegenwart reicht",
        description:
          "Eine emotionale Verknüpfung erfordert kein bewusstes Erinnern. Ein Ton, ein Blick, eine Situation kann dieselbe Reaktion auslösen, die die ursprüngliche Erfahrung hervorbrachte — selbst wenn die Person rational weiß, dass die Vergangenheit nicht die Gegenwart ist.",
      },
      {
        title: "Was sich verändern kann",
        description:
          "Wenn sich eine Verknüpfung verschiebt, kann die Reaktion, die ihr folgte, nachlassen oder ganz ausbleiben. Das ist kein Versprechen. Es ist, was Klienten oft beschreiben: kein neues Verständnis, sondern eine andere Reaktion im Alltag.",
      },
    ],
  },
  testimonials: {
    intro:
      "Das sind alltägliche Veränderungen, die Menschen oft bemerken, wenn sich eine automatische Reaktion zu verschieben beginnt. Nicht, weil sie sich mehr anstrengen oder anders denken, sondern weil die Reaktion selbst nicht mehr dieselbe ist.",
    items: [
      {
        title: "Das Kontrollieren hört auf",
        description:
          "Der Drang, die Social-Media-Aktivitäten eines Partners zu überwachen, verblasst einfach. Nicht durch Selbstkontrolle oder Disziplin, sondern weil das Nervensystem es nicht mehr als etwas behandelt, das kontrolliert werden muss.",
      },
      {
        title: "Die Enge lässt nach",
        description:
          "Enge in der Brust vor dem Sprechen bei der Arbeit kommt selten noch. Die Vorbereitung bleibt. Der Körper reagiert nicht mehr auf dieselbe Weise.",
      },
      {
        title: "Die Wut kommt seltener",
        description:
          "Wut, die nichts mit dem gegenwärtigen Moment zu tun hatte, kam nicht mehr dem Denken voraus. Die Situation änderte sich nicht. Die Reaktion schon.",
      },
    ],
  },
  faq: {
    headingLabel: "Fragen",
    heading: "Was Menschen fragen",
    items: [
      internationalFaq,
      {
        question: "Was passiert während einer Sitzung?",
        answer:
          "Wir identifizieren eine bestimmte automatische Reaktion und arbeiten mit der emotionalen Verknüpfung, die damit verbunden ist. Sitzungen sind strukturiert und fokussiert. Sie werden nicht gebeten, zu performen oder Einsichten zu produzieren — die Arbeit geschieht auf der Ebene der Verknüpfung selbst.",
      },
      {
        question: "Muss ich meine Vergangenheit noch einmal durchleben?",
        answer: [
          "Nicht so, wie die meisten Menschen es sich vorstellen.",
          "Das Ziel ist nicht, schmerzhafte Erfahrungen noch einmal zu durchleben oder in schwierigen Emotionen zu verweilen.",
          "Während der Sitzung aktivieren wir kurz die spezifische emotionale Erinnerung oder gelernte Verknüpfung, die mit Ihrer automatischen Reaktion verbunden ist. So erhält das Nervensystem Zugang zu dem Muster, das diese Reaktion heute noch aufrechterhält.",
          "Von dort verschiebt sich der Fokus darauf, wie das Nervensystem reagiert. Ziel ist nicht, die Vergangenheit wiederholt aufzuarbeiten, sondern zu ermöglichen, dass sich die Reaktion, die mit dieser Erinnerung verbunden ist, verändert.",
          "Die meisten Klienten sind überrascht, wie wenig Zeit mit dem Sprechen über die Vergangenheit verbracht wird — im Vergleich zur Zeit, die für Veränderung aufgewendet wird.",
        ],
      },
      {
        question: "Ist AAP Psychotherapie?",
        answer:
          "Ja. AAP ist ein strukturierter Sitzungsrahmen innerhalb der Psychotherapie. Es ist kein Coaching und keine eigenständige Technik außerhalb einer therapeutischen Beziehung.",
      },
      {
        question: "Wie viele Sitzungen haben Menschen in der Regel?",
        answer:
          "Das variiert. Manche arbeiten über mehrere Sitzungen an einem einzelnen Muster. Andere gehen länger weiter. Es gibt keine vorgeschriebene Dauer — wir arbeiten, bis sich die Reaktion, für die Sie gekommen sind, genug verschoben hat, um im Alltag spürbar zu sein.",
      },
      {
        question: "Kann das helfen, wenn ich bereits Therapie ausprobiert habe?",
        answer:
          "Oft ja — besonders wenn frühere Therapie Ihnen geholfen hat, Ihre Muster zu verstehen, die automatischen Reaktionen aber blieben. AAP adressiert eine andere Ebene: nicht die Geschichte über die Reaktion, sondern die Verknüpfung, die sie hervorbringt.",
      },
      {
        question: "Was, wenn ich in einer Krise bin?",
        answer:
          "Diese Praxis ist nicht für Notfallversorgung ausgestattet. Wenn Sie in unmittelbarer Gefahr sind oder eine psychische Krise erleben, wenden Sie sich bitte an Ihre örtlichen Notdienste oder eine Krisenhotline in Ihrer Region.",
      },
    ],
  },
  finalCta: {
    lines: [
      "Wenn Sie sich seit Jahren verstehen,",
      "Ihre Reaktionen sich aber noch automatisch anfühlen,",
      "fehlt vielleicht nicht das Verstehen.",
    ],
    button: { label: "Sitzung buchen", href: "/book" },
  },
  bookingPublic: {
    label: "Buchung",
    title: "Sitzung buchen",
    subtitle:
      "Beginnen Sie den Prozess, automatische Reaktionen zu verändern, die Ihnen nicht mehr dienen. Internationale Klienten willkommen — Sitzungen werden auf Englisch durchgeführt.",
  },
  bookingUi: {
    hero: {
      title: "Sitzung buchen",
      subtitle:
        "Beginnen Sie den Prozess, automatische Reaktionen zu verändern, die Ihnen nicht mehr dienen.",
    },
    services: {
      title: "Leistung auswählen",
      description: "Alle Angebote sind kostenpflichtige Sitzungen, die online stattfinden.",
      choose: "Auswählen",
      selected: "Ausgewählt",
    },
    calendar: {
      title: "Zeit wählen",
      packageTitle: "Erste Sitzung wählen",
      packageDescription:
        "Buchen Sie jetzt Ihre erste Sitzung. Sitzungen 2–5 können später einzeln über Ihr Klientenportal geplant werden.",
      description:
        "Wählen Sie eine verfügbare Online-Sitzung. Sie sehen nur Zeiten, zu denen Niks für Online-Arbeit verfügbar ist.",
      loading: "Verfügbare Zeiten werden geladen…",
      noAvailability:
        "In dem nächsten Buchungsfenster sind keine Online-Sitzungen verfügbar. Bitte schauen Sie bald wieder vorbei.",
      noSlots: "An diesem Datum sind keine Zeiten verfügbar.",
      showMoreTimes: "Mehr Zeiten anzeigen",
      showFewerTimes: "Weniger Zeiten anzeigen",
      courseStartTitle: "Startdatum wählen",
      courseStartDescription:
        "Wählen Sie, wann Ihr Kurs oder Programm beginnen soll.",
      courseStartLabel: "Kursstartdatum",
    },
    form: {
      title: "Ihre Angaben",
      description:
        "Diese Informationen helfen bei der Vorbereitung Ihrer Sitzung. Alles, was Sie hier teilen, ist vertraulich.",
      sessionIntentionLabel: "Sitzungsabsicht",
      sessionIntentionPlaceholder:
        "Beschreiben Sie kurz die Reaktion oder das Muster, an dem Sie arbeiten möchten.",
    },
    payment: {
      title: "Zahlung",
      description: "Schließen Sie Ihre Buchung sicher per Kartenzahlung ab.",
      stripeLabel: "Mit Karte bezahlen",
    },
    paymentSuccess: {
      title: "Zahlung bestätigt",
      errorTitle: "Zahlung konnte nicht verifiziert werden",
      message:
        "Vielen Dank — Ihre Zahlung wurde erfolgreich empfangen. Ihre Buchung ist bestätigt und Sie erhalten in Kürze eine Bestätigungs-E-Mail.",
      packageMessage:
        "Ihr Transformationspaket ist bestätigt. Sie erhalten eine E-Mail mit Ihren Buchungsdetails und Zugang zu Ihrem Client Portal.",
      courseMessage:
        "Ihr Kurs ist bestätigt. Sie erhalten in Kürze eine E-Mail mit Ihren Buchungsdetails.",
      closing:
        "Wenn die Bestätigungs-E-Mail nicht innerhalb weniger Minuten ankommt, prüfen Sie Ihren Spam-Ordner. Ich freue mich darauf, Sie kennenzulernen.",
      sessionLanguageNote:
        "Ihre Sitzung wird auf Englisch durchgeführt. Online-Sitzungen sind weltweit verfügbar.",
      missingSessionId:
        "Wir konnten Ihre Zahlung nicht verifizieren, da keine Checkout-Referenz angegeben wurde.",
      invalidSession:
        "Wir konnten keine gültige Checkout-Sitzung finden. Wenn Sie bezahlt haben, prüfen Sie bitte Ihre E-Mail oder kontaktieren Sie uns.",
      notPaid:
        "Ihre Zahlung wurde noch nicht abgeschlossen. Wenn Ihnen etwas berechnet wurde, kontaktieren Sie uns bitte mit Ihren Zahlungsdetails.",
      error:
        "Wir konnten Ihre Zahlung derzeit nicht verifizieren. Bitte versuchen Sie es in Kürze erneut oder prüfen Sie Ihre E-Mail auf eine Bestätigung.",
      tryAgain: "Zurück zur Buchung",
    },
    confirmation: {
      title: "Ihre Sitzung ist bestätigt.",
      message:
        "Eine Bestätigungs-E-Mail mit Ihren Sitzungsdetails wurde an die von Ihnen angegebene Adresse gesendet.",
      closing:
        "Falls sie nicht innerhalb weniger Minuten ankommt, prüfen Sie Ihren Spam-Ordner. Ich freue mich darauf, Sie kennenzulernen.",
      sessionLanguageNote:
        "Ihre Sitzung wird auf Englisch durchgeführt. Online-Sitzungen sind weltweit verfügbar.",
    },
    actions: {
      continue: "Weiter",
      back: "Zurück",
      confirmBooking: "Buchung bestätigen",
      returnHome: "Zur Startseite",
    },
  },
  seo: {
    home: {
      title: "Niks Ravins | Tiefe Transformation & Adaptive Association Processing",
      description:
        "Online-Sitzungen für tiefe Transformation mit Niks Ravins und Adaptive Association Processing (AAP). Arbeiten Sie an emotionalen Mustern, Beziehungen und persönlicher Transformation. Sitzungen auf Englisch, weltweit verfügbar.",
    },
    book: {
      title: "Sitzung buchen",
      description:
        "Buchen Sie eine Online-Transformationssitzung mit Niks Ravins. Erstsitzungen und 5-Sitzungs-Reisen weltweit verfügbar. Sitzungen werden auf Englisch durchgeführt.",
    },
  },
  footer: {
    rights: "Alle Rechte vorbehalten.",
  },
  languageSwitcherLabel: "Sprache wählen",
};
