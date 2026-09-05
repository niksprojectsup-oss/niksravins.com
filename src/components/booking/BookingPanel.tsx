import { cn } from "@/lib/utils";

type BookingPanelProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function BookingPanel({
  title,
  description,
  children,
  className,
}: BookingPanelProps) {
  return (
    <section className={cn("layout-stack-md", className)}>
      <header className="layout-stack-sm max-w-prose">
        <h2 className="type-heading-sm scroll-mt-24 focus:outline-none">{title}</h2>
        {description ? <p className="type-body">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

type SessionCardProps = {
  title: string;
  description: string;
  detail?: string;
  highlights?: string[];
  bonuses?: string[];
  duration?: string;
  priceLabel?: string;
  selected: boolean;
  chooseLabel: string;
  selectedLabel: string;
  onSelect: () => void;
};

function ServiceList({ items }: { items: string[] }) {
  return (
    <ul className="layout-stack-sm">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 type-body text-ink-muted">
          <span className="text-accent shrink-0" aria-hidden>
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SelectedIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 type-caption font-medium text-booking">
      <span
        aria-hidden
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-booking bg-booking text-surface"
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{label}</span>
    </div>
  );
}

export function SessionCard({
  title,
  description,
  detail,
  highlights,
  bonuses,
  duration,
  priceLabel,
  selected,
  chooseLabel,
  selectedLabel,
  onSelect,
}: SessionCardProps) {
  return (
    <article
      className={cn(
        "observed-card flex h-full flex-col p-6 transition-colors duration-300 md:p-7",
        selected
          ? "border-2 border-booking bg-booking-soft/50 ring-1 ring-booking/15"
          : "border border-border-subtle",
      )}
      aria-current={selected ? "true" : undefined}
    >
      {selected ? (
        <div className="mb-4">
          <SelectedIndicator label={selectedLabel} />
        </div>
      ) : null}

      <div className="layout-stack-sm flex-1">
        <h3 className="type-heading-sm">{title}</h3>
        <p className="type-body">{description}</p>
        {detail ? <p className="type-body text-ink-muted">{detail}</p> : null}
        {highlights && highlights.length > 0 ? (
          <div className="pt-2">
            <ServiceList items={highlights} />
          </div>
        ) : null}
        {bonuses && bonuses.length > 0 ? (
          <div className="border-t border-border-subtle pt-4">
            <p className="type-label text-ink-subtle">Included bonuses</p>
            <div className="mt-3">
              <ServiceList items={bonuses} />
            </div>
          </div>
        ) : null}
        {duration || priceLabel ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
            {duration ? <p className="type-caption">{duration}</p> : null}
            {priceLabel ? <p className="type-caption text-ink">{priceLabel}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="pt-6">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={cn(
            "inline-flex min-h-12 w-full items-center justify-center rounded-md px-7 text-sm font-medium tracking-wide transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-3",
            selected
              ? "bg-booking text-surface hover:bg-booking-strong focus-visible:outline-booking"
              : "border border-border-strong bg-transparent text-ink hover:border-accent hover:text-accent focus-visible:outline-accent",
          )}
        >
          {selected ? selectedLabel : chooseLabel}
        </button>
      </div>
    </article>
  );
}
