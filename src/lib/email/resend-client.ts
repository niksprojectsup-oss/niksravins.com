import { Resend } from "resend";
import { getEmailConfig } from "@/lib/email/config";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const config = getEmailConfig();
  if (!config) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(config.apiKey);
  }

  return resendClient;
}
