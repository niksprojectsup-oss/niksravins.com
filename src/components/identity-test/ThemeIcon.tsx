// Simboliskas ikonas Identity Test tēmām (kārtotas pēc CMS slug).
// Vienots stils: 24x24, stroke=currentColor, 1.5px, noņemti stūri.
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SelfWorthIcon() {
  return (
    <g {...STROKE}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6.5 19.5c.8-3.5 2.8-5.2 5.5-5.2s4.7 1.7 5.5 5.2" />
      <circle cx="12" cy="12" r="10" strokeDasharray="2.5 3.5" opacity={0.45} />
    </g>
  );
}

function RelationshipsIcon() {
  return (
    <g {...STROKE}>
      <circle cx="8.5" cy="12" r="5" />
      <circle cx="15.5" cy="12" r="5" />
    </g>
  );
}

function FamilyIcon() {
  return (
    <g {...STROKE}>
      <path d="M4.5 11.5 12 5l7.5 6.5" />
      <path d="M6.5 10.5V19h11v-8.5" />
      <circle cx="9.5" cy="13" r="1.4" />
      <circle cx="14.5" cy="13" r="1.4" />
      <path d="M8.5 19v-2.2M15.5 19v-2.2" />
    </g>
  );
}

function SafetyControlIcon() {
  return (
    <g {...STROKE}>
      <path d="M12 3.5 18.5 6v5.2c0 4.2-2.7 7.3-6.5 9.3-3.8-2-6.5-5.1-6.5-9.3V6L12 3.5Z" />
      <path d="M9 11.8l2.1 2.1L15.4 9.7" />
    </g>
  );
}

function EmotionsIcon() {
  return (
    <g {...STROKE}>
      <path d="M12 19.5S5 15 5 9.8C5 7.2 7 5.5 9.3 5.5c1.1 0 2.1.5 2.7 1.2.6-.7 1.6-1.2 2.7-1.2C17 5.5 19 7.2 19 9.8c0 5.2-7 9.7-7 9.7Z" />
      <path d="M8 11.5c1.2-.8 2.4-.8 3.6 0M13.6 11.5c1.2-.8 2.2-.8 3 0" opacity={0.6} />
    </g>
  );
}

function WorkCareerIcon() {
  return (
    <g {...STROKE}>
      <path d="M4 19.5 10 8.5l3.5 5.5 2.5-4 4 9.5H4Z" />
      <path d="M10 8.5V5h4.5" />
    </g>
  );
}

function MoneyIcon() {
  return (
    <g {...STROKE}>
      <ellipse cx="12" cy="7" rx="6.5" ry="3" />
      <path d="M5.5 7v5c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3V7" />
      <path d="M5.5 12v5c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3v-5" />
    </g>
  );
}

function MeaningChoicesIcon() {
  return (
    <g {...STROKE}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </g>
  );
}

function BoundariesIcon() {
  return (
    <g {...STROKE}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" />
      <path d="M12 4.5v15" strokeDasharray="2.5 3" opacity={0.55} />
      <path d="M15.5 12H8.5M11.5 9l-3 3 3 3" />
    </g>
  );
}

function CrisisTraumaIcon() {
  return (
    <g {...STROKE}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5" />
    </g>
  );
}

function FallbackIcon() {
  return (
    <g {...STROKE}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </g>
  );
}

const ICONS: Record<string, () => React.ReactElement> = {
  "self-worth": SelfWorthIcon,
  relationships: RelationshipsIcon,
  family: FamilyIcon,
  "safety-control": SafetyControlIcon,
  emotions: EmotionsIcon,
  "work-career": WorkCareerIcon,
  money: MoneyIcon,
  "meaning-choices": MeaningChoicesIcon,
  "boundaries-agency": BoundariesIcon,
  "crisis-trauma": CrisisTraumaIcon,
};

export function ThemeIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? FallbackIcon;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <Icon />
    </svg>
  );
}
