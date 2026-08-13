import { cn } from "@/lib/utils";

type PortalCardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  id?: string;
};

const paddingClass = {
  sm: "p-4 md:p-5",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export function PortalCard({ children, className, padding = "md", id }: PortalCardProps) {
  return (
    <section id={id} className={cn("observed-card h-full", paddingClass[padding], className)}>
      {children}
    </section>
  );
}

type PortalSectionTitleProps = {
  title: string;
  action?: React.ReactNode;
  className?: string;
};

export function PortalSectionTitle({ title, action, className }: PortalSectionTitleProps) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <h2 className="type-heading-sm">{title}</h2>
      {action}
    </div>
  );
}

export function PortalGrid({
  children,
  columns = 2,
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-5 md:gap-6",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 lg:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}
