import type { Metadata } from "next";
<<<<<<< ours
import { headers } from "next/headers";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { getDocumentHtmlLangFromPathname } from "@/lib/i18n/document-lang";
import { REQUEST_PATHNAME_HEADER } from "@/lib/i18n/request-pathname";
import { getAppBaseUrl } from "@/lib/url";
=======
import { Fraunces } from "next/font/google";
import { siteConfig } from "@/content/site";
>>>>>>> theirs
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
    template: "%s · Niks Ravins",
  },
  description:
    "Online deep transformation sessions with Niks Ravins using Adaptive Association Processing (AAP). Sessions conducted in English, available worldwide.",
  openGraph: {
    siteName: "Niks Ravins",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
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
<<<<<<< ours
      lang={htmlLang}
      className={`${fraunces.variable} ${sourceSans.variable} h-full`}
=======
      lang="en"
      className={`${fraunces.variable} h-full`}
>>>>>>> theirs
    >
      <body className="min-h-full flex flex-col font-sans text-base leading-normal text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
