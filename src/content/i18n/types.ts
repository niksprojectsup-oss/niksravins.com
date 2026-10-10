import type { CmsParagraphField } from "@/content/cms/types";
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
  legal: {
    title: string;
    description: string;
  };
};

export type BookingOfferCopy = {
  title: string;
  description: string;
  detail?: string;
  durationLabel?: string;
  priceLabel?: string;
  checkoutNote?: string;
  highlights?: readonly string[];
  bonuses?: readonly string[];
};

export type CountryOption = {
  value: string;
  label: string;
};

export type TimezoneOption = {
  value: string;
  label: string;
};

export type EmphasizedRun = {
  text: string;
  bold?: boolean;
};

export type HomeAlignmentItem = {
  title: string;
  body: string;
};

export type HomeIdentityShiftRow = {
  from: string;
  explanation: string;
  to: string;
};

export type ClientDetailErrorMessages = {
  firstNameRequired: string;
  lastNameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  phoneInvalid: string;
  countryRequired: string;
  timezoneRequired: string;
  sessionIntentionRequired: string;
};

export type BookingUiContent = {
  hero: { title: string; subtitle: string };
  services: { title: string; description: string; choose: string; selected: string };
  steps: {
    progressLabel: string;
    session: string;
    schedule: string;
    startDate: string;
    details: string;
    payment: string;
  };
  calendar: {
    title: string;
    packageTitle: string;
    packageDescription: string;
    description: string;
    courseStartTitle: string;
    courseStartDescription: string;
    courseStartLabel: string;
    loading: string;
    noAvailability: string;
    noSlots: string;
    showMoreTimes: string;
    showFewerTimes: string;
    weekdays: readonly [string, string, string, string, string, string, string];
    packageSessionNote: string;
    packageFollowUpNote: string;
    localTimeNote: string;
    previousMonth: string;
    nextMonth: string;
    available: string;
    unavailable: string;
    today: string;
    selected: string;
  };
  form: {
    title: string;
    description: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneOptional: string;
    country: string;
    timezone: string;
    selectCountry: string;
    selectTimezone: string;
    sessionIntentionLabel: string;
    sessionIntentionPlaceholder: string;
    countries: readonly CountryOption[];
    timezones: readonly TimezoneOption[];
  };
  validation: ClientDetailErrorMessages & {
    futureStartDate: string;
    availabilityLoadError: string;
    incompleteDetails: string;
    checkoutError: string;
    invalidSessionType: string;
    selectCourseStartDate: string;
    invalidStartDate: string;
    selectTimeSlot: string;
    selectScheduledTime: string;
    invalidTime: string;
    futureTimeSlot: string;
    serviceUnavailable: string;
    invalidPrice: string;
    stripeNoUrl: string;
    stripeCreateFailed: string;
  };
  payment: {
    title: string;
    description: string;
    stripeLabel: string;
    redirecting: string;
  };
  paymentSuccess: {
    title: string;
    errorTitle: string;
    message: string;
    packageMessage: string;
    courseMessage: string;
    closing: string;
    sessionLanguageNote: string;
    missingSessionId: string;
    invalidSession: string;
    notPaid: string;
    error: string;
    tryAgain: string;
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
    openMenu: string;
    closeMenu: string;
    primaryNavLabel: string;
    mobileNavLabel: string;
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
    tertiaryCta: { label: string; href: string };
  };
  foundation: {
    intro: readonly EmphasizedRun[];
    headline: readonly EmphasizedRun[];
  };
  journey: {
    heading: string;
    steps: readonly (readonly EmphasizedRun[])[];
  };
  alignment: {
    heading: string;
    items: readonly HomeAlignmentItem[];
  };
  underneath: {
    intro: string;
    headline: string;
  };
  identityShifts: {
    heading: string;
    intro: string;
    rows: readonly HomeIdentityShiftRow[];
    closingLead: string;
    closing: string;
  };
  roots: {
    intro: string;
    headline: string;
  };
  trust: {
    statements: readonly string[];
  };
  about: {
    title: string;
    story: readonly CmsParagraphField[];
  };
  aap: {
    title: string;
    intro: CmsParagraphField;
    points: ReadonlyArray<{ title: string; description: CmsParagraphField }>;
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
  bookingOffers: Record<string, BookingOfferCopy>;
  bookingUi: BookingUiContent;
  seo: PublicSeoContent;
  legal: {
    heading: string;
    body: string;
    contactLabel: string;
  };
  footer: {
    rights: string;
    backToTop: string;
    navLabel: string;
  };
  languageSwitcherLabel: string;
};
