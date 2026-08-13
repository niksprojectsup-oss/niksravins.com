import type { Locale } from "@/lib/i18n/config";

export type FaqItem = {
  question: string;
  answer: string | string[];
};

export type PublicSeoContent = {
  home: {
    title: string;
    description: string;
  };
  book: {
    title: string;
    description: string;
  };
};

export type BookingUiContent = {
  hero: { title: string; subtitle: string };
  services: { title: string; description: string };
  calendar: {
    title: string;
    packageTitle: string;
    packageDescription: string;
    description: string;
    loading: string;
    noAvailability: string;
    noSlots: string;
    showMoreTimes: string;
    showFewerTimes: string;
  };
  form: {
    title: string;
    description: string;
    sessionIntentionLabel: string;
    sessionIntentionPlaceholder: string;
  };
  payment: {
    title: string;
    description: string;
    stripeLabel: string;
    paypalLabel: string;
    placeholderNote: string;
  };
  confirmation: {
    title: string;
    message: string;
    closing: string;
    sessionLanguageNote: string;
  };
  actions: {
    continue: string;
    back: string;
    confirmBooking: string;
    returnHome: string;
  };
};

export type PublicContent = {
  locale: Locale;
  translationStatus: "published";
  site: {
    name: string;
    method: string;
    availability: string;
    brandDescriptor: string;
    email: string;
    bookingUrl: string;
  };
  internationalNotice: {
    line1: string;
    line2: string;
  };
  header: {
    book: string;
    bookSession: string;
    clientPortal: string;
  };
  sectionLabels: {
    trustHeading: string;
    aapLabel: string;
    testimonialsLabel: string;
    testimonialsHeading: string;
    contactHeading: string;
    aboutImageAlt: string;
  };
  navigation: ReadonlyArray<{ label: string; href: string }>;
  hero: {
    name: string;
    headline: string;
    explanation: readonly string[];
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  trust: {
    statements: readonly string[];
  };
  about: {
    title: string;
    story: readonly string[];
  };
  aap: {
    title: string;
    intro: string;
    points: ReadonlyArray<{ title: string; description: string }>;
  };
  testimonials: {
    intro: string;
    items: ReadonlyArray<{ title: string; description: string }>;
  };
  faq: {
    headingLabel: string;
    heading: string;
    items: readonly FaqItem[];
  };
  finalCta: {
    lines: readonly string[];
    button: { label: string; href: string };
  };
  bookingPublic: {
    label: string;
    title: string;
    subtitle: string;
  };
  bookingUi: BookingUiContent;
  seo: PublicSeoContent;
  footer: {
    rights: string;
  };
  languageSwitcherLabel: string;
};
