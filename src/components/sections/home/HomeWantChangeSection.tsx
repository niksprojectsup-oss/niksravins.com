import type { ReactNode } from "react";
import { CmsPublishedFieldText } from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";

const ARROW = "#355445";

const STEP_FALLBACKS: readonly ReactNode[] = [
  <>
    Maybe it’s your <strong>relationship</strong>. Maybe it’s your <strong>work</strong>. Maybe it’s
    how you feel about <strong>yourself</strong>. Maybe you simply know you want{" "}
    <strong>more from life</strong>.
  </>,
  <>
    You understand what <strong>isn’t</strong> working.
  </>,
  <>
    You may even understand what is <strong>holding you back</strong>.
  </>,
  <>
    But knowing something <strong>doesn’t always make it change</strong>.
  </>,
];

const ARROW_ART = {
  mobile: {
    "12": {
      viewBox: "0 0 92 58",
      shaft: "M12 10 C 30 6, 38 24, 52 30 C 66 36, 72 34, 80 48",
      head: "M66 36 L 82 50 L 64 54",
    },
    "23": {
      viewBox: "0 0 92 58",
      shaft: "M80 10 C 62 6, 54 24, 40 30 C 26 36, 20 34, 12 48",
      head: "M26 36 L 10 50 L 28 54",
    },
    "34": {
      viewBox: "0 0 92 58",
      shaft: "M14 12 C 28 8, 44 22, 56 30 C 68 38, 74 36, 80 50",
      head: "M66 38 L 82 52 L 64 56",
    },
  },
  desktop: {
    "12": {
      viewBox: "0 0 140 80",
      shaft: "M36 46 C 58 12, 92 6, 114 32 C 128 48, 126 64, 116 72",
      head: "M104 58 L 118 74 L 100 76",
    },
    "23": {
      viewBox: "0 0 180 90",
      shaft: "M166 14 C 128 6, 78 22, 42 50 C 24 64, 16 74, 12 80",
      head: "M28 64 L 10 82 L 32 84",
    },
    "34": {
      viewBox: "0 0 140 80",
      shaft: "M10 18 C 36 6, 72 16, 102 40 C 120 54, 126 66, 118 74",
      head: "M104 58 L 120 76 L 98 76",
    },
  },
} as const;

type ArrowLink = "12" | "23" | "34";
type ArrowPlacement = keyof typeof ARROW_ART;

function ChangeArrow({ link, placement }: { link: ArrowLink; placement: ArrowPlacement }) {
  const art = ARROW_ART[placement][link];
  const [, , width, height] = art.viewBox.split(" ");

  return (
    <svg
      className={`want-change-arrow want-change-arrow-${placement}`}
      data-link={link}
      viewBox={art.viewBox}
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
    >
      <path d={art.shaft} stroke={ARROW} strokeWidth="1.85" strokeLinecap="round" />
      <path
        d={art.head}
        stroke={ARROW}
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChangeBridge({ link }: { link: ArrowLink }) {
  return (
    <div className="want-change-bridge" data-link={link}>
      <ChangeArrow link={link} placement="mobile" />
      <ChangeArrow link={link} placement="desktop" />
    </div>
  );
}

function StepBody({ index, html }: { index: number; html?: string }) {
  if (html) {
    return <CmsPublishedFieldText html={html} fallback="" className="want-change-text" />;
  }

  return <p className="want-change-text">{STEP_FALLBACKS[index]}</p>;
}

export function HomeWantChangeSection({ cmsHtmlFields = {} }: { cmsHtmlFields?: CmsHtmlFields }) {
  return (
    <Section aria-labelledby="want-change-heading" className="want-change">
      <div className="want-change-inner">
        <h2 id="want-change-heading" className="want-change-title">
          You want something to change.
        </h2>
        <div className="want-change-path">
          {STEP_FALLBACKS.map((_, index) => {
            const number = String(index + 1).padStart(2, "0");
            const link = `${index + 1}${index + 2}` as ArrowLink;

            return (
              <div key={number} className="want-change-step">
                <article className="want-change-stage" data-stage={number}>
                  <span className="want-change-num">{number}</span>
                  <span className="want-change-rule" aria-hidden="true" />
                  <StepBody index={index} html={cmsHtmlFields[`journey.change.${index}`]} />
                </article>
                {index < STEP_FALLBACKS.length - 1 ? <ChangeBridge link={link} /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
