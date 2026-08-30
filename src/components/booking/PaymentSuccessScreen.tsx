import type { BookingUiContent } from "@/content/i18n/types";
import type { PaymentSuccessState } from "@/lib/stripe/verify-checkout-session";
import { InternationalSessionNotice } from "@/components/i18n/InternationalSessionNotice";
import { Button } from "@/components/ui/Button";

type PaymentSuccessScreenProps = {
  state: PaymentSuccessState;
  labels: BookingUiContent;
  homeHref: string;
  bookHref: string;
  internationalNotice: { line1: string; line2: string };
};

function resolveMessage(
  state: Extract<PaymentSuccessState, { status: "confirmed" }>,
  labels: BookingUiContent,
): string {
  if (state.offerKind === "package") {
    return labels.paymentSuccess.packageMessage;
  }
  if (state.offerKind === "course") {
    return labels.paymentSuccess.courseMessage;
  }
  return labels.paymentSuccess.message;
}

function resolveErrorMessage(state: PaymentSuccessState, labels: BookingUiContent): string {
  switch (state.status) {
    case "missing_session_id":
      return labels.paymentSuccess.missingSessionId;
    case "invalid_session":
      return labels.paymentSuccess.invalidSession;
    case "not_paid":
      return labels.paymentSuccess.notPaid;
    case "error":
      return labels.paymentSuccess.error;
    default:
      return labels.paymentSuccess.error;
  }
}

export function PaymentSuccessScreen({
  state,
  labels,
  homeHref,
  bookHref,
  internationalNotice,
}: PaymentSuccessScreenProps) {
  const isConfirmed = state.status === "confirmed";

  return (
    <section
      aria-labelledby="payment-success-heading"
      className="layout-stack-md max-w-prose py-10 md:py-16"
    >
      <h1 id="payment-success-heading" className="type-heading">
        {isConfirmed ? labels.paymentSuccess.title : labels.paymentSuccess.errorTitle}
      </h1>

      {isConfirmed ? (
        <>
          <p className="type-lead">{resolveMessage(state, labels)}</p>
          <InternationalSessionNotice
            line1={internationalNotice.line1}
            line2={internationalNotice.line2}
            variant="prominent"
          />
          <p className="type-body">{labels.paymentSuccess.sessionLanguageNote}</p>
          <p className="type-body">{labels.paymentSuccess.closing}</p>
        </>
      ) : (
        <p className="type-lead text-ink-muted" role="alert">
          {resolveErrorMessage(state, labels)}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
        {isConfirmed ? (
          <Button href={homeHref} variant="secondary">
            {labels.actions.returnHome}
          </Button>
        ) : (
          <>
            <Button href={bookHref}>{labels.paymentSuccess.tryAgain}</Button>
            <Button href={homeHref} variant="secondary">
              {labels.actions.returnHome}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
