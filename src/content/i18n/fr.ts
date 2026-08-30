import type { PublicContent } from "./types";

const internationalFaq = {
  question: "Dans quelle langue se déroulent les séances ?",
  answer:
    "Les séances se déroulent en anglais. Les clients internationaux sont les bienvenus — les séances en ligne sont disponibles dans le monde entier.",
};

export const frContent: PublicContent = {
  locale: "fr",
  translationStatus: "published",
  site: {
    name: "Niks Ravins",
    method: "Adaptive Association Processing (AAP)",
    availability: "En ligne, dans le monde entier",
    brandDescriptor: "Spécialiste de la réécriture des réponses automatiques du système nerveux",
    email: "hello@niksravins.com",
    bookingUrl: "/book",
  },
  internationalNotice: {
    line1: "En ligne, dans le monde entier",
    line2: "Les séances se déroulent en anglais",
  },
  header: {
    book: "Réserver",
    bookSession: "Réserver une séance",
    clientPortal: "Espace client",
  },
  sectionLabels: {
    trustHeading: "Pourquoi les gens viennent ici",
    aapLabel: "AAP",
    testimonialsLabel: "Changements observés",
    testimonialsHeading: "Ce qui se transforme au quotidien",
    contactHeading: "Contact",
    aboutImageAlt: "Portrait de Niks Ravins",
  },
  navigation: [
    { label: "À propos", href: "#about" },
    { label: "AAP", href: "#aap" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    name: "Niks Ravins",
    headline: "Vous comprenez la réaction. Elle se produit quand même.",
    explanation: [
      "Les réactions émotionnelles automatiques peuvent persister parce que le système nerveux les relie encore à des expériences passées précises.",
      "La plupart des personnes qui viennent ici comprennent déjà leurs schémas. En parler les a expliqués. Cela n'a pas changé la réaction.",
      "Les séances visent à identifier et à modifier ces associations émotionnelles apprises.",
    ],
    primaryCta: { label: "Réserver une séance", href: "/book" },
    secondaryCta: { label: "Comment fonctionne l'AAP", href: "#aap" },
  },
  trust: {
    statements: [
      "Les gens ne viennent pas parce qu'ils ne se comprennent pas.",
      "La plupart le font déjà.",
      "Ils viennent parce que la compréhension seule n'a pas changé la réaction.",
      "Ce travail se concentre sur le changement de la réaction elle-même.",
    ],
  },
  about: {
    title: "Pourquoi ce travail existe",
    story: [
      "Pendant des années, j'ai observé la même chose chez mes clients : une lucidité claire, une réaction inchangée. Ils pouvaient décrire le schéma à la perfection. L'anxiété arrivait quand même. Le repli sur soi venait quand même. La colère allait plus vite que la pensée.",
      "L'AAP est né de cette observation — et de ma propre expérience de réactions que la compréhension seule ne pouvait pas atteindre. Non pas d'une théorie que je voulais prouver, mais d'une question qui ne me quittait pas : si quelqu'un sait déjà pourquoi il réagit, qu'est-ce qui doit encore changer exactement ?",
      "La réponse, telle que je la vois, est l'association elle-même — le lien appris entre une expérience passée et une réponse présente. Ce travail existe pour atteindre ce lien directement, à travers un cadre de séance structuré, construit à partir d'un travail pratique approfondi et d'une observation continue de la façon dont les réactions émotionnelles automatiques se transforment.",
    ],
  },
  aap: {
    title: "Comment fonctionne l'AAP",
    intro:
      "L'Adaptive Association Processing n'est pas quelque chose que l'on étudie. C'est quelque chose qui se produit dans la séance — discrètement, avec précision, au rythme que votre système permet.",
    points: [
      {
        title: "Ce qui se passe pendant une séance",
        description:
          "Nous identifions une réaction précise — celle qui continue d'arriver automatiquement — et la remontons jusqu'à l'association émotionnelle qui la maintient. La séance reste centrée sur ce lien. Pas de performance, pas de course à l'insight.",
      },
      {
        title: "Pourquoi la même réaction revient",
        description:
          "Une réaction se répète lorsque le système nerveux traite encore un moment présent comme lié au passé. L'association a été apprise. Elle est difficile à surmonter par la seule compréhension, car elle opère avant la pensée.",
      },
      {
        title: "Comment un souvenir atteint le présent",
        description:
          "Une association émotionnelle ne nécessite pas de rappel conscient. Un ton, un regard, une situation peut activer la même réponse que l'expérience originale — même lorsque la personne sait, rationnellement, que le passé n'est pas le présent.",
      },
      {
        title: "Ce qui peut changer",
        description:
          "Lorsqu'une association se transforme, la réaction qui la suivait peut s'atténuer ou cesser d'apparaître. Ce n'est pas une promesse. C'est ce que décrivent souvent les clients : non pas une nouvelle compréhension, mais une réponse différente dans la vie quotidienne.",
      },
    ],
  },
  testimonials: {
    intro:
      "Voici des changements quotidiens que les gens remarquent souvent lorsqu'une réaction automatique commence à se transformer. Non pas parce qu'ils s'efforcent davantage ou pensent autrement, mais parce que la réaction elle-même n'est plus la même.",
    items: [
      {
        title: "La surveillance s'arrête",
        description:
          "L'envie de surveiller les réseaux sociaux d'un partenaire s'estompe simplement. Non pas par maîtrise de soi ou discipline, mais parce que le système nerveux ne la traite plus comme quelque chose à contrôler.",
      },
      {
        title: "La tension se relâche",
        description:
          "L'oppression dans la poitrine avant de parler au travail arrive rarement maintenant. La préparation continue. Le corps ne répond plus de la même manière.",
      },
      {
        title: "La colère arrive moins",
        description:
          "Une colère sans rapport avec le moment présent a cessé de précéder la pensée. La situation n'a pas changé. La réaction, si.",
      },
    ],
  },
  faq: {
    headingLabel: "Questions",
    heading: "Ce que les gens demandent",
    items: [
      internationalFaq,
      {
        question: "Que se passe-t-il pendant une séance ?",
        answer:
          "Nous identifions une réaction automatique précise et travaillons avec l'association émotionnelle qui y est liée. Les séances sont structurées et ciblées. On ne vous demande pas de performer ou de produire des insights — le travail se fait au niveau de l'association elle-même.",
      },
      {
        question: "Vais-je devoir revivre mon passé ?",
        answer: [
          "Pas de la manière dont la plupart des gens l'imaginent.",
          "L'objectif n'est pas de revivre des expériences douloureuses ou de rester dans des émotions difficiles.",
          "Pendant la séance, nous activons brièvement le souvenir émotionnel précis ou l'association apprise liée à votre réaction automatique. Cela donne au système nerveux accès au schéma qui maintient encore cette réponse aujourd'hui.",
          "De là, l'attention se déplace vers la modification de la réponse du système nerveux. L'objectif n'est pas de revisiter le passé de manière répétée, mais de permettre à la réaction liée à ce souvenir de changer.",
          "La plupart des clients sont surpris du peu de temps consacré à parler du passé, comparé au temps consacré à créer le changement.",
        ],
      },
      {
        question: "L'AAP est-il une psychothérapie ?",
        answer:
          "Oui. L'AAP est un cadre de séance structuré utilisé dans le cadre de la psychothérapie. Ce n'est pas du coaching, et ce n'est pas une technique autonome appliquée en dehors d'une relation thérapeutique.",
      },
      {
        question: "Combien de séances les gens ont-ils généralement ?",
        answer:
          "Cela varie. Certaines personnes travaillent sur un seul schéma sur plusieurs séances. D'autres continuent plus longtemps. Il n'y a pas de durée imposée — nous travaillons jusqu'à ce que la réaction pour laquelle vous êtes venu ait suffisamment changé pour compter dans votre vie quotidienne.",
      },
      {
        question: "Est-ce que cela peut aider si j'ai déjà essayé une thérapie ?",
        answer:
          "Souvent, oui — surtout si une thérapie antérieure vous a aidé à comprendre vos schémas mais que les réactions automatiques sont restées. L'AAP aborde une couche différente : non pas l'histoire autour de la réaction, mais l'association qui la produit.",
      },
      {
        question: "Et si je suis en crise ?",
        answer:
          "Cette pratique n'est pas équipée pour les urgences. Si vous êtes en danger immédiat ou traversez une crise de santé mentale, veuillez contacter les services d'urgence locaux ou une ligne d'écoute de crise dans votre région.",
      },
    ],
  },
  finalCta: {
    lines: [
      "Si vous vous comprenez depuis des années",
      "mais que vos réactions restent automatiques,",
      "peut-être que ce n'est pas la compréhension qui manque.",
    ],
    button: { label: "Réserver une séance", href: "/book" },
  },
  bookingPublic: {
    label: "Réservation",
    title: "Réserver une séance",
    subtitle:
      "Commencez le processus de transformation des réactions automatiques qui ne vous servent plus. Clients internationaux bienvenus — les séances se déroulent en anglais.",
  },
  bookingUi: {
    hero: {
      title: "Réserver une séance",
      subtitle:
        "Commencez le processus de transformation des réactions automatiques qui ne vous servent plus.",
    },
    services: {
      title: "Choisir une prestation",
      description: "Toutes les prestations sont des séances payantes en ligne.",
    },
    calendar: {
      title: "Choisir un horaire",
      packageTitle: "Choisir votre première séance",
      packageDescription:
        "Réservez votre première séance maintenant. Les séances 2 à 5 pourront être planifiées ultérieurement, une à la fois, depuis votre espace client.",
      description:
        "Sélectionnez une séance en ligne disponible. Vous ne verrez que les créneaux où Niks est disponible pour un travail en ligne.",
      loading: "Chargement des créneaux disponibles…",
      noAvailability:
        "Aucune séance en ligne n'est disponible dans la prochaine fenêtre de réservation. Veuillez revenir bientôt.",
      noSlots: "Aucun créneau disponible à cette date.",
      showMoreTimes: "Afficher plus de créneaux",
      showFewerTimes: "Afficher moins de créneaux",
      courseStartTitle: "Choisir la date de début",
      courseStartDescription:
        "Sélectionnez la date à laquelle vous souhaitez commencer votre cours ou programme.",
      courseStartLabel: "Date de début du cours",
    },
    form: {
      title: "Vos coordonnées",
      description:
        "Ces informations aident à préparer votre séance. Tout ce que vous partagez ici est confidentiel.",
      sessionIntentionLabel: "Intention de la séance",
      sessionIntentionPlaceholder:
        "Décrivez brièvement la réaction ou le schéma sur lequel vous souhaitez travailler.",
    },
    payment: {
      title: "Paiement",
      description: "Finalisez votre réservation en toute sécurité par carte bancaire.",
      stripeLabel: "Payer par carte",
    },
    paymentSuccess: {
      title: "Paiement confirmé",
      errorTitle: "Impossible de vérifier le paiement",
      message:
        "Merci — votre paiement a bien été reçu. Votre réservation est confirmée et vous recevrez un e-mail de confirmation sous peu.",
      packageMessage:
        "Votre parcours de transformation est confirmé. Vous recevrez un e-mail avec les détails de votre réservation et l'accès à votre Client Portal.",
      courseMessage:
        "Votre cours est confirmé. Vous recevrez un e-mail avec les détails de votre réservation sous peu.",
      closing:
        "Si l'e-mail de confirmation n'arrive pas dans quelques minutes, vérifiez votre dossier spam. J'ai hâte de vous rencontrer.",
      sessionLanguageNote:
        "Votre séance se déroulera en anglais. Les séances en ligne sont disponibles dans le monde entier.",
      missingSessionId:
        "Nous n'avons pas pu vérifier votre paiement car aucune référence de checkout n'a été fournie.",
      invalidSession:
        "Nous n'avons pas trouvé de session de checkout valide. Si vous avez payé, vérifiez votre e-mail ou contactez-nous.",
      notPaid:
        "Votre paiement n'a pas encore été finalisé. Si vous avez été débité, contactez-nous avec vos informations de paiement.",
      error:
        "Nous n'avons pas pu vérifier votre paiement pour le moment. Réessayez sous peu ou vérifiez votre e-mail pour une confirmation.",
      tryAgain: "Retour à la réservation",
    },
    confirmation: {
      title: "Votre séance est confirmée.",
      message:
        "Un e-mail de confirmation avec les détails de votre séance a été envoyé à l'adresse que vous avez indiquée.",
      closing:
        "S'il n'arrive pas dans quelques minutes, vérifiez votre dossier spam. J'ai hâte de vous rencontrer.",
      sessionLanguageNote:
        "Votre séance se déroulera en anglais. Les séances en ligne sont disponibles dans le monde entier.",
    },
    actions: {
      continue: "Continuer",
      back: "Retour",
      confirmBooking: "Confirmer la réservation",
      returnHome: "Retour à l'accueil",
    },
  },
  seo: {
    home: {
      title: "Niks Ravins | Transformation profonde & Adaptive Association Processing",
      description:
        "Séances de transformation profonde en ligne avec Niks Ravins et l'Adaptive Association Processing (AAP). Travaillez vos schémas émotionnels, vos relations et votre transformation personnelle. Séances en anglais, disponibles dans le monde entier.",
    },
    book: {
      title: "Réserver une séance",
      description:
        "Réservez une séance de transformation en ligne avec Niks Ravins. Premières séances et parcours de 5 séances disponibles dans le monde entier. Les séances se déroulent en anglais.",
    },
  },
  footer: {
    rights: "Tous droits réservés.",
  },
  languageSwitcherLabel: "Choisir la langue",
};
