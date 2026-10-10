import type { PublicContent } from "./types";

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
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    primaryNavLabel: "Navigation principale",
    mobileNavLabel: "Navigation mobile",
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
    { label: "Explorer les options", href: "#want-change" },
    { label: "Changements identitaires", href: "#identity-shifts" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    name: "Niks Ravins",
    headline: "Vous comprenez la réaction. Elle se produit quand même.",
    explanation: [
      "Vous pouvez savoir que vous êtes en sécurité, que vous suffisez, que vous avez le droit de dire non, ou que vous êtes libre d’être vous-même — et réagir malgré tout comme si rien de tout cela n’était vrai.",
      "La question en dessous n’est souvent pas seulement pourquoi vous réagissez, mais ce que vous avez appris à devoir être pour être aimé, choisi, accepté, en sécurité ou assez.",
      "Cette réponse peut devenir une règle intérieure. Et la règle peut continuer d’organiser la réaction longtemps après que vous sachiez consciemment mieux.",
    ],
    primaryCta: { label: "Réserver une séance", href: "/book" },
    secondaryCta: { label: "Explorer les options", href: "#want-change" },
    tertiaryCta: { label: "Changements identitaires", href: "#identity-shifts" },
  },
  foundation: {
    intro: [
      { text: "Je travaille avec les " },
      { text: "connexions émotionnelles plus profondes", bold: true },
      { text: " et les " },
      { text: "croyances", bold: true },
      { text: " qui façonnent la façon dont vous " },
      { text: "vous vivez", bold: true },
      { text: ", ce que vous croyez " },
      { text: "mériter", bold: true },
      { text: ", et ce qui vous semble " },
      { text: "possible", bold: true },
      { text: "." },
    ],
    headline: [
      { text: "Changer le fondement intérieur." },
      { text: "Créer de l’espace pour une autre vie.", bold: true },
    ],
  },
  journey: {
    heading: "Vous voulez que quelque chose change.",
    steps: [
      [
        { text: "Peut-être que c’est votre " },
        { text: "relation", bold: true },
        { text: ". Peut-être que c’est votre " },
        { text: "travail", bold: true },
        { text: ". Peut-être que c’est la façon dont vous vous sentez vis-à-vis de " },
        { text: "vous-même", bold: true },
        { text: ". Peut-être savez-vous simplement que vous voulez " },
        { text: "plus de la vie", bold: true },
        { text: "." },
      ],
      [
        { text: "Vous comprenez ce qui " },
        { text: "ne", bold: true },
        { text: " fonctionne pas." },
      ],
      [
        { text: "Vous comprenez peut-être même ce qui vous " },
        { text: "retient", bold: true },
        { text: "." },
      ],
      [
        { text: "Mais savoir quelque chose " },
        { text: "ne le fait pas toujours changer", bold: true },
        { text: "." },
      ],
    ],
  },
  alignment: {
    heading: "Qu’est-ce qui semble désaligné ?",
    items: [
      {
        title: "Votre relation.",
        body: "Vous voulez vous sentir plus connecté, en sécurité, aimé ou libre dans votre relation — mais quelque chose continue de s’interposer.",
      },
      {
        title: "Votre travail.",
        body: "Vous détestez votre travail. Vous voulez autre chose. Vous savez que vous êtes capable de davantage et que vous méritez mieux, mais quelque chose vous maintient là où vous êtes.",
      },
      {
        title: "Votre confiance.",
        body: "Vous voulez prendre la parole, être vu, vous faire confiance et occuper de l’espace sans vous remettre sans cesse en question.",
      },
      {
        title: "Votre relation à vous-même.",
        body: "Vous en avez assez de douter de vous, de vous sentir insuffisant ou de devoir constamment prouver votre valeur.",
      },
      {
        title: "Vos rêves.",
        body: "Il y a des choses que vous voulez créer, vivre ou accomplir — mais vous continuez de vous retenir, de reporter, ou de rester dans ce qui vous est familier.",
      },
      {
        title: "Votre vie.",
        body: "Vous vous sentez bloqué, déconnecté, ou comme s’il manquait quelque chose. Vous savez que vous voulez plus, mais vous n’avez pas encore trouvé le chemin.",
      },
    ],
  },
  underneath: {
    intro: "Apportez ce qui vous trouble.\nCe qui vous retient. Ce que vous voulez changer.",
    headline: "Ensemble, nous regardons\nce qui peut se trouver en dessous.",
  },
  identityShifts: {
    heading: "Changer au niveau de l’identité",
    intro:
      "Parfois, ce qui vous retient n’est pas la situation elle-même,\nmais ce que vous croyez sur qui vous êtes et sur ce qui est sûr, possible ou mérité pour vous.",
    rows: [
      {
        from: "Je ne suis pas assez bien.",
        explanation:
          "Vous pouvez sans cesse vous prouver, vous comparer aux autres, ou vous retenir face à des opportunités, des relations et des expériences que vous voulez vraiment.",
        to: "Je suis assez.",
      },
      {
        from: "Je ne mérite pas mieux.",
        explanation:
          "Vous pouvez rester dans un travail, une relation ou une situation qui ne vous convient plus — même lorsque vous savez que vous voulez davantage.",
        to: "Je mérite mieux.",
      },
      {
        from: "Il est plus sûr de rester où je suis.",
        explanation:
          "Vous pouvez continuer de choisir ce qui est familier plutôt que de prendre le risque d’aller vers ce que vous voulez vraiment.",
        to: "Je peux choisir autrement.",
      },
      {
        from: "Je ne peux pas faire confiance aux gens.",
        explanation:
          "Vous pouvez avoir du mal à vous ouvrir, à recevoir du soutien ou à laisser vraiment quelqu’un s’approcher — même lorsque vous désirez profondément le lien.",
        to: "Je peux faire confiance.",
      },
      {
        from: "Je dois tout faire moi-même.",
        explanation:
          "Vous pouvez trouver difficile de recevoir, de vous détendre ou de laisser quelqu’un d’autre s’occuper des choses. Même lorsque vous voulez plus de douceur, d’aisance et d’espace, vous gardez le contrôle et portez tout vous-même.",
        to: "Je peux faire confiance et laisser faire.",
      },
      {
        from: "Je suis trop.",
        explanation:
          "Vous pouvez vous faire plus petit, cacher vos besoins ou retenir des parts de vous pour éviter le rejet.",
        to: "J’ai le droit d’être pleinement moi-même.",
      },
    ],
    closingLead: "Ces croyances ne ressemblent pas toujours à des pensées dans votre tête.",
    closing:
      "Parfois, elles apparaissent dans les choix que vous faites, les relations dans lesquelles vous restez,\nce que vous évitez, ou la vie que vous ne vous autorisez pas à avoir.",
  },
  roots: {
    intro:
      "Nous travaillons avec les croyances et les associations émotionnelles en dessous — celles qui peuvent façonner vos choix, votre comportement, vos relations et la façon dont vous vous vivez.",
    headline:
      "Quand le fondement intérieur change,\nla façon dont vous traversez la vie peut changer avec lui.",
  },
  trust: {
    statements: [
      "Vous pouvez comprendre pourquoi vous réagissez — et continuer de réagir.",
      "La jalousie, le contrôle, l’anxiété, le repli, le besoin de plaire, le sur-fonctionnement, la difficulté à dire non, la peur du rejet, le besoin de se prouver, se perdre dans les relations — tout cela peut sembler des problèmes séparés.",
      "Souvent, ce sont les branches d’un même tronc : une règle intérieure sur qui vous avez appris à devoir être pour rester connecté, en sécurité ou valorisé.",
      "Ce travail s’adresse à des personnes déjà lucides — qui constatent que la compréhension seule n’a pas nécessairement changé ce que la réaction fait ressentir lorsqu’elle arrive.",
    ],
  },
  about: {
    title: "Le tronc et les branches",
    story: [
      [
        "Une façon de comprendre le schéma est une image simple.",
        "Le tronc est la règle intérieure — par exemple : je dois être facile à aimer.",
        "Les branches sont la façon dont elle se manifeste : difficulté à dire non, sur-adaptation, peur du conflit, surveillance de l’humeur de l’autre, suppression de vos besoins, culpabilité lorsque vous vous choisissez.",
        "On peut passer des années à travailler sur les branches. Le travail devient souvent plus utile lorsque l’on regarde le tronc — parce que lorsque la règle sous-jacente commence à se transformer, les branches peuvent commencer à changer aussi.",
      ],
      [
        "Le recodage identitaire, c’est le sens de ce travail : découvrir les règles intérieures selon lesquelles vous avez appris à vivre — et explorer ce qui devient possible lorsqu’elles n’ont plus à organiser qui vous êtes.",
        "Ce n’est pas de la pensée positive, des affirmations forcées, ni une explication de plus de votre schéma. Il ne s’agit pas de devenir quelqu’un d’autre. Il s’agit de vivre avec moins besoin de vous organiser autour d’anciennes règles sur qui vous deviez être.",
      ],
      "Je travaille avec des personnes qui se comprennent déjà beaucoup — et qui voient pourtant la même réaction automatique arriver. Pendant des années, j’ai vu une lucidité claire associée à une réaction inchangée. C’est dans cet écart que vit ce travail : non pas dans plus de compréhension, mais dans la rencontre de la règle intérieure dans l’expérience — émotionnellement, relationnellement, dans le corps.",
    ],
  },
  aap: {
    title: "Comment le travail se fait en séance",
    intro: [
      "L’Adaptive Association Processing (AAP) est le processus thérapeutique structuré que j’utilise au sein de la psychothérapie pour travailler avec les associations apprises et l’expérience vécue qui peuvent maintenir une ancienne règle intérieure active dans le présent.",
      "Le recodage identitaire est ce dont il s’agit. L’AAP est la façon dont cela se passe dans la séance.",
    ],
    points: [
      {
        title: "Ce que « association » signifie ici",
        description: [
          "Une association est le lien appris entre une expérience et une réaction présente.",
          "Par exemple : vous pouvez apprendre que exprimer vos besoins risque de faire perdre le lien. L’association — mes besoins créent un danger — peut continuer d’opérer même lorsque vous savez rationnellement que vous êtes en sécurité. Vous avez donc appris à être celui ou celle qui s’adapte. L’AAP travaille directement avec ce lien, pas seulement avec l’histoire à son sujet.",
        ],
      },
      {
        title: "Ce qui se passe pendant une séance",
        description:
          "Nous localisons une réaction automatique précise et travaillons avec l’association et l’expérience vécue qui y sont liées. Les séances sont structurées et ciblées. On ne vous demande pas de performer ni de produire de l’insight. Le travail est expérientiel — il se fait à travers ce que vous pouvez réellement sentir et accompagner, non en parlant du schéma indéfiniment.",
      },
      {
        title: "Pourquoi le passé peut importer — sans le revivre",
        description:
          "Le passé peut être pertinent parce que les associations s’apprennent dans l’expérience. Nous pouvons brièvement activer la mémoire émotionnelle liée à votre réaction — assez pour accéder à ce qui la maintient active aujourd’hui. L’objectif n’est pas de revisiter l’enfance de manière répétée, mais de travailler avec ce qui maintient la réponse maintenant.",
      },
      {
        title: "Ce qui peut changer",
        description:
          "Lorsqu’une association se transforme et qu’une règle intérieure se desserre, la réaction qui la suivait peut s’adoucir ou devenir moins nécessaire. Ce n’est pas une promesse. Les clients décrivent souvent non pas une nouvelle personne, mais une expérience différente au quotidien — moins organisée autour de l’ancienne règle, plus capables de rester en lien avec eux-mêmes sans payer cela en culpabilité, en contrôle ou en abandon de soi.",
      },
    ],
  },
  testimonials: {
    intro:
      "Voici des changements quotidiens que les gens remarquent souvent lorsqu’une réaction automatique commence à se transformer. Non pas parce qu’ils s’efforcent davantage ou pensent autrement, mais parce que la réaction elle-même n’est plus la même.",
    items: [
      {
        title: "La surveillance s’arrête",
        description:
          "L’envie de surveiller les réseaux sociaux d’un partenaire s’estompe simplement. Non pas par maîtrise de soi ou discipline, mais parce que le système nerveux ne la traite plus comme quelque chose à contrôler.",
      },
      {
        title: "La tension se relâche",
        description:
          "L’oppression dans la poitrine avant de parler au travail arrive rarement maintenant. La préparation continue. Le corps ne répond plus de la même manière.",
      },
      {
        title: "La colère arrive moins",
        description:
          "Une colère sans rapport avec le moment présent a cessé de précéder la pensée. La situation n’a pas changé. La réaction, si.",
      },
    ],
  },
  faq: {
    headingLabel: "Questions",
    heading: "Ce que les gens demandent",
    items: [
      {
        question: "Qu’est-ce que le recodage identitaire ?",
        answer:
          "Le recodage identitaire est le nom que je donne à l’orientation plus large de ce travail : découvrir les règles intérieures selon lesquelles vous avez appris à vivre — qui vous avez appris à devoir être pour être aimé, choisi, accepté, en sécurité ou assez — et explorer ce qui devient possible lorsque ces règles n’ont plus à organiser vos réactions. C’est un langage conceptuel pour le travail, pas une affirmation médicale ou neuroscientifique.",
      },
      {
        question: "Qu’est-ce que l’AAP — et en quoi est-ce différent ?",
        answer:
          "L’Adaptive Association Processing (AAP) est le processus thérapeutique structuré que j’utilise au sein de la psychothérapie. Il travaille avec l’association apprise et l’expérience vécue qui peuvent maintenir une ancienne règle intérieure active. Le recodage identitaire décrit ce dont il s’agit ; l’AAP est la façon dont cela se passe dans la séance. Ce ne sont pas des produits séparés ni des méthodes concurrentes.",
      },
      {
        question: "Que se passe-t-il pendant une séance ?",
        answer:
          "Nous identifions une réaction automatique précise et travaillons avec l’association et l’expérience vécue qui y sont liées. Les séances sont structurées, calmes et ciblées. On ne vous demande pas de performer ni de produire de l’insight — le travail se fait par l’expérience directe du schéma, au rythme que vous pouvez accompagner.",
      },
      {
        question: "Et si je comprends déjà mes schémas ?",
        answer:
          "C’est souvent le point de départ. Beaucoup de personnes ici peuvent expliquer clairement leurs schémas — et voient pourtant la même réaction arriver. Ce travail s’adresse à l’écart entre savoir et vivre autrement : non pas une autre explication, mais un travail avec ce qui maintient le schéma vivant dans le présent.",
      },
      {
        question: "Quelle est la différence entre la première séance et le forfait ?",
        answer: [
          "La séance initiale de 45 minutes est votre premier pas : nous explorons vos schémas, comprenons ce qui les maintient, et déterminons la voie la plus efficace.",
          "Le forfait Deep Transformation de 5 × 45 minutes est un processus relié — un parcours à travers les séances pour aller plus loin et suivre ce qui se transforme. Vous réservez la première séance au paiement ; les séances suivantes se planifient depuis votre espace client.",
        ],
      },
      {
        question: "Les séances sont-elles en ligne et en anglais ?",
        answer:
          "Oui. Toutes les séances se déroulent en ligne, en anglais, avec des clients du monde entier.",
      },
    ],
  },
  finalCta: {
    lines: [
      "Vous comprenez peut-être déjà le schéma.",
      "La question plus intéressante peut être ce que vous avez appris à devoir être —",
      "et si cette règle a encore besoin d’organiser votre vie.",
    ],
    button: { label: "Réserver une séance", href: "/book" },
  },
  bookingPublic: {
    label: "Réservation",
    title: "Réserver une séance",
    subtitle:
      "Commencez le processus de transformation des réactions automatiques qui ne vous servent plus. Clients internationaux bienvenus — les séances se déroulent en anglais.",
  },
  bookingOffers: {
    "initial-aap-session": {
      title: "Séance initiale de 45 minutes",
      description:
        "Votre premier pas dans le processus. Ensemble, nous explorons vos schémas et réactions automatiques, comprenons ce qui les maintient, et déterminons la voie la plus efficace pour vous.",
      durationLabel: "45 minutes",
      priceLabel: "€90",
    },
    "aap-transformation-package": {
      title: "Forfait Deep Transformation 5 × 45 minutes",
      description:
        "Un processus de transformation structuré — non pas cinq rendez-vous séparés, mais un parcours relié conçu pour un changement durable et significatif.",
      detail:
        "Un changement durable demande généralement plus qu’une seule conversation. Travailler sur plusieurs séances permet d’aller plus loin, de suivre ce qui se transforme, et de créer un élan plutôt que de tout recommencer à chaque fois.",
      durationLabel: "5 séances · 45 minutes chacune",
      priceLabel: "€450 au total",
      checkoutNote:
        "Votre première séance est confirmée. Planifiez les 4 séances restantes depuis votre espace client.",
      highlights: [
        "Une compréhension plus profonde de vos schémas",
        "Travail avec les réactions sous-jacentes",
        "Suivi de l’évolution dans le temps",
        "Construire un changement durable",
        "Continuité et élan",
      ],
      bonuses: [
        "Personal Reaction Map",
        "Invitations à la réflexion entre les séances",
        "Planification prioritaire",
      ],
    },
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
      choose: "Choisir",
      selected: "Sélectionné",
    },
    steps: {
      progressLabel: "Progression de la réservation",
      session: "Séance",
      schedule: "Horaire",
      startDate: "Date de début",
      details: "Coordonnées",
      payment: "Paiement",
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
        "Aucune séance en ligne n’est disponible dans la prochaine fenêtre de réservation. Veuillez revenir bientôt.",
      noSlots: "Aucun créneau disponible à cette date.",
      showMoreTimes: "Afficher plus de créneaux",
      showFewerTimes: "Afficher moins de créneaux",
      courseStartTitle: "Choisir la date de début",
      courseStartDescription:
        "Sélectionnez la date à laquelle vous souhaitez commencer votre cours ou programme.",
      courseStartLabel: "Date de début du cours",
      weekdays: ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."],
      packageSessionNote: "Vous réservez aujourd’hui la séance 1 sur 5.",
      packageFollowUpNote:
        "Les séances 2 à 5 pourront être planifiées ultérieurement, une à la fois, depuis votre espace client.",
      localTimeNote: "Les horaires sont affichés dans votre fuseau horaire ({timezone}).",
      previousMonth: "Mois précédent",
      nextMonth: "Mois suivant",
      available: "disponible",
      unavailable: "indisponible",
      today: "aujourd’hui",
      selected: "sélectionné",
    },
    form: {
      title: "Vos coordonnées",
      description:
        "Ces informations aident à préparer votre séance. Tout ce que vous partagez ici est confidentiel.",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail",
      phoneOptional: "Téléphone (facultatif)",
      country: "Pays",
      timezone: "Fuseau horaire",
      selectCountry: "Choisir un pays",
      selectTimezone: "Choisir un fuseau horaire",
      sessionIntentionLabel: "Intention de la séance",
      sessionIntentionPlaceholder:
        "Décrivez brièvement la réaction ou le schéma sur lequel vous souhaitez travailler.",
      countries: [
        { value: "Latvia", label: "Lettonie" },
        { value: "United Kingdom", label: "Royaume-Uni" },
        { value: "Germany", label: "Allemagne" },
        { value: "France", label: "France" },
        { value: "United States", label: "États-Unis" },
        { value: "Canada", label: "Canada" },
        { value: "Australia", label: "Australie" },
        { value: "Netherlands", label: "Pays-Bas" },
        { value: "Sweden", label: "Suède" },
        { value: "Norway", label: "Norvège" },
        { value: "Other", label: "Autre" },
      ],
      timezones: [
        { value: "Europe/Riga", label: "Riga (EET/EEST)" },
        { value: "Europe/London", label: "Londres (GMT/BST)" },
        { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
        { value: "Europe/Paris", label: "Paris (CET/CEST)" },
        { value: "America/New_York", label: "New York (EST/EDT)" },
        { value: "America/Chicago", label: "Chicago (CST/CDT)" },
        { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
        { value: "Asia/Dubai", label: "Dubaï (GST)" },
        { value: "Asia/Singapore", label: "Singapour (SGT)" },
        { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
      ],
    },
    validation: {
      firstNameRequired: "Le prénom est requis.",
      lastNameRequired: "Le nom est requis.",
      emailRequired: "L’e-mail est requis.",
      emailInvalid: "Saisissez une adresse e-mail valide.",
      phoneInvalid: "Saisissez un numéro de téléphone valide.",
      countryRequired: "Le pays est requis.",
      timezoneRequired: "Le fuseau horaire est requis.",
      sessionIntentionRequired: "Veuillez indiquer l’intention de votre séance.",
      futureStartDate: "Veuillez choisir une date de début future.",
      availabilityLoadError:
        "Impossible de charger les créneaux disponibles. Veuillez réessayer.",
      incompleteDetails:
        "Vos informations de réservation sont incomplètes. Revenez en arrière et remplissez tous les champs obligatoires avant de confirmer.",
      checkoutError: "Impossible de démarrer le paiement. Veuillez réessayer.",
      invalidSessionType: "Veuillez choisir un type de séance valide.",
      selectCourseStartDate: "Veuillez choisir une date de début de cours.",
      invalidStartDate: "La date de début sélectionnée n’est pas valide.",
      selectTimeSlot: "Veuillez choisir un créneau.",
      selectScheduledTime: "Veuillez choisir un horaire.",
      invalidTime: "L’horaire sélectionné n’est pas valide.",
      futureTimeSlot: "Veuillez choisir un créneau futur.",
      serviceUnavailable: "La prestation sélectionnée n’est pas disponible.",
      invalidPrice: "Prix de prestation invalide.",
      stripeNoUrl: "Stripe n’a pas renvoyé d’URL de paiement.",
      stripeCreateFailed: "Impossible de créer la session de paiement Stripe.",
    },
    payment: {
      title: "Paiement",
      description: "Finalisez votre réservation en toute sécurité par carte bancaire.",
      stripeLabel: "Payer par carte",
      redirecting: "Redirection…",
    },
    paymentSuccess: {
      title: "Paiement confirmé",
      errorTitle: "Impossible de vérifier le paiement",
      message:
        "Merci — votre paiement a bien été reçu. Votre réservation est confirmée et vous recevrez un e-mail de confirmation sous peu.",
      packageMessage:
        "Votre parcours de transformation est confirmé. Vous recevrez un e-mail avec les détails de votre réservation et l’accès à votre espace client.",
      courseMessage:
        "Votre cours est confirmé. Vous recevrez un e-mail avec les détails de votre réservation sous peu.",
      closing:
        "Si l’e-mail de confirmation n’arrive pas dans quelques minutes, vérifiez votre dossier spam. J’ai hâte de vous rencontrer.",
      sessionLanguageNote:
        "Votre séance se déroulera en anglais. Les séances en ligne sont disponibles dans le monde entier.",
      missingSessionId:
        "Nous n’avons pas pu vérifier votre paiement car aucune référence de paiement n’a été fournie.",
      invalidSession:
        "Nous n’avons pas trouvé de session de paiement valide. Si vous avez payé, vérifiez votre e-mail ou contactez-nous.",
      notPaid:
        "Votre paiement n’a pas encore été finalisé. Si vous avez été débité, contactez-nous avec vos informations de paiement.",
      error:
        "Nous n’avons pas pu vérifier votre paiement pour le moment. Réessayez sous peu ou vérifiez votre e-mail pour une confirmation.",
      tryAgain: "Retour à la réservation",
    },
    confirmation: {
      title: "Votre séance est confirmée.",
      message:
        "Un e-mail de confirmation avec les détails de votre séance a été envoyé à l’adresse que vous avez indiquée.",
      closing:
        "S’il n’arrive pas dans quelques minutes, vérifiez votre dossier spam. J’ai hâte de vous rencontrer.",
      sessionLanguageNote:
        "Votre séance se déroulera en anglais. Les séances en ligne sont disponibles dans le monde entier.",
    },
    actions: {
      continue: "Continuer",
      back: "Retour",
      confirmBooking: "Confirmer la réservation",
      returnHome: "Retour à l’accueil",
    },
  },
  seo: {
    home: {
      title: "Niks Ravins | Recodage identitaire & Adaptive Association Processing",
      description:
        "Psychothérapie pour adultes lucides dont les réactions automatiques persistent malgré la compréhension. Travail sur les règles intérieures et les associations apprises. Séances en ligne en anglais, dans le monde entier.",
    },
    book: {
      title: "Réserver une séance",
      description:
        "Réservez une séance de transformation en ligne avec Niks Ravins. Premières séances et parcours de 5 séances disponibles dans le monde entier. Les séances se déroulent en anglais.",
    },
    legal: {
      title: "Mentions légales",
      description: "Mentions légales de Niks Ravins. Tous droits réservés.",
    },
  },
  legal: {
    heading: "Mentions légales",
    body: "Niks Ravins. Tous droits réservés.",
    contactLabel: "Contact :",
  },
  footer: {
    rights: "Tous droits réservés.",
    backToTop: "Haut de page",
    navLabel: "Pied de page",
  },
  languageSwitcherLabel: "Choisir la langue",
};
