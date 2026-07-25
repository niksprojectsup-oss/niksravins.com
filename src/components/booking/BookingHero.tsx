import { bookingContent } from "@/content/booking";

export function BookingHero() {
  return (
    <header className="layout-stack-md max-w-prose pt-8 pb-10 md:pt-12 md:pb-14">
      <p className="type-label">Booking</p>
      <h1 className="type-heading">{bookingContent.hero.title}</h1>
      <p className="type-lead">{bookingContent.hero.subtitle}</p>
    </header>
  );
}
