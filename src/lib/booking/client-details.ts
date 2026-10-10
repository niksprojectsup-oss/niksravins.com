import type { ClientDetailErrorMessages } from "@/content/i18n/types";
import type { ClientDetails } from "./types";

export const emptyClientDetails: ClientDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  timezone: "Europe/Riga",
  sessionIntention: "",
};

export const DEFAULT_CLIENT_DETAIL_ERRORS: ClientDetailErrorMessages = {
  firstNameRequired: "First name is required.",
  lastNameRequired: "Last name is required.",
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  phoneInvalid: "Enter a valid phone number.",
  countryRequired: "Country is required.",
  timezoneRequired: "Time zone is required.",
  sessionIntentionRequired: "Please share your session intention.",
};

export function validateClientDetails(
  client: ClientDetails,
  messages: ClientDetailErrorMessages = DEFAULT_CLIENT_DETAIL_ERRORS,
): Partial<Record<keyof ClientDetails, string>> {
  const errors: Partial<Record<keyof ClientDetails, string>> = {};

  if (!client.firstName.trim()) errors.firstName = messages.firstNameRequired;
  if (!client.lastName.trim()) errors.lastName = messages.lastNameRequired;
  if (!client.email.trim()) {
    errors.email = messages.emailRequired;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
    errors.email = messages.emailInvalid;
  }
  if (client.phone?.trim() && !/^[\d\s+\-().]{6,24}$/.test(client.phone.trim())) {
    errors.phone = messages.phoneInvalid;
  }
  if (!client.country) errors.country = messages.countryRequired;
  if (!client.timezone) errors.timezone = messages.timezoneRequired;
  if (!client.sessionIntention.trim()) {
    errors.sessionIntention = messages.sessionIntentionRequired;
  }

  return errors;
}
