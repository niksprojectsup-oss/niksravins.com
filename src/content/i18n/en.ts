import type { PublicContent } from "./types";

const internationalFaq = {
  question: "What language are sessions conducted in?",
  answer:
    "Sessions are conducted in English. International clients are welcome, and online sessions are available worldwide.",
};

export const enContent: PublicContent = {
  locale: "en",
  translationStatus: "published",
  site: {
    name: "Niks Ravins",
    method: "Adaptive Association Processing (AAP)",
    availability: "Online worldwide",
    brandDescriptor: "Automatic Nervous System Response Rewriting Specialist",
    email: "hello@niksravins.com",
    bookingUrl: "/book",
  },
  internationalNotice: {
    line1: "Online worldwide",
    line2: "Sessions are conducted in English",
  },
  header: {
    book: "Book",
    bookSession: "Book a Session",
    clientPortal: "Client Portal",
  },
  sectionLabels: {
    trustHeading: "Why people come here",
    aapLabel: "AAP",
    testimonialsLabel: "Observed changes",
    testimonialsHeading: "What shifts in daily life",
    contactHeading: "Contact",
    aboutImageAlt: "Portrait of Niks Ravins",
  },
  navigation: [
    { label: "About", href: "#about" },
    { label: "AAP", href: "#aap" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    name: "Niks Ravins",
    headline: "You understand the reaction But It still happens",
    explanation: [
      "Automatic emotional reactions can continue because the nervous system still links them to specific past experiences.",
      "Most people who come here already understand their patterns. Talking explained them. It did not change the reaction.",
      "Sessions focus on identifying and changing those learned emotional associations.",
    ],
    primaryCta: { label: "Book a Session", href: "/book" },
    secondaryCta: { label: "How AAP Works", href: "#aap" },
  },
  trust: {
    statements: [
      "People don't come because they don't understand themselves.",
      "Most already do.",
      "They come because understanding alone didn't change the reaction.",
      "This work focuses on changing the reaction itself.",
    ],
  },
  about: {
    title: "Why this work exists",
    story: [
      "For years, I watched the same thing repeat across clients: clear insight, unchanged reaction. They could describe the pattern perfectly. The anxiety still arrived. The shutdown still came. The anger still moved faster than thought.",
      "AAP grew from that observation — and from my own experience of reactions that understanding alone could not reach. Not from a theory I wanted to prove, but from a question that would not leave: if someone already knows why they react, what exactly still needs to change?",
      "The answer, as I came to see it, is the association itself — the learned link between a past experience and a present response. This work exists to reach that link directly, through a structured session framework built from extensive practical work and continuous observation of how automatic emotional reactions shift.",
    ],
  },
  aap: {
    title: "How AAP works",
    intro:
      "Adaptive Association Processing is not something you study. It is something that happens in the room — quietly, precisely, at the pace your system allows.",
    points: [
      {
        title: "What happens in a session",
        description:
          "We locate a specific reaction — the one that still arrives automatically — and trace it to the emotional association that keeps it running. The session stays focused on that link. There is no performance, no rush to insight.",
      },
      {
        title: "Why the same reaction returns",
        description:
          "A reaction repeats when the nervous system still treats a present moment as connected to a past one. The association was learned. It can be difficult to override through understanding alone because it operates before thought.",
      },
      {
        title: "How one memory reaches into the present",
        description:
          "An emotional association does not require conscious recall. A tone, a look, a situation can activate the same response the original experience produced — even when the person knows, rationally, that the past is not the present.",
      },
      {
        title: "What may change",
        description:
          "When an association shifts, the reaction that followed it may soften or stop arriving altogether. This is not a promise. It is what clients often describe: not a new understanding, but a different response in daily life.",
      },
    ],
  },
  testimonials: {
    intro:
      "These are everyday changes people often notice after an automatic reaction begins to change. Not because they try harder or think differently, but because the reaction itself is no longer the same.",
    items: [
      {
        title: "The checking stops",
        description:
          "The urge to monitor a partner's social media simply fades. Not through self-control or discipline, but because the nervous system no longer treats it as something that needs to be checked.",
      },
      {
        title: "The tightening eases",
        description:
          "Chest tightness before speaking at work rarely comes now. Preparation continues. The body no longer responds the same way.",
      },
      {
        title: "The anger arrives less",
        description:
          "Anger that had nothing to do with the present moment stopped coming ahead of thought. The situation didn't change. The reaction did.",
      },
    ],
  },
  faq: {
    headingLabel: "Questions",
    heading: "What people ask",
    items: [
      internationalFaq,
      {
        question: "What happens during a session?",
        answer:
          "We identify a specific automatic reaction and work with the emotional association connected to it. Sessions are structured and focused. You are not asked to perform or produce insight — the work happens at the level of the association itself.",
      },
      {
        question: "Will I have to relive my past?",
        answer: [
          "Not in the way most people imagine.",
          "The goal is not to relive painful experiences or stay in difficult emotions.",
          "During the session, we briefly activate the specific emotional memory or learned association connected to your automatic reaction. This gives the nervous system access to the pattern that is still maintaining that response today.",
          "From there, the focus shifts to changing how the nervous system responds. The aim is not to repeatedly revisit the past, but to allow the reaction connected to that memory to change.",
          "Most clients are surprised by how little time is spent talking about the past compared with the amount of time spent creating change.",
        ],
      },
      {
        question: "Is AAP psychotherapy?",
        answer:
          "Yes. AAP is a structured session framework used within psychotherapy. It is not coaching, and it is not a standalone technique applied outside a therapeutic relationship.",
      },
      {
        question: "How many sessions do people usually have?",
        answer:
          "It varies. Some people work on a single pattern over several sessions. Others continue longer. There is no prescribed course length — we work until the reaction you came for has shifted enough to matter in your daily life.",
      },
      {
        question: "Can this help if I've already tried therapy?",
        answer:
          "Often, yes — especially if previous therapy helped you understand your patterns but the automatic reactions remained. AAP addresses a different layer: not the story about the reaction, but the association that produces it.",
      },
      {
        question: "What if I am in crisis?",
        answer:
          "This practice is not equipped for emergency care. If you are in immediate danger or experiencing a mental health crisis, please contact your local emergency services or a crisis helpline in your area.",
      },
    ],
  },
  finalCta: {
    lines: [
      "If you've understood yourself for years",
      "but your reactions still feel automatic,",
      "perhaps it isn't understanding that's missing.",
    ],
    button: { label: "Book a Session", href: "/book" },
  },
  bookingPublic: {
    label: "Booking",
    title: "Book a Session",
    subtitle:
      "Begin the process of changing the automatic reactions that no longer serve you. International clients welcome — sessions are conducted in English.",
  },
  bookingUi: {
    hero: {
      title: "Book a Session",
      subtitle:
        "Begin the process of changing the automatic reactions that no longer serve you.",
    },
    services: {
      title: "Select a service",
      description: "All offerings are paid sessions conducted online.",
      choose: "Choose",
      selected: "Selected",
    },
    calendar: {
      title: "Choose a time",
      packageTitle: "Choose your first session",
      packageDescription:
        "Book your first session now. Sessions 2–5 can be scheduled later, one at a time, from your Client Portal.",
      description:
        "Select an available online session. You'll only see times when Niks is available for online work.",
      loading: "Loading available times…",
      noAvailability:
        "No online sessions are available in the next booking window. Please check back soon.",
      noSlots: "No available times on this date.",
      showMoreTimes: "Show more times",
      showFewerTimes: "Show fewer times",
      courseStartTitle: "Choose your start date",
      courseStartDescription:
        "Select when you would like your course or program to begin.",
      courseStartLabel: "Course start date",
    },
    form: {
      title: "Your details",
      description:
        "This information helps prepare for your session. Everything shared here is confidential.",
      sessionIntentionLabel: "Session intention",
      sessionIntentionPlaceholder:
        "Briefly describe the reaction or pattern you would like to work on.",
    },
    payment: {
      title: "Payment",
      description: "Complete your booking securely with card payment.",
      stripeLabel: "Pay with card",
    },
    paymentSuccess: {
      title: "Payment confirmed",
      errorTitle: "Payment could not be verified",
      message:
        "Thank you — your payment has been successfully received. Your booking is confirmed and you'll receive a confirmation email shortly.",
      packageMessage:
        "Your transformation package is confirmed. You'll receive an email with your booking details and access to your Client Portal.",
      courseMessage:
        "Your course is confirmed. You'll receive an email with your booking details shortly.",
      closing:
        "If the confirmation email does not arrive within a few minutes, check your spam folder. I look forward to meeting you.",
      sessionLanguageNote:
        "Your session will be conducted in English. Online sessions are available worldwide.",
      missingSessionId:
        "We could not verify your payment because no checkout reference was provided.",
      invalidSession:
        "We could not find a valid checkout session. If you completed payment, please check your email or contact us.",
      notPaid:
        "Your payment has not been completed yet. If you were charged, please contact us with your payment details.",
      error:
        "We could not verify your payment right now. Please try again shortly or check your email for confirmation.",
      tryAgain: "Return to booking",
    },
    confirmation: {
      title: "Your session is confirmed.",
      message:
        "A confirmation email with your session details has been sent to the address you provided.",
      closing:
        "If it does not arrive within a few minutes, check your spam folder. I look forward to meeting you.",
      sessionLanguageNote:
        "Your session will be conducted in English. Online sessions are available worldwide.",
    },
    actions: {
      continue: "Continue",
      back: "Back",
      confirmBooking: "Confirm booking",
      returnHome: "Return home",
    },
  },
  seo: {
    home: {
      title: "Niks Ravins | Deep Transformation & Adaptive Association Processing",
      description:
        "Online deep transformation sessions with Niks Ravins using Adaptive Association Processing (AAP). Work with emotional patterns, relationships and personal transformation. Sessions conducted in English, available worldwide.",
    },
    book: {
      title: "Book a Session",
      description:
        "Book an online transformation session with Niks Ravins. Initial sessions and 5-session journeys available worldwide. Sessions are conducted in English.",
    },
  },
  footer: {
    rights: "All rights reserved.",
  },
  languageSwitcherLabel: "Choose language",
};
