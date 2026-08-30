export const bookingContent = {
  hero: {
    title: "Book a Session",
    subtitle:
      "Begin the process of changing the automatic reactions that no longer serve you.",
  },
  services: {
    title: "Select a service",
    description: "All offerings are paid sessions conducted online.",
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
  confirmation: {
    title: "Your session is confirmed.",
    message:
      "A confirmation email with your session details has been sent to the address you provided.",
    closing:
      "If it does not arrive within a few minutes, check your spam folder. I look forward to meeting you.",
  },
  actions: {
    continue: "Continue",
    back: "Back",
    confirmBooking: "Confirm booking",
  },
} as const;

export const timezones = [
  { value: "Europe/Riga", label: "Riga (EET/EEST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
] as const;

export const countries = [
  "Latvia",
  "United Kingdom",
  "Germany",
  "France",
  "United States",
  "Canada",
  "Australia",
  "Netherlands",
  "Sweden",
  "Norway",
  "Other",
] as const;
