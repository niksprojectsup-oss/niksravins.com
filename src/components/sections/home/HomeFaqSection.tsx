"use client";

import { useState } from "react";
import {
  CMS_PUBLISHED_BLOCK_CLASS,
  CMS_PUBLISHED_INLINE_CLASS,
  CmsPublishedFieldText,
} from "@/components/cms/CmsPublishedFieldText";
import { Section } from "@/components/ui/Section";
import type { HomeSectionProps } from "./shared";

function FaqAnswer({
  index,
  answer,
  cmsHtmlFields,
}: {
  index: number;
  answer: string | string[];
  cmsHtmlFields: HomeSectionProps["cmsHtmlFields"];
}) {
  const html = cmsHtmlFields?.[`faq.items.${index}.answer`];

  if (html) {
    return (
      <CmsPublishedFieldText
        html={html}
        fallback={Array.isArray(answer) ? answer.join("\n\n") : answer}
        className={CMS_PUBLISHED_BLOCK_CLASS}
      />
    );
  }

  if (Array.isArray(answer)) {
    return (
      <div className="home-prose">
        {answer.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    );
  }

  return <p>{answer}</p>;
}

export function HomeFaqSection({ content, cmsHtmlFields = {} }: HomeSectionProps) {
  const { faq } = content;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function moveFocus(current: HTMLButtonElement, direction: 1 | -1 | "start" | "end") {
    const triggers = Array.from(
      current.closest(".home-faq")?.querySelectorAll<HTMLButtonElement>("[data-faq-trigger]") ?? [],
    );
    const index = triggers.indexOf(current);
    if (index < 0 || triggers.length === 0) return;

    const nextIndex =
      direction === "start"
        ? 0
        : direction === "end"
          ? triggers.length - 1
          : (index + direction + triggers.length) % triggers.length;

    triggers[nextIndex]?.focus();
  }

  return (
    <Section id="faq" size="lg" aria-labelledby="faq-heading" className="home-band">
      <header className="home-copy home-section-intro">
        <p className="type-label">
          <CmsPublishedFieldText
            html={cmsHtmlFields["faq.headingLabel"]}
            fallback={faq.headingLabel}
            className={CMS_PUBLISHED_INLINE_CLASS}
          />
        </p>
        <h2 id="faq-heading" className="type-home-title">
          <CmsPublishedFieldText
            html={cmsHtmlFields["faq.heading"]}
            fallback={faq.heading}
            className={CMS_PUBLISHED_INLINE_CLASS}
          />
        </h2>
      </header>

      <div className="home-faq">
        {faq.items.map((item, index) => {
          const open = openIndex === index;
          const triggerId = `faq-trigger-${index}`;
          const panelId = `faq-panel-${index}`;

          return (
            <div key={item.question} className="home-faq-row">
              <h3 className="home-faq-question">
                <button
                  id={triggerId}
                  type="button"
                  data-faq-trigger
                  className="home-faq-trigger"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(open ? null : index)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveFocus(event.currentTarget, 1);
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveFocus(event.currentTarget, -1);
                    } else if (event.key === "Home") {
                      event.preventDefault();
                      moveFocus(event.currentTarget, "start");
                    } else if (event.key === "End") {
                      event.preventDefault();
                      moveFocus(event.currentTarget, "end");
                    }
                  }}
                >
                  <span>
                    <CmsPublishedFieldText
                      html={cmsHtmlFields[`faq.items.${index}.question`]}
                      fallback={item.question}
                      className={CMS_PUBLISHED_INLINE_CLASS}
                    />
                  </span>
                  <span className="home-faq-mark" aria-hidden="true">
                    {open ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                data-open={open ? "true" : "false"}
                inert={open ? undefined : true}
                className="home-faq-panel"
              >
                <div className="home-faq-panel-inner">
                  <div className="home-faq-answer type-body">
                    <FaqAnswer index={index} answer={item.answer} cmsHtmlFields={cmsHtmlFields} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
