import { bookingContent } from "@/content/booking";
import { Button } from "@/components/ui/Button";

export function BookingConfirmation() {
  const { title, message, closing } = bookingContent.confirmation;

  return (
    <section
      aria-labelledby="confirmation-heading"
      className="layout-stack-md max-w-prose py-10 md:py-16"
    >
      <h2 id="confirmation-heading" className="type-heading">
        {title}
      </h2>
      <p className="type-lead">{message}</p>
      <p className="type-body">{closing}</p>
      <div className="pt-4">
        <Button href="/" variant="secondary">
          Return home
        </Button>
      </div>
    </section>
  );
}
