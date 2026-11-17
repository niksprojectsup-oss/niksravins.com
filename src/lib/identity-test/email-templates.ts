import { wrapEmailHtml } from "@/lib/email/templates/layout";
import { getAppBaseUrl } from "@/lib/url";
import { siteConfig } from "@/content/site";
import type { EmailDirection, EmailThemeSection } from "./types";

export type { EmailDirection, EmailThemeSection };

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
  {
    eyebrow: string; heading: string; sessionHeading: string; signoff: string;
    nowThemesLabel: string; futureThemesLabel: string; directionsMoreNote: string;
  }
> = {
  lv: {
    eyebrow: "TAVS PERSONĪGAIS REZULTĀTS",
    heading: "Ieraudzīt, kas tevi vada.",
    sessionHeading: "Vai esi gatavs spert nākamo soli?",
    signoff: "Ar sirsnīgiem sveicieniem,",
    nowThemesLabel: "Tēmas, kurās tu sevi atpazini",
    futureThemesLabel: "Tavi iespējamie attīstības virzieni",
    directionsMoreNote: "Parādīti daži no saistītajiem attīstības virzieniem.",
  },
  en: {
    eyebrow: "YOUR PERSONAL RESULT",
    heading: "See what drives you.",
    sessionHeading: "Ready to take the next step?",
    signoff: "With warm regards,",
    nowThemesLabel: "Themes where you recognized yourself",
    futureThemesLabel: "Your possible directions of growth",
    directionsMoreNote: "A few of the related growth directions are shown.",
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

function portraitParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:14px 0 0;font-family:${SERIF};font-size:16.5px;line-height:1.85;color:${E.ink};">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

/**
 * Grupē izvēlētos uzskatus pa tēmām rezultāta e-pasta tēmu sadaļām.
 * Pozitīvie pamatuzskati deduplicēti globāli pēc trunkId (vairāki izvēlēti
 * uzskati var vest pie viena stumbra).
 */
export function buildEmailThemeSections(
  beliefs: { themeName: string; statement: string; directions: EmailDirection[] }[],
): EmailThemeSection[] {
  const byTheme = new Map<string, EmailThemeSection>();
  const seenTrunks = new Set<string>();
  for (const b of beliefs) {
    let sec = byTheme.get(b.themeName);
    if (!sec) {
      sec = { name: b.themeName, statements: [], directions: [] };
      byTheme.set(b.themeName, sec);
    }
    if (b.statement && !sec.statements.includes(b.statement)) {
      sec.statements.push(b.statement);
    }
    for (const d of b.directions) {
      if (seenTrunks.has(d.trunkId)) continue;
      seenTrunks.add(d.trunkId);
      sec.directions.push(d);
    }
  }
  return [...byTheme.values()];
}

function themeSectionHtml(input: {
  label: string;
  themes: EmailThemeSection[];
  mode: "now" | "future";
  moreNote?: string;
}): string {
  const items = input.themes
    .map((t) => {
      const rows =
        input.mode === "now"
          ? t.statements
              .map(
                (s) =>
                  `<p style="margin:8px 0 0;font-family:${SERIF};font-size:14px;line-height:1.7;font-style:italic;color:${E.inkMuted};">${escapeHtml(s)}</p>`,
              )
              .join("")
          : t.directions
              .map(
                (d) =>
                  `<p style="margin:10px 0 0;font-family:${SERIF};font-size:14.5px;line-height:1.7;color:${E.ink};">${escapeHtml(d.title)}</p>` +
                  d.branches
                    .slice(0, 3)
                    .map(
                      (br) =>
                        `<p style="margin:4px 0 0;font-family:${SANS};font-size:13px;line-height:1.65;color:${E.inkMuted};">&middot;&nbsp;&nbsp;${escapeHtml(br)}</p>`,
                    )
                    .join(""),
              )
              .join("");
      if (!rows) return "";
      return `<div style="margin-top:18px;">
        <p style="margin:0;font-family:${SERIF};font-size:14.5px;font-weight:600;color:${E.ink};">${escapeHtml(t.name)}</p>
        ${rows}
      </div>`;
    })
    .filter(Boolean)
    .join("");
  if (!items) return "";
  const hasMore =
    input.mode === "future" &&
    input.themes.some((t) => t.directions.some((d) => d.branches.length > 3));
  const moreNote =
    hasMore && input.moreNote
      ? `<p style="margin:18px 0 0;font-family:${SERIF};font-size:12.5px;font-style:italic;line-height:1.7;color:${E.inkSubtle};">${escapeHtml(input.moreNote)}</p>`
      : "";
  return `
        <div style="margin-top:26px;padding-top:24px;border-top:1px solid ${E.cardBorder};">
          <div style="font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.8px;color:${E.accent};">${escapeHtml(input.label)}</div>
          ${items}${moreNote}
        </div>`;
}

function portraitCard(input: {
  label: string;
  body: string;
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
        ${portraitParagraphs(input.body)}${input.extra ?? ""}
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
          body: input.portraitNow,
          iconUrl: `${base}/email/icon-portrait-now.png`,
          iconBg: E.iconNowBg,
          cardBg: E.surface,
          extra: themeSectionHtml({ label: chrome.nowThemesLabel, themes: input.themes ?? [], mode: "now" }),
        })}
      </td>
    </tr>
    <tr><td style="font-size:20px;line-height:20px;">&nbsp;</td></tr>
    <tr>
      <td>
        ${portraitCard({
          label: input.texts.futureTitle,
          body: input.portraitFuture,
          iconUrl: `${base}/email/icon-portrait-future.png`,
          iconBg: E.iconFutureBg,
          cardBg: E.futureCard,
          extra: themeSectionHtml({
            label: chrome.futureThemesLabel,
            themes: input.themes ?? [],
            mode: "future",
            moreNote: chrome.directionsMoreNote,
          }),
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
  const nowThemesText = themes
    .map((t) => [t.name, ...t.statements.map((s) => `- ${s}`)].join("\n"))
    .join("\n\n");
  const futureThemesText = themes
    .map((t) => [
      t.name,
      ...t.directions.map((d) => [d.title, ...d.branches.slice(0, 3).map((br) => `  - ${br}`)].join("\n")),
    ].join("\n"))
    .join("\n\n");
  const futureHasMore = themes.some((t) => t.directions.some((d) => d.branches.length > 3));

  const text = [
    input.texts.greeting,
    "",
    input.texts.intro,
    "",
    input.texts.nowTitle,
    input.portraitNow,
    ...(nowThemesText ? ["", chrome.nowThemesLabel, nowThemesText] : []),
    "",
    input.texts.futureTitle,
    input.portraitFuture,
    ...(futureThemesText
      ? ["", chrome.futureThemesLabel, futureThemesText, ...(futureHasMore ? [chrome.directionsMoreNote] : [])]
      : []),
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
