import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { siteConfig } from "@/content/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-family-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Niks Ravins",
    template: "%s · Niks Ravins",
  },
  description: `${siteConfig.brandDescriptor}. Adaptive Association Processing for learned emotional associations — the links that keep automatic reactions running, even after you understand them.`,
  openGraph: {
    title: "Niks Ravins",
    description:
      "You understand the reaction. It still happens. Adaptive Association Processing for learned emotional associations behind automatic reactions.",
    type: "website",
    locale: "en",
    siteName: "Niks Ravins",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans text-base leading-normal text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
