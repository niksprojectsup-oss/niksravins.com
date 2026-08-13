import { cn } from "@/lib/utils";

type InternationalSessionNoticeProps = {
  line1: string;
  line2: string;
  className?: string;
  variant?: "default" | "prominent";
};

export function InternationalSessionNotice({
  line1,
  line2,
  className,
  variant = "default",
}: InternationalSessionNoticeProps) {
  return (
    <p
      className={cn(
        "type-caption text-ink-subtle",
        variant === "prominent" &&
          "rounded-lg border border-border-subtle bg-surface/60 px-4 py-3 text-ink",
        className,
      )}
      role="note"
      aria-label={`${line1}. ${line2}`}
    >
      <span className="block sm:inline">{line1}</span>
      <span className="hidden sm:inline" aria-hidden>
        {" · "}
      </span>
      <span className="block sm:inline">{line2}</span>
    </p>
  );
}
