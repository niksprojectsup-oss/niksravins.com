import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fraunces } from "next/font/google";
import { getDocumentHtmlLangFromPathname } from "@/lib/i18n/document-lang";
import { REQUEST_PATHNAME_HEADER } from "@/lib/i18n/request-pathname";
import { siteConfig } from "@/content/site";
import { getAppBaseUrl } from "@/lib/url";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-family-display",
  subsets: ["latin"],
  display: "swap",
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
  const htmlLang = getDocumentHtmlLangFromPathname(pathname);

  return (
    <html
      lang={htmlLang}
      className={`${fraunces.variable} h-full`}
    >
      <body id="top" className="min-h-full flex flex-col font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
