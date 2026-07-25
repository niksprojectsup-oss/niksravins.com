import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  className,
}: AdminPageHeaderProps) {
  return (
    <header className={cn("layout-stack-sm border-b border-border-subtle pb-6", className)}>
      <p className="type-label">Admin</p>
      <h1 className="type-heading-sm md:text-3xl">{title}</h1>
      {description ? <p className="type-body max-w-prose">{description}</p> : null}
    </header>
  );
}

type AdminStatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <article className="observed-card p-6 md:p-7">
      <p className="type-label">{label}</p>
      <p className="mt-3 font-display text-3xl tracking-snug text-ink">{value}</p>
      {hint ? <p className="type-caption mt-2">{hint}</p> : null}
    </article>
  );
}

type AdminPanelProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminPanel({
  title,
  description,
  children,
  className,
}: AdminPanelProps) {
  return (
    <section className={cn("layout-stack-md", className)}>
      <header className="layout-stack-sm">
        <h2 className="type-heading-sm">{title}</h2>
        {description ? <p className="type-body">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
