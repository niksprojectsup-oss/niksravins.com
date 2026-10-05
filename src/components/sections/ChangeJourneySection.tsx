import type { PublicContent } from "@/content/i18n/types";
import {
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import type { CmsHtmlFields } from "@/lib/cms/published-field-html";
import { cn } from "@/lib/utils";

const STEP_SURFACES = [
  "bg-[#f0e8dc]",
  "bg-[#e6dace]",
  "bg-[#d9c9b5]",
  "bg-[#c4b896]",
] as const;

type ChangeJourneySectionProps = {
  content: PublicContent;
  cmsHtmlFields?: CmsHtmlFields;
};

function ChangeJourneyArrow({
  direction,
}: {
  direction: "to-right" | "to-left";
}) {
  const path =
    direction === "to-right"
      ? "M 12 8 C 48 8, 52 52, 88 52"
      : "M 88 8 C 52 8, 48 52, 12 52";

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 60"
      className={cn(
        "mx-auto h-14 w-40 text-accent-strong md:h-16 md:w-52",
        direction === "to-left" && "scale-x-[-1]",
      )}
      fill="none"
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={
          direction === "to-right"
            ? "M 88 52 L 78 46 M 88 52 L 82 42"
            : "M 88 52 L 78 46 M 88 52 L 82 42"
        }
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChangeJourneySection({
  content,
  cmsHtmlFields = {},
}: ChangeJourneySectionProps) {
  const { changeJourney } = content;

  return (
    <section
      aria-labelledby="change-journey-heading"
      className="pb-10 md:pb-16 lg:pb-20"
    >
      <div className="layout-container">
        <div className="layout-stack-lg mx-auto max-w-wide">
          <h2
            id="change-journey-heading"
            className="type-label text-center uppercase tracking-wider text-ink"
          >
            <CmsPublishedFieldText
              html={cmsHtmlFields["changeJourney.heading"]}
              fallback={changeJourney.heading}
              className={CMS_PUBLISHED_INLINE_CLASS}
            />
          </h2>

          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 md:gap-0">
            {changeJourney.steps.map((step, index) => {
              const alignStart = index % 2 === 0;

              return (
                <div key={step.slice(0, 24)} className="flex flex-col">
                  <div
                    className={cn(
                      "flex w-full",
                      alignStart ? "justify-start" : "justify-end",
                    )}
                  >
                    <article
                      className={cn(
                        "w-full max-w-md rounded-[2rem] px-6 py-5 text-center md:px-8 md:py-7",
                        STEP_SURFACES[index],
                      )}
                    >
                      <p className="type-body leading-relaxed text-ink-muted [&_strong]:font-semibold [&_strong]:text-ink">
                        <CmsPublishedFieldText
                          html={cmsHtmlFields[`changeJourney.steps.${index}`]}
                          fallback={step}
                          className={CMS_PUBLISHED_INLINE_CLASS}
                        />
                      </p>
                    </article>
                  </div>

                  {index < changeJourney.steps.length - 1 ? (
                    <div
                      className={cn(
                        "hidden py-2 md:flex md:py-3",
                        alignStart ? "justify-end pr-8 lg:pr-16" : "justify-start pl-8 lg:pl-16",
                      )}
                    >
                      <ChangeJourneyArrow
                        direction={alignStart ? "to-right" : "to-left"}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
