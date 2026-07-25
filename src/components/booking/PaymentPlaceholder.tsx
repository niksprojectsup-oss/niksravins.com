import { bookingContent } from "@/content/booking";
import { Button } from "@/components/ui/Button";
import { BookingPanel } from "./BookingPanel";

type PaymentPlaceholderProps = {
  onConfirm: () => void;
  isSubmitting?: boolean;
};

export function PaymentPlaceholder({
  onConfirm,
  isSubmitting = false,
}: PaymentPlaceholderProps) {
  return (
    <BookingPanel
      title={bookingContent.payment.title}
      description={bookingContent.payment.description}
    >
      <div className="layout-stack-md max-w-prose">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled
            aria-disabled
            className="observed-card min-h-14 cursor-not-allowed p-5 text-left opacity-60"
          >
            <p className="type-caption text-ink-subtle">Stripe</p>
            <p className="type-body mt-1">{bookingContent.payment.stripeLabel}</p>
          </button>

          <button
            type="button"
            disabled
            aria-disabled
            className="observed-card min-h-14 cursor-not-allowed p-5 text-left opacity-60"
          >
            <p className="type-caption text-ink-subtle">PayPal</p>
            <p className="type-body mt-1">{bookingContent.payment.paypalLabel}</p>
          </button>
        </div>

        <p className="type-caption">{bookingContent.payment.placeholderNote}</p>

        <Button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Confirming…" : bookingContent.actions.confirmBooking}
        </Button>
      </div>
    </BookingPanel>
  );
}
