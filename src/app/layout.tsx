import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fraunces, Unna } from "next/font/google";
import { portalIntlLocale } from "@/content/i18n/portal";
import { getDocumentHtmlLangFromPathname } from "@/lib/i18n/document-lang";
import { getPortalLocale } from "@/lib/i18n/portal-locale";
import { REQUEST_PATHNAME_HEADER } from "@/lib/i18n/request-pathname";
import { siteConfig } from "@/content/site";
import { getAppBaseUrl } from "@/lib/url";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-family-display",
  subsets: ["latin"],
  display: "swap",
});

const unna = Unna({
  variable: "--font-family-unna",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: {
    default: "Niks Ravins",
    template: `%s | ${siteConfig.name}`,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get(REQUEST_PATHNAME_HEADER) ?? "/";
  const htmlLang = pathname.startsWith("/client")
    ? portalIntlLocale(await getPortalLocale())
    : getDocumentHtmlLangFromPathname(pathname);

  return (
    <html
      lang={htmlLang}
      className={`${fraunces.variable} ${unna.variable} h-full`}
    >
      <body id="top" className="min-h-full flex flex-col font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
