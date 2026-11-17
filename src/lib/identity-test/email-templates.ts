import { wrapEmailHtml } from "@/lib/email/templates/layout";
import { getAppBaseUrl } from "@/lib/url";
import { siteConfig } from "@/content/site";
import type { EmailThemeSection } from "./types";
import { composeFragments } from "./compose";

export type { EmailThemeSection };

const BOOKING_FALLBACK = "/book";

const E = {
  canvas: "#f6f3ee",
  surface: "#fdfcfa",
  futureCard: "#eaf0ea",
  ink: "#1a1917",
  inkMuted: "#4a4743",
  inkSubtle: "#7a756d",
  inkFaint: "#a39d94",
  accent: "#4f6b62",
  iconNowBg: "#f0e9dc",
  iconFutureBg: "#dde6dc",
  booking: "#3d6b52",
  divider: "#d9d2c6",
  cardBorder: "#e3ded5",
} as const;

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "'Helvetica Neue',Arial,Helvetica,sans-serif";

// Prezentācijas slāņa teksti no dizaina atsauces (nav DB lauki).
// Rezultāta e-pasts iet tikai `lv` vai `en` - localeFallbackChain → [locale, en, lv].
const CHROME: Record<
  string,
  { eyebrow: string; heading: string; sessionHeading: string; signoff: string }
> = {
  lv: {
    eyebrow: "TAVS PERSONĪGAIS REZULTĀTS",
    heading: "Ieraudzīt, kas tevi vada.",
    sessionHeading: "Vai esi gatavs spert nākamo soli?",
    signoff: "Ar sirsnīgiem sveicieniem,",
  },
  en: {
    eyebrow: "YOUR PERSONAL RESULT",
    heading: "See what drives you.",
    sessionHeading: "Ready to take the next step?",
    signoff: "With warm regards,",
  },
};

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
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${E.ink};">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

/**
 * Grupē izvēlētos uzskatus pa tēmām un no apstiprinātajiem portretu
 * fragmentiem (portraitNow/portraitFuture) apvieno vienu aprakstu katrai
 * kartei. Jaunu interpretāciju neveido - tikai esošu fragmentu dedupe+join.
 * Tukši fragmenti izkrīt; tēma bez satura sadaļā nerāda.
 */
export function buildEmailThemeSections(
  beliefs: { themeName: string; portraitNow: string; portraitFuture: string }[],
): EmailThemeSection[] {
  const byTheme = new Map<string, { name: string; nows: string[]; futures: string[] }>();
  for (const b of beliefs) {
    let sec = byTheme.get(b.themeName);
    if (!sec) {
      sec = { name: b.themeName, nows: [], futures: [] };
      byTheme.set(b.themeName, sec);
    }
    if (b.portraitNow) sec.nows.push(b.portraitNow);
    if (b.portraitFuture) sec.futures.push(b.portraitFuture);
  }
  return [...byTheme.values()]
    .map((t) => ({ name: t.name, now: composeFragments(t.nows), future: composeFragments(t.futures) }))
    .filter((t) => t.now || t.future);
}

function themeSectionHtml(input: {
  themes: EmailThemeSection[];
  mode: "now" | "future";
}): string {
  return input.themes
    .map((t) => {
      const body = input.mode === "now" ? t.now : t.future;
      if (!body) return "";
      return `<div style="margin-top:20px;">
        <p style="margin:0;font-family:${SERIF};font-size:15px;font-weight:600;color:${E.ink};">${escapeHtml(t.name)}</p>
        <p style="margin:9px 0 0;font-family:${SERIF};font-size:15px;line-height:1.8;color:${E.ink};">${escapeHtml(body)}</p>
      </div>`;
    })
    .filter(Boolean)
    .join("");
}

