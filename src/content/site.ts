export const siteConfig = {
  name: "Niks Ravins",
  tagline: "Psychotherapist",
  email: "hello@niksravins.com",
  bookingUrl: "#contact",
} as const;

export const navigation = [
  { label: "About", href: "#about" },
  { label: "AAP", href: "#aap" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

export const hero = {
  name: "Niks Ravins",
  headline: "Helping your nervous system stop reacting to the past.",
  subheadline: "A calm nervous system changes everything.",
  primaryCta: { label: "Book a Session", href: "#contact" },
  secondaryCta: { label: "Learn about AAP", href: "#aap" },
} as const;

export const trust = {
  text: "Many emotional reactions are not character flaws. They are learned nervous system patterns — responses your body memorized when staying alert felt necessary. Understanding this is the first step toward change that lasts.",
} as const;

export const about = {
  story: [
    "I work with people whose reactions feel automatic — the sudden anxiety, the shutdown, the anger that arrives before thought. Often, these patterns formed long ago, when they served a purpose.",
    "My approach combines clinical training with a deep respect for how the nervous system actually learns and unlearns. Sessions are structured, unhurried, and grounded in what research tells us about memory, emotion, and recovery.",
  ],
  why: "When your nervous system no longer treats the present as the past, clarity returns. Decisions feel possible again. Relationships soften. This work matters because regulation is not a luxury — it is the foundation for everything else.",
} as const;

export const aap = {
  title: "Adaptive Association Processing",
  intro:
    "AAP is a structured method for updating the associations your nervous system holds between past experience and present response. It works with how memory is stored in the body — not against it.",
  steps: [
    {
      number: "01",
      title: "Map the pattern",
      description:
        "We identify the specific triggers, bodily sensations, and automatic responses that keep repeating — without judgment, with precision.",
    },
    {
      number: "02",
      title: "Access the association",
      description:
        "Through focused, guided processing, we reach the stored connection between a past event and your current reaction — the link your nervous system still operates from.",
    },
    {
      number: "03",
      title: "Update the response",
      description:
        "The association is reprocessed so the body can distinguish then from now. The memory remains; the automatic reaction loosens.",
    },
    {
      number: "04",
      title: "Integrate the change",
      description:
        "New responses are reinforced through practice and reflection. Stability builds gradually — not as performance, but as physiology.",
    },
  ],
} as const;

export const testimonials = [
  {
    quote:
      "I stopped trying to think my way out of reactions that were happening in my body. That shift alone changed how I show up in my work and my marriage.",
    attribution: "Client, 38",
  },
  {
    quote:
      "The sessions felt calm and precise. Nothing was rushed. For the first time, I understood why I responded the way I did — and that it could actually change.",
    attribution: "Client, 45",
  },
  {
    quote:
      "I came in exhausted from managing anxiety I didn't fully understand. Now I have language for it, and more importantly, my body handles stress differently.",
    attribution: "Client, 31",
  },
] as const;

export const faq = [
  {
    question: "What happens in a first session?",
    answer:
      "We begin with what brought you here. I ask about your history, current patterns, and what you hope will be different. There is no pressure to share more than feels right. The goal is to understand your nervous system, not to diagnose you quickly.",
  },
  {
    question: "How is AAP different from talk therapy?",
    answer:
      "Talk therapy works primarily through insight and narrative. AAP works directly with how associations are stored and updated in the nervous system. We still talk — but the focus is on processing the patterns that run beneath words.",
  },
  {
    question: "How long does the work take?",
    answer:
      "Some people notice shifts within several sessions. Deeper patterns often require more time. We move at a pace your nervous system can tolerate — not faster, not slower than necessary.",
  },
  {
    question: "Do you offer online sessions?",
    answer:
      "Yes. Online sessions are conducted with the same structure and care as in-person work. What matters most is that you are in a private, undisturbed space.",
  },
  {
    question: "What if I am in crisis?",
    answer:
      "This practice is not equipped for emergency care. If you are in immediate danger or experiencing a mental health crisis, please contact your local emergency services or a crisis helpline in your area.",
  },
] as const;

export const finalCta = {
  headline: "When you are ready, we can begin.",
  subtext:
    "Reach out to schedule an initial conversation. There is no obligation — only space to see if this work fits.",
  button: { label: "Book a Session", href: "#contact" },
} as const;
