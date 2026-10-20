"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  formatPortalGreeting,
  getPortalContent,
  portalIntlLocale,
  type PortalContent,
} from "@/content/i18n/portal";
import { PortalFooter } from "@/components/client/portal/PortalFooter";
import {
  PortalIcon,
  PortalIconBadge,
  growthDimensionIcon,
  type PortalIconName,
} from "@/components/client/portal/PortalIcon";
import { MilestoneTimeline } from "@/components/client/journey/MilestoneTimeline";
import { LOCALE_DEFINITIONS, LOCALES, type Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/locales";
import { ASSESSMENT_DIMENSIONS } from "@/lib/journey/constants";
import {
  ADMIN_PORTAL_PREVIEW_SECTIONS,
  filterPreviewAssessments,
  filterPreviewInsights,
  filterPreviewJournal,
  previewMutationsAllowed,
  previewSectionLabel,
  buildAdminPortalPreviewFixture,
  type AdminPortalPreviewData,
  type AdminPortalPreviewSection,
  type PreviewInsightCategory,
  type PreviewInsightFilter,
  type PreviewPeriod,
} from "@/lib/portal/admin-preview";
import { cn } from "@/lib/utils";

const CARDS = [
  ["journey", "/images/portal/process.webp", "processTitle", "processBody"],
  ["journal", "/images/portal/session-journal.webp", "journalTitle", "journalBody"],
  ["trunks", "/images/portal/trunks-branches.webp", "trunksTitle", "trunksBody"],
] as const;

type CardTarget = (typeof CARDS)[number][0];

const SECTION_ICONS: Record<AdminPortalPreviewSection, PortalIconName | null> = {
  home: null,
  journey: "sprout",
  sessions: "calendar",
  insights: "notebook",
  journal: "layers",
};

type AdminPortalPreviewProps = {
  initialLocale: Locale;
};

function formatWhen(iso: string, timeZone: string, locale: Locale): string {
  return new Intl.DateTimeFormat(portalIntlLocale(locale), {
    timeZone,
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDay(iso: string, locale: Locale): string {
  const value = iso.length === 10 ? `${iso}T12:00:00.000Z` : iso;
  return new Intl.DateTimeFormat(portalIntlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function insightIcon(category: PreviewInsightCategory | "ALL"): PortalIconName {
  if (category === "PATTERN") return "brain";
  if (category === "TRIGGER") return "heartPulse";
  if (category === "POSITIVE_OBSERVATION") return "sprout";
  return "layers";
}

function growthTone(key: (typeof ASSESSMENT_DIMENSIONS)[number]["key"]): "sage" | "ivory" {
  return key === "emotionalBalance" || key === "connection" ? "sage" : "ivory";
}

export function AdminPortalPreview({ initialLocale }: AdminPortalPreviewProps) {
  const data = buildAdminPortalPreviewFixture();
  const [locale, setLocale] = useState(initialLocale);
  const [section, setSection] = useState<AdminPortalPreviewSection | "trunks">("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PreviewInsightFilter>("ALL");
  const [period, setPeriod] = useState<PreviewPeriod>("3");
  const [menuOpen, setMenuOpen] = useState(false);
  const content = getPortalContent(locale);
  const writesDisabled = !previewMutationsAllowed();

  function openSection(next: AdminPortalPreviewSection | "trunks") {
    setSection(next);
    setMenuOpen(false);
  }

  return (
    <div lang={portalIntlLocale(locale)} className="client-portal min-h-screen">
      <header className="border-b border-[#eadfd2] bg-[#f7f1e8]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-2 md:px-6">
          <button
            type="button"
            onClick={() => openSection("home")}
            className="font-display text-sm tracking-[0.22em] text-[#3f3a34]"
          >
            NIKS RAVINS
          </button>
          <nav aria-label={content.nav.label} className="ml-auto hidden items-center gap-4 lg:flex">
            {ADMIN_PORTAL_PREVIEW_SECTIONS.map((id) => {
              const icon = SECTION_ICONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  data-preview-section={id}
                  aria-current={section === id ? "page" : undefined}
                  onClick={() => openSection(id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm",
                    section === id
                      ? "text-[#2f2b26] underline decoration-[#c4b49a] underline-offset-8"
                      : "text-[#6d675f] hover:text-[#2f2b26]",
                  )}
                >
                  {icon ? <PortalIcon name={icon} className="h-3.5 w-3.5" /> : null}
                  {previewSectionLabel(id, content)}
                </button>
              );
            })}
          </nav>
          <label className="relative ml-auto hidden lg:ml-3 lg:block">
            <span className="sr-only">{content.nav.search}</span>
            <PortalIcon
              name="search"
              className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8a7568]"
            />
            <input
              id="preview-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={content.insights.searchPlaceholder}
              aria-label={content.nav.search}
              className="h-8 w-40 rounded-full border border-[#e4d8c8] bg-white/80 pr-3 pl-8 text-sm text-[#3f3a34] placeholder:text-[#a3988c]"
            />
          </label>
          <select
            aria-label={content.languageSwitcherLabel}
            value={locale}
            onChange={(event) => {
              if (isLocale(event.target.value)) setLocale(event.target.value);
            }}
            className="h-8 rounded-full border border-[#e4d8c8] bg-white/80 px-2 text-xs tracking-wide text-[#5c564e]"
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_DEFINITIONS[code].nativeLabel}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="inline-flex h-8 items-center rounded-full border border-[#e4d8c8] px-3 text-sm text-[#5c564e] lg:hidden"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? content.nav.closeMenu : content.nav.openMenu}
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-[#eadfd2] px-4 py-3 lg:hidden">
            <ul className="flex flex-col gap-2">
              {ADMIN_PORTAL_PREVIEW_SECTIONS.map((id) => {
                const icon = SECTION_ICONS[id];
                return (
                  <li key={id}>
                    <button
                      type="button"
                      data-preview-section={id}
                      onClick={() => openSection(id)}
                      className="inline-flex items-center gap-2 py-1 text-left text-[#3f3a34]"
                    >
                      {icon ? <PortalIcon name={icon} className="h-3.5 w-3.5 text-[#3f6b4e]" /> : null}
                      {previewSectionLabel(id, content)}
                    </button>
                  </li>
                );
              })}
            </ul>
            <label className="relative mt-3 block">
              <span className="sr-only">{content.nav.search}</span>
              <PortalIcon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#8a7568]"
              />
              <input
                id="preview-search-mobile"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={content.insights.searchPlaceholder}
                className="h-10 w-full rounded-full border border-[#e4d8c8] bg-white pr-3 pl-9 text-sm"
              />
            </label>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5 md:px-6 md:py-6">
        {section === "home" ? (
          <PreviewHome
            content={content}
            locale={locale}
            data={data}
            period={period}
            onPeriod={setPeriod}
            query={query}
            onOpen={openSection}
            writesDisabled={writesDisabled}
          />
        ) : null}
        {section === "journey" ? (
          <PreviewJourney content={content} locale={locale} data={data} writesDisabled={writesDisabled} />
        ) : null}
        {section === "sessions" ? (
          <PreviewSessions
            content={content}
            locale={locale}
            data={data}
            onOpen={openSection}
            writesDisabled={writesDisabled}
          />
        ) : null}
        {section === "insights" ? (
          <PreviewInsights
            content={content}
            locale={locale}
            data={data}
            query={query}
            category={category}
            onCategory={setCategory}
          />
        ) : null}
        {section === "journal" ? (
          <PreviewJournal content={content} locale={locale} data={data} query={query} />
        ) : null}
        {section === "trunks" ? <PreviewTrunks content={content} /> : null}
      </main>

      <PortalFooter content={content} locale={locale} />
    </div>
  );
}

function PreviewHome({
  content,
  locale,
  data,
  period,
  onPeriod,
  query,
  onOpen,
  writesDisabled,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  period: PreviewPeriod;
  onPeriod: (period: PreviewPeriod) => void;
  query: string;
  onOpen: (section: AdminPortalPreviewSection | CardTarget) => void;
  writesDisabled: boolean;
}) {
  const nextSession = data.sessions.find((session) => session.status === "SCHEDULED") ?? null;
  const lastSession = [...data.sessions].reverse().find((session) => session.status === "COMPLETED") ?? null;
  const insights = filterPreviewInsights(data.insights, query, "ALL");
  const growth = useMemo(() => {
    const inRange = filterPreviewAssessments(data.assessments, period, data.asOf);
    return {
      current: inRange[inRange.length - 1] ?? null,
      starting: inRange.length > 1 ? inRange[0] : null,
    };
  }, [data.asOf, data.assessments, period]);

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
              {nextSession
                ? formatWhen(nextSession.scheduledAt, data.timezone, locale)
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
                onChange={(event) => onPeriod(event.target.value as PreviewPeriod)}
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
                          tone={growthTone(dimension.key)}
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
                      <div
                        className="h-full rounded-full bg-[#7d9a78]"
                        style={{ width: `${Math.min(100, current * 10)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border border-[#eadfd2] bg-[#fbf7f1] p-4 text-sm text-[#6d675f]">
              {content.growth.empty}
            </p>
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
            <button
              type="button"
              onClick={() => onOpen("sessions")}
              className="inline-flex items-center gap-1 text-sm text-[#3f6b4e]"
            >
              {content.lastSession.viewAll}
              <PortalIcon name="chevronRight" className="h-3.5 w-3.5" />
            </button>
          </div>
          {lastSession ? (
            <div className="mt-3">
              <p className="text-sm text-[#6d675f]">
                {formatWhen(lastSession.scheduledAt, data.timezone, locale)}
              </p>
              <h3 className="mt-1 text-lg leading-snug">{lastSession.sessionType}</h3>
              <h4 className="mt-4 text-sm text-[#6d675f]">{content.lastSession.conclusions}</h4>
              {lastSession.takeaway ? (
                <p className="mt-2">{lastSession.takeaway}</p>
              ) : (
                <p className="mt-2 text-[#6d675f]">{content.lastSession.emptyConclusions}</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[#6d675f]">{content.lastSession.empty}</p>
          )}
        </section>

        <section className="portal-card portal-card-soft p-4 md:p-5">
          <div className="flex items-start gap-3">
            <PortalIconBadge name="notebookPen" tone="ivory" />
            <div className="min-w-0">
              <h2 className="portal-section-title">{content.focus.title}</h2>
              <p className="mt-1 text-sm text-[#6d675f]">{content.focus.subtitle}</p>
            </div>
          </div>
          <label className="mt-3 block text-sm text-[#5c564e]">
            {content.focus.label}
            <textarea
              readOnly
              value={data.preparationNote}
              className="mt-1.5 min-h-24 w-full rounded-xl border border-[#e4d8c8] bg-white px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={writesDisabled}
            className="mt-3 rounded-full bg-[#3f6b4e] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {content.focus.save}
          </button>
        </section>
      </div>

      <section className="layout-stack-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <PortalIconBadge name="notebook" tone="sand" />
            <div>
              <h2 className="portal-section-title text-[#2c2824]">{content.insights.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-[#6d675f]">{content.insights.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={writesDisabled}
            className="inline-flex h-10 items-center rounded-full bg-[#3f6b4e] px-4 text-sm text-white disabled:opacity-50"
          >
            {content.insights.add}
          </button>
        </div>
        {insights.length > 0 ? (
          <ul className="layout-stack-sm">
            {insights.map((insight) => (
              <li key={insight.id} className="rounded-2xl border border-[#eadfd2] bg-white/80 p-4">
                <p className="inline-flex items-center gap-1.5 text-sm text-[#6d675f]">
                  <PortalIcon name={insightIcon(insight.category)} className="h-3.5 w-3.5 text-[#3f6b4e]" />
                  {formatDay(insight.observedOn, locale)}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-[#2c2824]">{insight.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-[#eadfd2] bg-white/70 p-5 text-[#6d675f]">
            {content.insights.noMatches}
          </p>
        )}
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(([target, src, titleKey, bodyKey]) => (
          <button
            key={target}
            type="button"
            onClick={() => onOpen(target)}
            className="relative h-40 overflow-hidden rounded-3xl text-left sm:h-44"
          >
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-white">
              <span className="block font-display text-xl leading-tight">{content.cards[titleKey]}</span>
              <span className="mt-1 block text-sm text-white/85">{content.cards[bodyKey]}</span>
              <span className="mt-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 text-white">
                <span className="sr-only">{content.cards.open}</span>
                <PortalIcon name="arrowRight" className="h-3.5 w-3.5" />
              </span>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

function PreviewJourney({
  content,
  locale,
  data,
  writesDisabled,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  writesDisabled: boolean;
}) {
  const completed = data.timeline.filter((slot) => slot.status === "completed").length;
  const remaining = data.timeline.length - completed;
  const nextUnscheduled = data.timeline.find((slot) => slot.status === "not_scheduled");

  return (
    <div className="portal-stack">
      <header className="flex items-start gap-3">
        <PortalIconBadge name="sprout" tone="sage" />
        <div className="layout-stack-sm min-w-0">
          <h1 className="portal-page-title text-[#2c2824]">{content.journeyPage.title}</h1>
          <p className="max-w-2xl text-[#6d675f]">{content.journeyPage.description}</p>
        </div>
      </header>
      <section className="portal-card p-4 md:p-5">
        <p>
          {content.journeyPage.sessionProgress
            .replaceAll("{current}", "3")
            .replaceAll("{total}", String(data.timeline.length))}
        </p>
        <p className="mt-2 text-sm text-[#6d675f]">
          {completed} {content.journeyPage.completed} · {remaining} {content.journeyPage.remaining}
        </p>
        <ol className="mt-5">
          {data.timeline.map((slot, index) => {
            const isLast = index === data.timeline.length - 1;
            return (
              <li key={slot.sessionNumber} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm",
                      slot.status === "completed"
                        ? "border-[#3f6b4e] bg-[#e7f0ea] text-[#3f6b4e]"
                        : slot.status === "scheduled"
                          ? "border-[#3f6b4e] text-[#3f6b4e]"
                          : "border-[#eadfd2] text-[#a3988c]",
                    )}
                    aria-hidden
                  >
                    {slot.status === "completed" ? (
                      <PortalIcon name="check" className="h-3.5 w-3.5" />
                    ) : (
                      slot.sessionNumber
                    )}
                  </span>
                  {isLast ? null : <span className="mt-1 w-px flex-1 bg-[#eadfd2]" aria-hidden />}
                </div>
                <div className="min-w-0 flex-1 pb-5">
                  <p>
                    {content.journeyPage.sessionProgress
                      .replaceAll("{current}", String(slot.sessionNumber))
                      .replaceAll("{total}", String(data.timeline.length))}
                  </p>
                  <p className="mt-1 text-sm text-[#6d675f]">
                    {slot.scheduledAt
                      ? formatWhen(slot.scheduledAt, data.timezone, locale)
                      : content.journeyPage.notScheduled}
                  </p>
                  {slot.status === "completed" ? (
                    <p className="mt-2 text-sm text-[#3f6b4e]">{content.journeyPage.completed}</p>
                  ) : null}
                  {slot.status === "scheduled" ? (
                    <p className="mt-2 text-sm text-[#6d675f]">{content.sessionsPage.upcomingSession}</p>
                  ) : null}
                  {slot.status === "not_scheduled" && slot.sessionNumber === nextUnscheduled?.sessionNumber ? (
                    <button
                      type="button"
                      disabled={writesDisabled}
                      className="mt-2 rounded-full bg-[#3f6b4e] px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {content.sessionsPage.book}
                    </button>
                  ) : null}
                  {slot.status === "not_scheduled" && slot.sessionNumber !== nextUnscheduled?.sessionNumber ? (
                    <p className="mt-2 text-sm text-[#a3988c]">{content.journeyPage.notScheduled}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
      <section className="portal-card p-4 md:p-5">
        <h2 className="portal-section-title">{content.journeyPage.milestones}</h2>
        <div className="mt-4">
          <MilestoneTimeline
            milestones={data.milestones.map((milestone) => ({
              ...milestone,
              label: content.journeyPage.milestoneLabels[milestone.key],
            }))}
            labels={content.journeyPage.milestoneLabels}
          />
        </div>
      </section>
    </div>
  );
}

function PreviewSessions({
  content,
  locale,
  data,
  onOpen,
  writesDisabled,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  onOpen: (section: AdminPortalPreviewSection) => void;
  writesDisabled: boolean;
}) {
  const now = Date.parse(data.asOf);
  const upcoming = data.sessions.filter(
    (session) => session.status === "SCHEDULED" && Date.parse(session.scheduledAt) > now,
  );
  const past = data.sessions.filter((session) => !upcoming.some((item) => item.id === session.id));

  return (
    <div className="portal-stack">
      <header className="flex items-start gap-3">
        <PortalIconBadge name="calendar" tone="sand" />
        <div className="layout-stack-sm min-w-0">
          <h1 className="portal-page-title text-[#2c2824]">{content.sessionsPage.title}</h1>
          <p className="max-w-2xl text-[#6d675f]">{content.sessionsPage.description}</p>
        </div>
      </header>
      <section className="layout-stack-md">
        <h2 className="portal-section-title flex items-center gap-2">
          <PortalIconBadge name="calendar" tone="sand" className="h-8 w-8" />
          {content.sessionsPage.upcoming}
        </h2>
        <ul className="grid gap-3">
          {upcoming.map((session) => (
            <li key={session.id} className="portal-card p-4 md:p-5">
              <p className="text-sm text-[#3f6b4e]">
                {content.sessionsPage.sessionNumber.replaceAll("{number}", String(session.sessionNumber))}
              </p>
              <p className="mt-2">{session.sessionType}</p>
              <p className="mt-2 text-sm text-[#6d675f]">
                {formatWhen(session.scheduledAt, data.timezone, locale)}
              </p>
              <button
                type="button"
                onClick={() => onOpen("home")}
                className="mt-4 inline-flex items-center gap-1 text-sm text-[#3f6b4e]"
              >
                {content.sessionsPage.prepare}
                <PortalIcon name="chevronRight" className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={writesDisabled}
          className="rounded-full bg-[#3f6b4e] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {content.sessionsPage.book}
        </button>
      </section>
      <section className="layout-stack-md">
        <h2 className="portal-section-title flex items-center gap-2">
          <PortalIconBadge name="layers" tone="ivory" className="h-8 w-8" />
          {content.sessionsPage.past}
        </h2>
        <ul className="grid gap-3">
          {past.map((session) => (
            <li key={session.id} className="portal-card p-4 md:p-5">
              <p className="text-sm text-[#3f6b4e]">
                {content.sessionsPage.sessionNumber.replaceAll("{number}", String(session.sessionNumber))}
              </p>
              <p className="mt-2">{session.sessionType}</p>
              <p className="mt-2 text-sm text-[#6d675f]">
                {formatWhen(session.scheduledAt, data.timezone, locale)}
              </p>
              {session.rating ? (
                <p className="mt-3 text-sm">
                  {content.sessionsPage.reflection}: {session.rating}/5
                </p>
              ) : null}
              {session.takeaway ? (
                <p className="mt-2">
                  {content.sessionsPage.takeaway}: {session.takeaway}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PreviewInsights({
  content,
  locale,
  data,
  query,
  category,
  onCategory,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  query: string;
  category: PreviewInsightFilter;
  onCategory: (category: PreviewInsightFilter) => void;
}) {
  const visible = filterPreviewInsights(data.insights, query, category);
  const filters = [
    ["ALL", content.insights.all, "layers"],
    ["PATTERN", content.insights.pattern, "brain"],
    ["TRIGGER", content.insights.trigger, "heartPulse"],
    ["POSITIVE_OBSERVATION", content.insights.positive, "sprout"],
  ] as const;

  return (
    <div className="portal-stack">
      <header className="flex items-start gap-3">
        <PortalIconBadge name="notebook" tone="sand" />
        <div className="layout-stack-sm min-w-0">
          <h1 className="portal-page-title text-[#2c2824]">{content.insights.title}</h1>
          <p className="max-w-2xl text-[#6d675f]">{content.insights.subtitle}</p>
        </div>
      </header>
      <div className="flex flex-wrap gap-2" role="group" aria-label={content.insights.categoryLabel}>
        {filters.map(([key, label, icon]) => (
          <button
            key={key}
            type="button"
            aria-pressed={category === key}
            onClick={() => onCategory(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
              category === key
                ? "border-[#3f6b4e] bg-[#e7f0ea] text-[#2f5a40]"
                : "border-[#e4d8c8] text-[#6d675f]",
            )}
          >
            <PortalIcon name={icon} className="h-3.5 w-3.5" />
            {label}
            {key !== "ALL"
              ? ` (${data.insights.filter((entry) => entry.category === key).length})`
              : ` (${data.insights.length})`}
          </button>
        ))}
      </div>
      {visible.length > 0 ? (
        <ul className="layout-stack-sm">
          {visible.map((insight) => (
            <li key={insight.id} className="rounded-2xl border border-[#eadfd2] bg-white/80 p-4">
              <p className="inline-flex items-center gap-1.5 text-sm text-[#6d675f]">
                <PortalIcon name={insightIcon(insight.category)} className="h-3.5 w-3.5 text-[#3f6b4e]" />
                {formatDay(insight.observedOn, locale)} ·{" "}
                {insight.category === "PATTERN"
                  ? content.insights.pattern
                  : insight.category === "TRIGGER"
                    ? content.insights.trigger
                    : content.insights.positive}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[#2c2824]">{insight.content}</p>
              <p className="mt-2 text-sm text-[#6d675f]">
                {insight.visibility === "PRIVATE" ? content.insights.privateTitle : content.insights.sharedTitle}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-[#eadfd2] bg-white/70 p-5 text-[#6d675f]">
          {query.trim() || category !== "ALL" ? content.insights.noMatches : content.insights.empty}
        </p>
      )}
    </div>
  );
}

function PreviewJournal({
  content,
  locale,
  data,
  query,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  query: string;
}) {
  const entries = filterPreviewJournal(data.sessions, query);

  return (
    <div className="portal-stack">
      <header className="flex items-start gap-3">
        <PortalIconBadge name="layers" tone="ivory" />
        <div className="layout-stack-sm min-w-0">
          <h1 className="portal-page-title text-[#2c2824]">{content.cards.journalTitle}</h1>
          <p className="max-w-2xl text-[#6d675f]">{content.cards.journalBody}</p>
        </div>
      </header>
      {entries.length > 0 ? (
        <ul className="layout-stack-sm">
          {entries.map((session) => (
            <li key={session.id} className="portal-card p-4 md:p-5">
              <p className="inline-flex items-center gap-1.5 text-sm text-[#6d675f]">
                <PortalIcon name="notebook" className="h-3.5 w-3.5 text-[#3f6b4e]" />
                {formatWhen(session.scheduledAt, data.timezone, locale)}
              </p>
              <h2 className="portal-section-title mt-2">
                {content.sessionsPage.sessionNumber.replaceAll("{number}", String(session.sessionNumber))}
              </h2>
              <p className="mt-3">{session.takeaway}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-[#eadfd2] bg-white/70 p-5 text-[#6d675f]">
          {content.insights.noMatches}
        </p>
      )}
    </div>
  );
}

function PreviewTrunks({ content }: { content: PortalContent }) {
  return (
    <section className="portal-card p-5 md:p-6">
      <div className="flex items-center gap-3">
        <PortalIconBadge name="tree" tone="sage" />
        <h1 className="portal-page-title text-[#2c2824]">{content.trunksPage.title}</h1>
      </div>
      <p className="mt-3 max-w-2xl text-[#6d675f]">{content.trunksPage.empty}</p>
    </section>
  );
}
