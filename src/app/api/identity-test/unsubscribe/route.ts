import type { NextRequest } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/identity-test/tokens";
import { withdrawConsent } from "@/lib/identity-test/sequence";

export const dynamic = "force-dynamic";

function htmlPage(title: string, body: string): Response {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="margin:0;padding:48px 20px;background:#f6f3ee;font-family:Georgia,serif;color:#1a1917;">
  <div style="max-width:460px;margin:0 auto;background:#fdfcfa;border:1px solid #e8e4de;border-radius:12px;padding:36px 32px;">
    <h1 style="font-size:20px;margin:0 0 12px;">${title}</h1>
    <p style="font-size:15px;line-height:1.6;color:#4a4743;margin:0;">${body}</p>
  </div>
</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

/** GET /api/identity-test/unsubscribe?token=... - atteikšanās bez logina (HMAC tokens). */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const consentId = verifyUnsubscribeToken(token);

  if (!consentId) {
    return htmlPage("Saite nav derīga", "Šī atteikšanās saite nav derīga vai ir novecojusi. / This unsubscribe link is invalid or expired.");
  }

  const ok = await withdrawConsent(consentId);
  if (!ok) {
    return htmlPage("Ieraksts nav atrasts", "Piekrišanas ieraksts nav atrasts. Iespējams, tu jau esi atteicies. / Consent record not found - you may already be unsubscribed.");
  }

  return htmlPage(
    "Tu esi atteicies no turpmākiem e-pastiem",
    "Tavs personīgais rezultāts paliek derīgs, bet mārketinga e-pasti vairs netiks sūtīti. / You are unsubscribed - no further marketing emails will be sent.",
  );
}
