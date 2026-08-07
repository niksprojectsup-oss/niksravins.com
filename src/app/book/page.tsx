import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BookingFlow } from "@/components/booking/BookingFlow";

export const metadata: Metadata = {
  title: "Book a Session",
  description:
    "Book an online session with Niks Ravins. Initial AAP sessions and transformation packages focused on changing automatic emotional reactions.",
};

export const dynamic = "force-dynamic";

export default function BookPage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:text-ink focus:shadow-soft"
      >
        Skip to content
      </a>

      <Header />

      <main id="main-content">
        <BookingFlow />
      </main>

      <Footer />
    </>
  );
}
