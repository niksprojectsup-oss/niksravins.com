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
      viewBox: "0 0 64 40",
      shaft: "M8 10 C 22 6, 36 14, 48 28",
      head: "M36 20 L 50 30 L 34 32",
    },
    "23": {
      viewBox: "0 0 64 40",
      shaft: "M56 10 C 42 6, 28 14, 16 28",
      head: "M28 20 L 14 30 L 30 32",
    },
    "34": {
      viewBox: "0 0 64 40",
      shaft: "M10 8 C 24 6, 40 16, 50 30",
      head: "M38 20 L 52 32 L 36 32",
    },
  },
  desktop: {
    "12": {
      viewBox: "0 0 160 72",
      shaft: "M4 30 C 36 4, 96 0, 128 22 C 146 36, 150 54, 134 64",
      head: "M116 48 L 138 66 L 112 62",
    },
    "23": {
      viewBox: "0 0 200 88",
      shaft: "M188 10 C 148 2, 78 18, 40 46 C 20 62, 12 76, 18 80",
      head: "M6 64 L 16 84 L 36 66",
    },
    "34": {
      viewBox: "0 0 160 72",
      shaft: "M6 18 C 34 2, 96 6, 128 28 C 146 42, 150 56, 134 64",
      head: "M116 48 L 138 66 L 112 60",
    },
  },
} as const;

type ArrowLink = "12" | "23" | "34";
type ArrowPlacement = keyof typeof ARROW_ART;

function ChangeArrow({ link, placement }: { link: ArrowLink; placement: ArrowPlacement }) {
  const art = ARROW_ART[placement][link];

  return (
    <svg
      className={`want-change-arrow want-change-arrow-${placement}`}
      data-link={link}
      viewBox={art.viewBox}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
    >
      <path d={art.shaft} stroke={ARROW} strokeWidth="2.15" strokeLinecap="round" />
      <path
        d={art.head}
        stroke={ARROW}
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChangeBridge({ link }: { link: ArrowLink }) {
  return (
    <div className="want-change-bridge" data-link={link} aria-hidden="true">
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

            return (
              <article key={number} className="want-change-stage" data-stage={number}>
                <span className="want-change-num">{number}</span>
                <span className="want-change-rule" aria-hidden="true" />
                <StepBody index={index} html={cmsHtmlFields[`journey.change.${index}`]} />
              </article>
            );
          })}
          <ChangeBridge link="12" />
          <ChangeBridge link="23" />
          <ChangeBridge link="34" />
        </div>
      </div>
    </Section>
  );
}
