import Image from "next/image";
import type { PublicContent } from "@/content/i18n/types";
import { Section } from "@/components/ui/Section";

type AboutProps = {
  content: PublicContent;
};

export function About({ content }: AboutProps) {
  const { about, sectionLabels } = content;

  return (
    <Section id="about" size="lg" aria-labelledby="about-heading">
      <div className="grid gap-12 md:gap-16 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-24 lg:items-start">
        <div className="mx-auto w-full max-w-[14rem] lg:mx-0 lg:max-w-none">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-muted">
            <Image
              src="/images/niks.jpg"
              alt={sectionLabels.aboutImageAlt}
              fill
              sizes="(max-width: 1024px) 224px, 256px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="layout-stack-sm max-w-prose md:layout-stack-md lg:max-w-none lg:layout-stack-lg">
          <h2 id="about-heading" className="type-heading">
            {about.title}
          </h2>

          <div className="layout-stack-sm md:layout-stack-md">
            {about.story.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="type-body">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
