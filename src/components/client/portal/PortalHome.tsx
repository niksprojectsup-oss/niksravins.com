"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  formatPortalGreeting,
  portalIntlLocale,
  type PortalContent,
} from "@/content/i18n/portal";
import type { Locale } from "@/lib/i18n/config";
import { saveSessionPreparationAction } from "@/lib/journey/journey-actions";
import type { PortalHomeData } from "@/lib/journey/journey-repository";
import { ASSESSMENT_DIMENSIONS } from "@/lib/journey/constants";
import { JournalPanel } from "@/components/client/journey/JournalPanel";
import { PortalIcon, PortalIconBadge, growthDimensionIcon } from "@/components/client/portal/PortalIcon";

type PortalHomeProps = {
  data: PortalHomeData;
  content: PortalContent;
  locale: Locale;
  initialQuery?: string;
  asOf: string;
};

type Period = "3" | "6" | "all";

function formatWhen(iso: string, timeZone: string, locale: Locale): string {
  return new Intl.DateTimeFormat(portalIntlLocale(locale), {
    timeZone,
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function PortalHome({ data, content, locale, initialQuery, asOf }: PortalHomeProps) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("3");
  const [preparation, setPreparation] = useState(data.preparation?.reflection ?? "");
  const [focusMessage, setFocusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const growth = useMemo(() => {
    const now = new Date(asOf).getTime();
    const windowMs = period === "all" ? null : Number(period) * 30 * 24 * 60 * 60 * 1000;
    const inRange = data.assessments.filter((item) => {
      if (windowMs === null) return true;
      return now - new Date(item.createdAt).getTime() <= windowMs;
    });
    const current = inRange[inRange.length - 1] ?? null;
    const starting = inRange.length > 1 ? inRange[0] : null;
    return { current, starting };
  }, [asOf, data.assessments, period]);

  function savePreparation() {
    if (!data.nextSession) return;
    setFocusMessage(null);
    startTransition(async () => {
      const result = await saveSessionPreparationAction(data.nextSession!.id, preparation);
      setFocusMessage(result.error ?? content.focus.saved);
      if (!result.error) router.refresh();
    });
  }

  const reflectionNotes = [data.lastReflection?.whatShifted, data.lastReflection?.takeaway]
    .map((item) => item?.trim())
    .filter(Boolean);

  return (
    <div className="portal-stack min-w-0 text-[#2c2824]">
      <section className="portal-hero relative overflow-hidden rounded-3xl">
        <Image
          src="/images/portal/hero.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/10" />
        <div className="relative flex h-full max-w-lg flex-col justify-end p-5 text-white md:p-7">
          <h1 className="portal-hero-title">
            {formatPortalGreeting(content.hero.greeting, data.firstName)}
          </h1>
          <p className="mt-2 text-base leading-snug">{content.hero.subtitle}</p>
          <p className="mt-1.5 max-w-md text-sm leading-snug text-white/85">{content.hero.intro}</p>
          <blockquote className="mt-3 max-w-md rounded-2xl border border-white/25 bg-black/25 px-3.5 py-2.5 text-sm leading-snug">
            “{content.hero.quote}”
            <footer className="mt-1 text-white/80">— {content.hero.quoteBy}</footer>
          </blockquote>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="portal-card flex min-w-0 items-center gap-3 p-4">
          <PortalIconBadge name="calendar" tone="sand" />
          <div className="min-w-0">
            <p className="text-sm text-[#6d675f]">{content.stats.nextSession}</p>
            <p className="mt-1 font-display text-lg leading-snug">
              {data.nextSession
                ? formatWhen(data.nextSession.scheduledAt, data.timezone, locale)
                : content.stats.noNextSession}
            </p>
          </div>
        </article>
        <article className="portal-card flex min-w-0 items-center gap-3 p-4">
          <PortalIconBadge name="layers" tone="ivory" />
          <div className="min-w-0">
            <p className="font-display text-2xl leading-none">{data.completedSessions}</p>
            <p className="mt-1.5 text-sm text-[#6d675f]">{content.stats.sessions}</p>
          </div>
        </article>
        <article className="portal-card flex min-w-0 items-center gap-3 p-4">
          <PortalIconBadge name="leaf" tone="sage" />
          <div className="min-w-0">
            <p className="font-display text-2xl leading-none">{data.recordedChanges}</p>
            <p className="mt-1.5 text-sm text-[#6d675f]">{content.stats.recordedChanges}</p>
          </div>
        </article>
      </section>

      <div className="portal-columns">
      <section className="portal-card portal-columns-lead p-4 md:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <PortalIconBadge name="leaf" tone="sage" />
            <div className="min-w-0">
              <h2 className="portal-section-title">{content.growth.title}</h2>
              <p className="mt-1 text-sm text-[#6d675f]">{content.growth.subtitle}</p>
            </div>
          </div>
          <label className="text-sm text-[#6d675f]">
            <span className="sr-only">{content.growth.periodLabel}</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="h-8 rounded-full border border-[#e4d8c8] bg-white px-3 text-sm"
            >
              <option value="3">{content.growth.period3}</option>
              <option value="6">{content.growth.period6}</option>
              <option value="all">{content.growth.periodAll}</option>
            </select>
          </label>
        </div>
        {growth.current ? (
          <ul className="mt-4 grid gap-2.5">
            {ASSESSMENT_DIMENSIONS.map((dimension) => {
              const current = growth.current?.[dimension.key] ?? 0;
              const starting = growth.starting?.[dimension.key];
              return (
                <li key={dimension.key} className="rounded-xl border border-[#eadfd2] bg-[#fbf7f1] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <PortalIconBadge
                        name={growthDimensionIcon(dimension.key)}
                        tone={dimension.key === "emotionalBalance" || dimension.key === "connection" ? "sage" : "ivory"}
                        className="h-7 w-7"
                      />
                      <span className="min-w-0">{content.growth.dimensions[dimension.key]}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[#6d675f]">
                      {starting !== undefined ? (
                        <>
                          {starting}
                          <PortalIcon name="arrowRight" className="h-3 w-3" />
                          {current}
                        </>
                      ) : (
                        current
                      )}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#efe7dc]" aria-hidden>
                    <div className="h-full rounded-full bg-[#7d9a78]" style={{ width: `${Math.min(100, current * 10)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-[#eadfd2] bg-[#fbf7f1] p-4 text-sm text-[#6d675f]">{content.growth.empty}</p>
        )}
      </section>

      <section className="portal-card p-4 md:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <PortalIconBadge name="notebook" tone="sand" />
            <div className="min-w-0">
              <h2 className="portal-section-title">{content.lastSession.title}</h2>
              <p className="mt-1 text-sm text-[#6d675f]">{content.lastSession.subtitle}</p>
            </div>
          </div>
          <Link href="/client/sessions" className="inline-flex items-center gap-1 text-sm text-[#3f6b4e] no-underline">
            {content.lastSession.viewAll}
            <PortalIcon name="chevronRight" className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.lastSession ? (
          <div className="mt-3">
            <p className="text-sm text-[#6d675f]">
              {formatWhen(data.lastSession.scheduledAt, data.timezone, locale)}
            </p>
            <h3 className="mt-1 text-lg leading-snug">
              {data.lastSession.mainTopic || data.lastSession.sessionType}
            </h3>
            <h4 className="mt-4 text-sm text-[#6d675f]">{content.lastSession.conclusions}</h4>
            {reflectionNotes.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {reflectionNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[#6d675f]">{content.lastSession.emptyConclusions}</p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#6d675f]">{content.lastSession.empty}</p>
        )}
      </section>

      <section id="focus" className="portal-card portal-card-soft p-4 md:p-5">
        <div className="flex items-start gap-3">
          <PortalIconBadge name="notebookPen" tone="ivory" />
          <div className="min-w-0">
            <h2 className="portal-section-title">{content.focus.title}</h2>
            <p className="mt-1 text-sm text-[#6d675f]">{content.focus.subtitle}</p>
          </div>
        </div>
        {data.nextSession ? (
          <form
            className="mt-3"
            onSubmit={(event) => {
              event.preventDefault();
              savePreparation();
            }}
          >
            <label className="block text-sm text-[#5c564e]">
              {content.focus.label}
              <textarea
                value={preparation}
                onChange={(event) => setPreparation(event.target.value)}
                placeholder={content.focus.placeholder}
                className="mt-1.5 min-h-24 w-full rounded-xl border border-[#e4d8c8] bg-white px-3 py-2 text-sm"
              />
            </label>
            <div className="mt-3 flex items-center gap-3">
              <button type="submit" disabled={isPending} className="rounded-full bg-[#3f6b4e] px-4 py-2 text-sm text-white">
                {isPending ? content.focus.saving : content.focus.save}
              </button>
              {focusMessage ? <p className="text-sm text-[#3f6b4e]">{focusMessage}</p> : null}
            </div>
          </form>
        ) : (
          <p className="mt-3 text-sm text-[#6d675f]">{content.focus.empty}</p>
        )}
      </section>
      </div>

      <JournalPanel
        entries={data.insights}
        copy={content.insights}
        locale={locale}
        initialQuery={initialQuery}
      />

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["/client/journey", "/images/portal/process.webp", content.cards.processTitle, content.cards.processBody],
          ["/client/sessions", "/images/portal/session-journal.webp", content.cards.journalTitle, content.cards.journalBody],
          ["/client/branches", "/images/portal/trunks-branches.webp", content.cards.trunksTitle, content.cards.trunksBody],
        ].map(([href, src, title, body]) => (
          <Link key={href} href={href} className="group relative h-40 overflow-hidden rounded-3xl no-underline sm:h-44">
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-white">
              <span className="block font-display text-xl leading-tight">{title}</span>
              <span className="mt-1 block text-sm text-white/85">{body}</span>
              <span className="mt-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 text-white">
                <span className="sr-only">{content.cards.open}</span>
                <PortalIcon name="arrowRight" className="h-3.5 w-3.5" />
              </span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
