import type { PublicContent } from "./types";

const internationalFaq = {
  question: "¿En qué idioma se realizan las sesiones?",
  answer:
    "Las sesiones se realizan en inglés. Los clientes internacionales son bienvenidos — las sesiones en línea están disponibles en todo el mundo.",
};

export const esContent: PublicContent = {
  locale: "es",
  translationStatus: "published",
  site: {
    name: "Niks Ravins",
    method: "Adaptive Association Processing (AAP)",
    availability: "En línea, en todo el mundo",
    brandDescriptor: "Especialista en la reescritura de respuestas automáticas del sistema nervioso",
    email: "hello@niksravins.com",
    bookingUrl: "/book",
  },
  internationalNotice: {
    line1: "En línea, en todo el mundo",
    line2: "Las sesiones se realizan en inglés",
  },
  header: {
    book: "Reservar",
    bookSession: "Reservar una sesión",
    clientPortal: "Portal del cliente",
  },
  sectionLabels: {
    trustHeading: "Por qué la gente viene aquí",
    aapLabel: "AAP",
    testimonialsLabel: "Cambios observados",
    testimonialsHeading: "Lo que cambia en la vida diaria",
    contactHeading: "Contacto",
    aboutImageAlt: "Retrato de Niks Ravins",
  },
  navigation: [
    { label: "Sobre mí", href: "#about" },
    { label: "AAP", href: "#aap" },
    { label: "FAQ", href: "#faq" },
    { label: "Contacto", href: "#contact" },
  ],
  hero: {
    name: "Niks Ravins",
    headline: "Entiendes la reacción. Aun así, ocurre.",
    explanation: [
      "Las reacciones emocionales automáticas pueden continuar porque el sistema nervioso aún las vincula a experiencias pasadas concretas.",
      "La mayoría de quienes vienen aquí ya comprenden sus patrones. Hablar los explicó. No cambió la reacción.",
      "Las sesiones se centran en identificar y modificar esas asociaciones emocionales aprendidas.",
    ],
    primaryCta: { label: "Reservar una sesión", href: "/book" },
    secondaryCta: { label: "Cómo funciona AAP", href: "#aap" },
  },
  trust: {
    statements: [
      "La gente no viene porque no se entienda a sí misma.",
      "La mayoría ya lo hace.",
      "Viene porque comprender por sí solo no cambió la reacción.",
      "Este trabajo se enfoca en cambiar la reacción misma.",
    ],
  },
  about: {
    title: "Por qué existe este trabajo",
    story: [
      "Durante años observé lo mismo en mis clientes: claridad, reacción sin cambios. Podían describir el patrón a la perfección. La ansiedad seguía llegando. El bloqueo seguía apareciendo. La ira se adelantaba al pensamiento.",
      "AAP surgió de esa observación — y de mi propia experiencia con reacciones que la comprensión sola no podía alcanzar. No de una teoría que quisiera demostrar, sino de una pregunta que no se iba: si alguien ya sabe por qué reacciona, ¿qué es exactamente lo que aún necesita cambiar?",
      "La respuesta, como la veo, es la asociación misma — el vínculo aprendido entre una experiencia pasada y una respuesta presente. Este trabajo existe para llegar a ese vínculo directamente, a través de un marco de sesión estructurado construido a partir de un extenso trabajo práctico y la observación continua de cómo cambian las reacciones emocionales automáticas.",
    ],
  },
  aap: {
    title: "Cómo funciona AAP",
    intro:
      "Adaptive Association Processing no es algo que se estudia. Es algo que ocurre en la sesión — en silencio, con precisión, al ritmo que tu sistema permite.",
    points: [
      {
        title: "Qué ocurre en una sesión",
        description:
          "Localizamos una reacción concreta — la que sigue apareciendo automáticamente — y la rastreamos hasta la asociación emocional que la mantiene activa. La sesión permanece centrada en ese vínculo. No hay actuación, ni prisa por generar insight.",
      },
      {
        title: "Por qué vuelve la misma reacción",
        description:
          "Una reacción se repite cuando el sistema nervioso aún trata un momento presente como conectado con el pasado. La asociación fue aprendida. Puede ser difícil anularla solo con comprensión, porque opera antes del pensamiento.",
      },
      {
        title: "Cómo un recuerdo llega al presente",
        description:
          "Una asociación emocional no requiere recuerdo consciente. Un tono, una mirada, una situación puede activar la misma respuesta que produjo la experiencia original — incluso cuando la persona sabe, racionalmente, que el pasado no es el presente.",
      },
      {
        title: "Qué puede cambiar",
        description:
          "Cuando una asociación se transforma, la reacción que la seguía puede suavizarse o dejar de aparecer por completo. No es una promesa. Es lo que los clientes suelen describir: no una nueva comprensión, sino una respuesta distinta en la vida diaria.",
      },
    ],
  },
  testimonials: {
    intro:
      "Estos son cambios cotidianos que la gente suele notar cuando una reacción automática empieza a transformarse. No porque se esfuercen más o piensen de otra manera, sino porque la reacción misma ya no es la misma.",
    items: [
      {
        title: "El controlar se detiene",
        description:
          "El impulso de revisar las redes sociales de la pareja simplemente se desvanece. No por autocontrol ni disciplina, sino porque el sistema nervioso ya no lo trata como algo que necesita vigilarse.",
      },
      {
        title: "La opresión se alivia",
        description:
          "La opresión en el pecho antes de hablar en el trabajo rara vez aparece ahora. La preparación continúa. El cuerpo ya no responde igual.",
      },
      {
        title: "La ira llega menos",
        description:
          "Una ira que no tenía que ver con el momento presente dejó de adelantarse al pensamiento. La situación no cambió. La reacción, sí.",
      },
    ],
  },
  faq: {
    headingLabel: "Preguntas",
    heading: "Lo que la gente pregunta",
    items: [
      internationalFaq,
      {
        question: "¿Qué ocurre durante una sesión?",
        answer:
          "Identificamos una reacción automática concreta y trabajamos con la asociación emocional vinculada a ella. Las sesiones son estructuradas y enfocadas. No se te pide actuar ni producir insight — el trabajo ocurre a nivel de la asociación misma.",
      },
      {
        question: "¿Tendré que revivir mi pasado?",
        answer: [
          "No de la manera que la mayoría imagina.",
          "El objetivo no es revivir experiencias dolorosas ni permanecer en emociones difíciles.",
          "Durante la sesión, activamos brevemente el recuerdo emocional concreto o la asociación aprendida vinculada a tu reacción automática. Esto le da al sistema nervioso acceso al patrón que aún mantiene esa respuesta hoy.",
          "A partir de ahí, el foco se desplaza hacia cambiar cómo responde el sistema nervioso. El objetivo no es revisitar el pasado una y otra vez, sino permitir que cambie la reacción vinculada a ese recuerdo.",
          "La mayoría de los clientes se sorprende de lo poco tiempo que se dedica a hablar del pasado, comparado con el tiempo dedicado a crear el cambio.",
        ],
      },
      {
        question: "¿Es AAP psicoterapia?",
        answer:
          "Sí. AAP es un marco de sesión estructurado utilizado dentro de la psicoterapia. No es coaching, ni una técnica independiente aplicada fuera de una relación terapéutica.",
      },
      {
        question: "¿Cuántas sesiones suelen tener las personas?",
        answer:
          "Varía. Algunas personas trabajan un solo patrón a lo largo de varias sesiones. Otras continúan más tiempo. No hay una duración prescrita — trabajamos hasta que la reacción por la que viniste haya cambiado lo suficiente para notarse en tu vida diaria.",
      },
      {
        question: "¿Puede ayudar si ya he probado terapia?",
        answer:
          "A menudo, sí — especialmente si una terapia anterior te ayudó a comprender tus patrones pero las reacciones automáticas permanecieron. AAP aborda una capa diferente: no la historia sobre la reacción, sino la asociación que la produce.",
      },
      {
        question: "¿Qué pasa si estoy en crisis?",
        answer:
          "Esta práctica no está equipada para atención de emergencia. Si estás en peligro inmediato o atravesando una crisis de salud mental, contacta con los servicios de emergencia locales o una línea de crisis en tu zona.",
      },
    ],
  },
  finalCta: {
    lines: [
      "Si te has comprendido durante años",
      "pero tus reacciones siguen sintiéndose automáticas,",
      "quizá no es la comprensión lo que falta.",
    ],
    button: { label: "Reservar una sesión", href: "/book" },
  },
  bookingPublic: {
    label: "Reserva",
    title: "Reservar una sesión",
    subtitle:
      "Comienza el proceso de cambiar las reacciones automáticas que ya no te sirven. Clientes internacionales bienvenidos — las sesiones se realizan en inglés.",
  },
  bookingUi: {
    hero: {
      title: "Reservar una sesión",
      subtitle:
        "Comienza el proceso de cambiar las reacciones automáticas que ya no te sirven.",
    },
    services: {
      title: "Seleccionar un servicio",
      description: "Todas las opciones son sesiones de pago realizadas en línea.",
    },
    calendar: {
      title: "Elegir un horario",
      packageTitle: "Elegir tu primera sesión",
      packageDescription:
        "Reserva tu primera sesión ahora. Las sesiones 2–5 pueden programarse más adelante, una a la vez, desde tu Portal del cliente.",
      description:
        "Selecciona una sesión en línea disponible. Solo verás horarios en los que Niks está disponible para trabajo en línea.",
      loading: "Cargando horarios disponibles…",
      noAvailability:
        "No hay sesiones en línea disponibles en la próxima ventana de reserva. Vuelve a consultar pronto.",
      noSlots: "No hay horarios disponibles en esta fecha.",
      showMoreTimes: "Mostrar más horarios",
      showFewerTimes: "Mostrar menos horarios",
    },
    form: {
      title: "Tus datos",
      description:
        "Esta información ayuda a preparar tu sesión. Todo lo que compartas aquí es confidencial.",
      sessionIntentionLabel: "Intención de la sesión",
      sessionIntentionPlaceholder:
        "Describe brevemente la reacción o el patrón en el que te gustaría trabajar.",
    },
    payment: {
      title: "Pago",
      description:
        "El procesamiento de pagos estará disponible en breve. Tu horario seleccionado se reservará una vez confirmado.",
      stripeLabel: "Pagar con tarjeta",
      paypalLabel: "Pagar con PayPal",
      placeholderNote: "Integración de pagos próximamente.",
    },
    confirmation: {
      title: "Tu sesión está confirmada.",
      message:
        "Se ha enviado un correo de confirmación con los detalles de tu sesión a la dirección que proporcionaste.",
      closing:
        "Si no llega en unos minutos, revisa tu carpeta de spam. Tengo ganas de conocerte.",
      sessionLanguageNote:
        "Tu sesión se realizará en inglés. Las sesiones en línea están disponibles en todo el mundo.",
    },
    actions: {
      continue: "Continuar",
      back: "Volver",
      confirmBooking: "Confirmar reserva",
      returnHome: "Volver al inicio",
    },
  },
  seo: {
    home: {
      title: "Niks Ravins | Transformación profunda y Adaptive Association Processing",
      description:
        "Sesiones de transformación profunda en línea con Niks Ravins y Adaptive Association Processing (AAP). Trabaja patrones emocionales, relaciones y transformación personal. Sesiones en inglés, disponibles en todo el mundo.",
    },
    book: {
      title: "Reservar una sesión",
      description:
        "Reserva una sesión de transformación en línea con Niks Ravins. Sesiones iniciales y recorridos de 5 sesiones disponibles en todo el mundo. Las sesiones se realizan en inglés.",
    },
  },
  footer: {
    rights: "Todos los derechos reservados.",
  },
  languageSwitcherLabel: "Elegir idioma",
};
