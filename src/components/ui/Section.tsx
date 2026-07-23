import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  "aria-labelledby"?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
};

const sizeClasses = {
  sm: "layout-section-sm",
  md: "layout-section",
  lg: "layout-section-lg",
} as const;

export function Section({
  id,
  "aria-labelledby": ariaLabelledBy,
  size = "md",
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(sizeClasses[size], className)}
    >
      <div className={cn("layout-container", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
