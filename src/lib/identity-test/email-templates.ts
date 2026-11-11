import { wrapEmailHtml } from "@/lib/email/templates/layout";

const BOOKING_FALLBACK = "/book";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#1a1917;">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

function section(title: string, body: string): string {
  return `
    <h2 style="margin:28px 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:600;letter-spacing:0.01em;color:#1a1917;">${escapeHtml(title)}</h2>
    ${paragraphs(body)}`;
}

export function buildResultEmail(input: {
  locale: string;
  portraitNow: string;
  portraitFuture: string;
  safetyBlock?: string;
  bookingUrl?: string;
  texts: {
    greeting: string;
    intro: string;
    nowTitle: string;
    futureTitle: string;
    disclaimer: string;
    sessionLead: string;
    sessionCta: string;
    privacyNote: string;
  };
}): { html: string; text: string } {
  const bookingUrl = input.bookingUrl ?? BOOKING_FALLBACK;
  const safety = input.safetyBlock
    ? `<div style="margin:24px 0;padding:16px 18px;background-color:#f3ebe3;border-left:3px solid #9a7b5c;border-radius:6px;">${paragraphs(input.safetyBlock)}</div>`
    : "";

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#4a4743;">${escapeHtml(input.texts.greeting)}</p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#4a4743;">${escapeHtml(input.texts.intro)}</p>
    ${section(input.texts.nowTitle, input.portraitNow)}
    ${safety}
    ${section(input.texts.futureTitle, input.portraitFuture)}
    <p style="margin:24px 0 8px;font-size:13px;line-height:1.6;color:#7a756d;">${escapeHtml(input.texts.disclaimer)}</p>
    <p style="margin:24px 0 12px;font-size:15px;line-height:1.7;color:#4a4743;">${escapeHtml(input.texts.sessionLead)}</p>
    <p style="margin:0 0 24px;">
      <a href="${bookingUrl}" style="display:inline-block;padding:12px 22px;background-color:#4f6b62;color:#fdfcfa;text-decoration:none;border-radius:999px;font-size:14px;letter-spacing:0.02em;">${escapeHtml(input.texts.sessionCta)}</a>
    </p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:#a39d94;">${escapeHtml(input.texts.privacyNote)}</p>`;

  const text = [
    input.texts.greeting,
    "",
    input.texts.intro,
    "",
    input.texts.nowTitle,
    input.portraitNow,
    "",
    input.safetyBlock ?? "",
    input.texts.futureTitle,
    input.portraitFuture,
    "",
    input.texts.disclaimer,
    "",
    input.texts.sessionLead,
    bookingUrl,
    "",
    input.texts.privacyNote,
  ].filter((line) => line !== undefined).join("\n");

  return { html: wrapEmailHtml(body), text };
}

export function buildSequenceEmail(input: {
  subject: string;
  bodyText: string;
  unsubscribeUrl: string;
  bookingUrl?: string;
  unsubscribeLabel: string;
}): { html: string; text: string } {
  const body = `
    ${paragraphs(input.bodyText)}
    <p style="margin:28px 0 0;font-size:12px;color:#a39d94;">
      <a href="${input.unsubscribeUrl}" style="color:#7a756d;">${escapeHtml(input.unsubscribeLabel)}</a>
    </p>`;
  const text = `${input.bodyText}\n\n${input.unsubscribeLabel}: ${input.unsubscribeUrl}`;
  return { html: wrapEmailHtml(body), text };
}
