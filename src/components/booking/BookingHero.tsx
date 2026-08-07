import { bookingContent } from "@/content/booking";

type BookingHeroProps = {
  followUpMode?: boolean;
};

export function BookingHero({ followUpMode = false }: BookingHeroProps) {
  return (
    <header className="layout-stack-md max-w-prose pt-8 pb-10 md:pt-12 md:pb-14">
      <p className="type-label">Booking</p>
      <h1 className="type-heading">
        {followUpMode ? "Schedule your next package session" : bookingContent.hero.title}
      </h1>
      <p className="type-lead">
        {followUpMode
          ? "Choose a time for your next included transformation session. No additional payment is required."
          : bookingContent.hero.subtitle}
      </p>
    </header>
  );
}
