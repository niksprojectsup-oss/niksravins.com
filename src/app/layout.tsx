import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-family-display",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-family-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Niks Ravins",
    template: "%s · Niks Ravins",
  },
  description:
    "Psychotherapy focused on nervous system regulation. Helping your body stop reacting to the past through Adaptive Association Processing.",
  openGraph: {
    title: "Niks Ravins",
    description:
      "A calm nervous system changes everything. Psychotherapy with clarity, care, and scientific grounding.",
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
      className={`${fraunces.variable} ${sourceSans.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans text-base leading-normal text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
