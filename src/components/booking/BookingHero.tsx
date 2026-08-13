import type { PublicContent } from "@/content/i18n/types";

type BookingHeroProps = {
  content: PublicContent;
};

export function BookingHero({ content }: BookingHeroProps) {
  const { bookingPublic } = content;

  return (
    <header className="layout-stack-md max-w-prose pt-8 pb-10 md:pt-12 md:pb-14">
      <p className="type-label">{bookingPublic.label}</p>
      <h1 className="type-heading">{bookingPublic.title}</h1>
      <p className="type-lead">{bookingPublic.subtitle}</p>
    </header>
  );
}
