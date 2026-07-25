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
  duration: string;
  selected: boolean;
  onSelect: () => void;
};

export function SessionCard({
  title,
  description,
  duration,
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
        <p className="type-caption">{duration}</p>
      </div>
    </button>
  );
}
