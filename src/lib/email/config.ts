import { siteConfig } from "@/content/site";

export type EmailConfig = {
  apiKey: string;
  from: string;
  adminNotificationEmail: string;
};

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getEmailConfig(): EmailConfig | null {
  const apiKey = trimEnv(process.env.RESEND_API_KEY);
  if (!apiKey) {
    return null;
  }

  const from =
    trimEnv(process.env.EMAIL_FROM) ??
    `${siteConfig.name} <${siteConfig.email}>`;

  const adminNotificationEmail =
    trimEnv(process.env.ADMIN_NOTIFICATION_EMAIL) ?? siteConfig.email;

  return {
    apiKey,
    from,
    adminNotificationEmail,
  };
}

export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null;
}
