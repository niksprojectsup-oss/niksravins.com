export const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Calendar", href: "/admin/calendar" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Sessions", href: "/admin/sessions" },
  { label: "Packages", href: "/admin/packages" },
  { label: "Store", href: "/admin/store" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Settings", href: "/admin/settings" },
] as const;

export const adminPages = {
  dashboard: {
    title: "Dashboard",
    description: "Overview of sessions, clients, and revenue.",
  },
  calendar: {
    title: "Calendar",
    description: "Manage availability and view booked sessions.",
  },
  clients: {
    title: "Clients",
    description: "Client profiles and session history.",
  },
  sessions: {
    title: "Sessions",
    description: "Scheduled and completed session records.",
  },
  payments: {
    title: "Payments",
    description: "Payment tracking and reconciliation.",
  },
  packages: {
    title: "Packages",
    description: "Manage bookable offers displayed on the public booking page.",
  },
  store: {
    title: "Store",
    description: "Manage digital products available in the client portal store.",
  },
  settings: {
    title: "Settings",
    description: "Account, availability, and integration settings.",
  },
} as const;
