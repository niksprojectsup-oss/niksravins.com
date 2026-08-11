export type EmailConfig = {
  apiKey: string | undefined;
  from: string | undefined;
  isConfigured: boolean;
  missingVariables: string[];
};

export function getEmailConfig(): EmailConfig {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const missingVariables: string[] = [];

  if (!apiKey) missingVariables.push("RESEND_API_KEY");
  if (!from) missingVariables.push("EMAIL_FROM");

  return {
    apiKey,
    from,
    isConfigured: Boolean(apiKey && from),
    missingVariables,
  };
}

export const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || "admin@niksravins.com";
