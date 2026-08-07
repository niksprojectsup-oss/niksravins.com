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
        <h2 className="type-heading-sm">{title}</h2>
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

export function SessionCard({
  title,
  description,
  detail,
  highlights,
  bonuses,
  duration,
  priceLabel,
  selected,
  onSelect,
}: SessionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "observed-card w-full p-7 text-left transition-colors duration-300 md:p-8",
        selected && "border-accent bg-accent-soft/40",
      )}
    >
      <div className="layout-stack-sm">
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
    </button>
  );
}
