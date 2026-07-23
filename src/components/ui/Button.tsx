import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-ink text-surface hover:bg-accent-strong focus-visible:outline-ink",
  secondary:
    "border border-border-strong bg-transparent text-ink hover:border-accent hover:text-accent",
  ghost: "text-ink-muted hover:text-accent underline-offset-4 hover:underline",
} as const;

type ButtonVariant = keyof typeof variants;

const baseStyles =
  "inline-flex items-center justify-center min-h-12 px-7 text-sm font-medium tracking-wide transition-colors duration-300 ease-out rounded-md no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-3";

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
  href?: string;
} & Omit<React.ComponentProps<"button">, "children" | "className">;

export function Button({
  variant = "primary",
  className,
  children,
  href,
  ...buttonProps
}: ButtonProps) {
  const classes = cn(baseStyles, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