function portraitCard(input: {
  label: string;
  iconUrl: string;
  iconBg: string;
  cardBg: string;
  extra?: string;
}): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${input.cardBg}" style="background-color:${input.cardBg};border-radius:18px;">
    <tr>
      <td width="88" valign="top" style="padding:34px 0 30px 30px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="56" height="56" align="center" valign="middle" bgcolor="${input.iconBg}" style="background-color:${input.iconBg};border-radius:999px;">
              <img src="${input.iconUrl}" width="32" height="32" alt="" style="display:block;border:0;" />
            </td>
          </tr>
        </table>
      </td>
      <td valign="top" style="padding:32px 34px 34px 26px;border-left:1px solid ${E.cardBorder};">
        <div style="font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.8px;color:${E.accent};">${escapeHtml(input.label)}</div>
        ${input.extra ?? ""}
      </td>
    </tr>
  </table>`;
}

function wrapResultEmailHtml(body: string, locale: string): string {
  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${siteConfig.name}</title>
</head>
<body style="margin:0;padding:0;background-color:${E.canvas};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${E.canvas}" style="background-color:${E.canvas};">
    <tr>
      <td align="center" style="padding:48px 16px 60px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">
          ${body}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildResultEmail(input: {
  locale: string;
  portraitNow: string;
  portraitFuture: string;
  bookingUrl?: string;
  /** true → rezultāta beigās nav rezervācijas bloka (LV slēgts pēc produkta lēmuma). */
  hideBookingCta?: boolean;
  /** Tēmu līmeņa pārskats abās kartēs (izvēlētie apgalvojumi + pozitīvie virzieni). */
  themes?: EmailThemeSection[];
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
  const chrome = CHROME[input.locale] ?? CHROME.en;
  const base = getAppBaseUrl();
  const hairline = `<td width="34" style="border-top:1px solid ${E.divider};font-size:1px;line-height:1px;">&nbsp;</td>`;

  const body = `
    <tr>
      <td align="right" style="padding:0;">
        <img src="${base}/email/leaf-sprig.png" width="168" alt="" style="display:block;border:0;max-width:168px;height:auto;" />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:8px 0 0;">
        <div style="font-family:${SERIF};font-size:18px;font-weight:600;letter-spacing:7px;color:${E.ink};">${escapeHtml(siteConfig.name.toUpperCase())}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:14px auto 0;">
          <tr>
            ${hairline}
            <td style="padding:0 16px;font-family:${SANS};font-size:10.5px;letter-spacing:3.5px;color:${E.inkSubtle};">IDENTITY TEST</td>
            ${hairline}
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="left" style="padding:60px 0 0;">
        <div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:3.4px;color:${E.accent};">${escapeHtml(chrome.eyebrow)}</div>
        <h1 style="margin:20px 0 0;font-family:${SERIF};font-size:38px;font-weight:500;line-height:1.2;color:${E.ink};">${escapeHtml(chrome.heading)}</h1>
        <p style="margin:26px 0 0;font-family:${SERIF};font-size:15.5px;line-height:1.8;color:${E.ink};">${escapeHtml(input.texts.greeting)}</p>
        <p style="margin:14px 0 0;max-width:500px;font-family:${SERIF};font-size:15.5px;line-height:1.8;color:${E.inkMuted};">${escapeHtml(input.texts.intro)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:44px 0 0;">
        ${portraitCard({
          label: input.texts.nowTitle,
          iconUrl: `${base}/email/icon-portrait-now.png`,
          iconBg: E.iconNowBg,
          cardBg: E.surface,
          extra: themeSectionHtml({ themes: input.themes ?? [], mode: "now" }),
        })}
      </td>
    </tr>
    <tr><td style="font-size:20px;line-height:20px;">&nbsp;</td></tr>
    <tr>
      <td>
        ${portraitCard({
          label: input.texts.futureTitle,
          iconUrl: `${base}/email/icon-portrait-future.png`,
          iconBg: E.iconFutureBg,
          cardBg: E.futureCard,
          extra: themeSectionHtml({ themes: input.themes ?? [], mode: "future" }),
        })}
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:30px 32px 0;">
        <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.7;color:${E.inkSubtle};">${escapeHtml(input.texts.disclaimer)}</p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:52px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr><td width="56" style="border-top:1px solid ${E.divider};font-size:1px;line-height:1px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
    ${
      input.hideBookingCta
        ? ""
        : `<tr>
      <td align="center" style="padding:46px 8px 0;">
        <h2 style="margin:0;font-family:${SERIF};font-size:28px;font-weight:500;font-style:italic;line-height:1.3;color:${E.ink};">${escapeHtml(chrome.sessionHeading)}</h2>
        <p style="margin:18px auto 0;max-width:450px;font-family:${SERIF};font-size:15px;line-height:1.8;color:${E.inkMuted};">${escapeHtml(input.texts.sessionLead)}</p>
        <p style="margin:32px 0 0;">
          <a href="${bookingUrl}" style="display:inline-block;padding:17px 42px;background-color:${E.booking};color:#fdfcfa;text-decoration:none;border-radius:999px;font-family:${SANS};font-size:15px;letter-spacing:0.5px;">${escapeHtml(input.texts.sessionCta)}&nbsp;&nbsp;&#8594;</a>
        </p>
      </td>
    </tr>`
    }
    <tr>
      <td align="center" style="padding:56px 0 0;">
        <p style="margin:0;font-family:${SANS};font-size:13px;color:${E.inkMuted};">${escapeHtml(chrome.signoff)}</p>
        <p style="margin:8px 0 0;font-family:${SERIF};font-size:18px;font-style:italic;color:${E.ink};">${escapeHtml(siteConfig.name)}</p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:44px 24px 0;">
        <p style="margin:0;font-family:${SANS};font-size:10.5px;line-height:1.6;color:${E.inkFaint};">${escapeHtml(input.texts.privacyNote)}</p>
      </td>
    </tr>`;

  const themes = input.themes ?? [];
  const themeBlock = (field: "now" | "future") =>
    themes
      .map((t) => (t[field] ? `${t.name}\n${t[field]}` : ""))
      .filter(Boolean)
      .join("\n\n");
  const nowThemesText = themeBlock("now");
  const futureThemesText = themeBlock("future");

  const text = [
    input.texts.greeting,
    "",
    input.texts.intro,
    "",
    input.texts.nowTitle,
    nowThemesText,
    "",
    input.texts.futureTitle,
    futureThemesText,
    "",
    input.texts.disclaimer,
    "",
    ...(input.hideBookingCta ? [] : [input.texts.sessionLead, bookingUrl, ""]),
    chrome.signoff,
    siteConfig.name,
    "",
    input.texts.privacyNote,
  ].filter((line) => line !== undefined).join("\n");

  return { html: wrapResultEmailHtml(body, input.locale), text };
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
    <p style="margin:28px 0 0;font-size:12px;color:${E.inkFaint};">
      <a href="${input.unsubscribeUrl}" style="color:${E.inkSubtle};">${escapeHtml(input.unsubscribeLabel)}</a>
    </p>`;
  const text = `${input.bodyText}\n\n${input.unsubscribeLabel}: ${input.unsubscribeUrl}`;
  return { html: wrapEmailHtml(body, { hideSignature: true }), text };
}
