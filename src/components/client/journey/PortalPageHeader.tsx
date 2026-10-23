import { PortalIconBadge, type PortalIconName } from "@/components/client/portal/PortalIcon";

type PortalPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: PortalIconName;
  iconTone?: "sand" | "sage" | "ivory";
};

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  icon,
  iconTone = "sand",
}: PortalPageHeaderProps) {
  return (
    <header className="flex max-w-2xl items-start gap-3">
      {icon ? <PortalIconBadge name={icon} tone={iconTone} /> : null}
      <div className="layout-stack-sm min-w-0">
        {eyebrow ? <p className="type-caption text-accent">{eyebrow}</p> : null}
        <h1 className="type-heading">{title}</h1>
        {description ? (
          <p className="type-body text-ink-subtle">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
