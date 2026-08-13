type PortalPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PortalPageHeader({ eyebrow, title, description }: PortalPageHeaderProps) {
  return (
    <header className="layout-stack-sm max-w-2xl">
      {eyebrow ? <p className="type-caption text-accent">{eyebrow}</p> : null}
      <h1 className="type-heading">{title}</h1>
      {description ? (
        <p className="type-body text-ink-subtle">{description}</p>
      ) : null}
    </header>
  );
}
