import type { BookingUiContent } from "@/content/i18n/types";
import { InternationalSessionNotice } from "@/components/i18n/InternationalSessionNotice";
import { Button } from "@/components/ui/Button";

type BookingConfirmationProps = {
  labels: BookingUiContent;
  homeHref: string;
  internationalNotice: { line1: string; line2: string };
};

export function BookingConfirmation({
  labels,
  homeHref,
  internationalNotice,
}: BookingConfirmationProps) {
  const { title, message, closing, sessionLanguageNote } = labels.confirmation;

  return (
    <section
      aria-labelledby="confirmation-heading"
      className="layout-stack-md max-w-prose py-10 md:py-16"
    >
      <h2 id="confirmation-heading" className="type-heading">
        {title}
      </h2>
      <p className="type-lead">{message}</p>
      <InternationalSessionNotice
        line1={internationalNotice.line1}
        line2={internationalNotice.line2}
        variant="prominent"
      />
      <p className="type-body">{sessionLanguageNote}</p>
      <p className="type-body">{closing}</p>
      <div className="pt-4">
        <Button href={homeHref} variant="secondary">
          {labels.actions.returnHome}
        </Button>
      </div>
    </section>
  );
}
