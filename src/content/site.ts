export const siteConfig = {
  name: "Niks Ravins",
  method: "Adaptive Association Processing (AAP)",
  availability: "Online sessions worldwide",
  brandDescriptor: "Automatic Nervous System Response Rewriting Specialist",
  email: "hello@niksravins.com",
  bookingUrl: "/book",
} as const;

export const navigation = [
  { label: "About", href: "#about" },
  { label: "AAP", href: "#aap" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

export const hero = {
  name: "Niks Ravins",
  headline: "You understand the reaction. It still happens.",
  explanation: [
    "Automatic emotional reactions can continue because the nervous system still links them to specific past experiences.",
    "Most people who come here already understand their patterns. Talking explained them. It did not change the reaction.",
    "Sessions focus on identifying and changing those learned emotional associations.",
  ],
  primaryCta: { label: "Book a Session", href: "/book" },
  secondaryCta: { label: "How AAP Works", href: "#aap" },
} as const;

export const trust = {
  statements: [
    "People don't come because they don't understand themselves.",
    "Most already do.",
    "They come because understanding alone didn't change the reaction.",
    "This work focuses on changing the reaction itself.",
  ],
} as const;

export const about = {
  title: "Why this work exists",
  story: [
    "For years, I watched the same thing repeat across clients: clear insight, unchanged reaction. They could describe the pattern perfectly. The anxiety still arrived. The shutdown still came. The anger still moved faster than thought.",
    "AAP grew from that observation — and from my own experience of reactions that understanding alone could not reach. Not from a theory I wanted to prove, but from a question that would not leave: if someone already knows why they react, what exactly still needs to change?",
    "The answer, as I came to see it, is the association itself — the learned link between a past experience and a present response. This work exists to reach that link directly, through a structured session framework built from extensive practical work and continuous observation of how automatic emotional reactions shift.",
  ],
} as const;

export const aap = {
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
} as const;

export const testimonials = {
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
} as const;

export const faq = [
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
] as const;

export const finalCta = {
  lines: [
    "If you've understood yourself for years",
    "but your reactions still feel automatic,",
    "perhaps it isn't understanding that's missing.",
  ],
  button: { label: "Book a Session", href: "/book" },
} as const;
