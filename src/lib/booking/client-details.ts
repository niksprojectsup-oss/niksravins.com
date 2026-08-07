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

export function validateClientDetails(
  client: ClientDetails,
): Partial<Record<keyof ClientDetails, string>> {
  const errors: Partial<Record<keyof ClientDetails, string>> = {};

  if (!client.firstName.trim()) errors.firstName = "First name is required.";
  if (!client.lastName.trim()) errors.lastName = "Last name is required.";
  if (!client.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (client.phone?.trim() && !/^[\d\s+\-().]{6,24}$/.test(client.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!client.country) errors.country = "Country is required.";
  if (!client.timezone) errors.timezone = "Time zone is required.";
  if (!client.sessionIntention.trim()) {
    errors.sessionIntention = "Please share your session intention.";
  }

  return errors;
}
