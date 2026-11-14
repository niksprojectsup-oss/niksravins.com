import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  label?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  id,
  label,
  title,
  description,
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <header
      className={cn(
        "layout-stack-sm mb-8 max-w-prose md:mb-12",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {label ? <p className="type-label">{label}</p> : null}
      <h2 id={id} className="type-heading">
        {title}
      </h2>
      {description ? <p className="type-lead">{description}</p> : null}
    </header>
  );
}
