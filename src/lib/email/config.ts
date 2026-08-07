export type EmailConfig = {
  apiKey: string | undefined;
  from: string | undefined;
  isConfigured: boolean;
};

export function getEmailConfig(): EmailConfig {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  return {
    apiKey,
    from,
    isConfigured: Boolean(apiKey && from),
  };
}

export const ADMIN_NOTIFICATION_EMAIL = "hello@niksravins.com";
