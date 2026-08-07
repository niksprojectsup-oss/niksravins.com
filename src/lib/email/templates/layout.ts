import { siteConfig } from "@/content/site";

const COLORS = {
  canvas: "#f6f3ee",
  surface: "#fdfcfa",
  ink: "#1a1917",
  inkMuted: "#4a4743",
  inkSubtle: "#7a756d",
  border: "#e8e4de",
  accent: "#4f6b62",
} as const;

export function wrapEmailHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${siteConfig.name}</title>
</head>
<body style="margin:0;padding:32px 16px;background-color:${COLORS.canvas};font-family:Georgia,'Times New Roman',serif;color:${COLORS.ink};line-height:1.6;">
  <div style="max-width:560px;margin:0 auto;background-color:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:12px;padding:32px 28px;">
    <p style="margin:0 0 24px;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:${COLORS.accent};">${siteConfig.name}</p>
    ${body}
    <hr style="margin:32px 0 20px;border:none;border-top:1px solid ${COLORS.border};" />
    <p style="margin:0;font-size:13px;color:${COLORS.inkSubtle};">
      ${siteConfig.method}<br />
      ${siteConfig.availability}
    </p>
  </div>
</body>
</html>`;
}

export function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;font-size:13px;color:${COLORS.inkSubtle};vertical-align:top;width:140px;">${label}</td>
    <td style="padding:10px 0;font-size:15px;color:${COLORS.ink};vertical-align:top;">${value}</td>
  </tr>`;
}

export function detailsTable(rows: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;">${rows}</table>`;
}
